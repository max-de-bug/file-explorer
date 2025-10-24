use arc_swap::ArcSwap;
use blake3;
use chrono::{DateTime, Utc};
use dirs_next::{document_dir, home_dir, picture_dir};
use once_cell::sync::Lazy;
use rayon::prelude::*;
use std::{collections::HashMap, fs, sync::Arc, time::UNIX_EPOCH};
use sysinfo::Disks;
use tauri::command;
use walkdir::WalkDir;

static FILE_INDEX: Lazy<ArcSwap<HashMap<String, Arc<FileInfo>>>> =
    Lazy::new(|| ArcSwap::new(Arc::new(HashMap::new())));

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct FileInfo {
    pub file_name: String,
    pub file_size: u64,
    pub modification_date: String,
    pub formatted_size: String,
    pub file_path: String,
    pub lower_name: String, // precomputed lowercase name for faster search
}

impl FileInfo {
    pub fn new(
        file_name: String,
        file_size: u64,
        modification_date: String,
        file_path: String,
    ) -> Self {
        let lower_name = file_name.to_lowercase();
        Self {
            file_name,
            file_size,
            modification_date,
            formatted_size: Self::format_size(file_size),
            file_path,
            lower_name,
        }
    }

    fn format_size(bytes: u64) -> String {
        const KB: u64 = 1024;
        const MB: u64 = KB * 1024;
        const GB: u64 = MB * 1024;
        const TB: u64 = GB * 1024;

        match bytes {
            0..KB => format!("{} B", bytes),
            KB..MB => format!("{:.1} KB", bytes as f64 / KB as f64),
            MB..GB => format!("{:.1} MB", bytes as f64 / MB as f64),
            GB..TB => format!("{:.1} GB", bytes as f64 / GB as f64),
            TB.. => format!("{:.1} TB", bytes as f64 / TB as f64),
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct DiskInfo {
    pub name: String,
    pub kind: String,
    pub total_space: u64,
    pub available_space: u64,
    pub used_space: u64,
    pub formatted_total: String,
    pub formatted_available: String,
    pub formatted_used: String,
}

impl DiskInfo {
    pub fn new(disk: &sysinfo::Disk) -> Self {
        let total = disk.total_space();
        let available = disk.available_space();
        let used = total - available;

        Self {
            name: disk.name().to_string_lossy().to_string(),
            kind: format!("{:?}", disk.kind()),
            total_space: total,
            available_space: available,
            used_space: used,
            formatted_total: FileInfo::format_size(total),
            formatted_available: FileInfo::format_size(available),
            formatted_used: FileInfo::format_size(used),
        }
    }
}

// ------------------- Async-safe, parallel build_index -------------------
#[tauri::command]
async fn build_index() -> Result<(), String> {
    let new_index = tokio::task::spawn_blocking(|| {
        let disks = Disks::new_with_refreshed_list();
        let mut combined_map = HashMap::new();

        for disk in disks.list() {
            let root = disk.mount_point();

            // Walk recursively, skip unreadable files
            let entries: Vec<_> = WalkDir::new(&root)
                .into_iter()
                .filter_map(|e| e.ok())
                .filter(|e| e.file_type().is_file())
                .collect();

            // Parallel processing with Rayon
            let map: HashMap<_, _> = entries
                .par_iter()
                .filter_map(|entry| {
                    let path = entry.path();
                    let name = path.file_name()?.to_str()?.to_string();
                    let metadata = entry.metadata().ok()?;
                    let file_size = metadata.len();

                    let modification_date = metadata
                        .modified()
                        .ok()
                        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
                        .and_then(|d| {
                            let timestamp = d.as_secs() as i64;
                            DateTime::<Utc>::from_timestamp(timestamp, 0)
                        })
                        .map(|dt| dt.to_rfc3339())
                        .unwrap_or_else(|| "Unknown".to_string());

                    let lower_name = name.to_lowercase();
                    let hash = blake3::hash(lower_name.as_bytes()).to_hex().to_string();

                    Some((
                        hash,
                        Arc::new(FileInfo {
                            file_name: name,
                            file_size,
                            modification_date,
                            formatted_size: FileInfo::format_size(file_size),
                            file_path: path.display().to_string(),
                            lower_name,
                        }),
                    ))
                })
                .collect();

            combined_map.extend(map);
        }

        Ok::<_, String>(combined_map)
    })
    .await
    .map_err(|e| e.to_string())??;

    // Atomic swap
    FILE_INDEX.store(Arc::new(new_index));

    Ok(())
}


// ------------------- Async-safe search_files -------------------

#[tauri::command]
async fn search_files(query: String) -> Result<Vec<FileInfo>, String> {
    let query_lower = query.trim().to_lowercase();

    if query_lower.is_empty() {
        return Ok(vec![]);
    }

    let index_snapshot = FILE_INDEX.load_full();

    let results = tokio::task::spawn_blocking(move || {
        let query_hash = blake3::hash(query_lower.as_bytes()).to_hex().to_string();

        // Exact hash match
        if let Some(file) = index_snapshot.get(&query_hash) {
            return vec![(*file).as_ref().clone()]; // deref Arc, clone FileInfo
        }

        // Substring search fallback
        index_snapshot
            .values()
            .filter(|file| file.lower_name.contains(&query_lower))
            .map(|file| (*file).as_ref().clone()) // deref Arc, clone
            .collect::<Vec<_>>()
    })
    .await
    .map_err(|e| format!("Task join error: {:?}", e))?;

    Ok(results)
}



#[command]
fn list_disks() -> Vec<DiskInfo> {
    let disks = Disks::new_with_refreshed_list();
    let mut disk_info = Vec::new();
    for disk in disks.list() {
        disk_info.push(DiskInfo::new(disk));
    }
    disk_info
}

#[command]
fn list_pictures() -> Result<Vec<FileInfo>, String> {
    let pictures_dir = picture_dir().ok_or("Could not determine Pictures directory".to_string())?;

    if !pictures_dir.exists() || !pictures_dir.is_dir() {
        return Err(format!(
            "Pictures folder not found or invalid: {:?}",
            pictures_dir
        ));
    }

    let mut files_info = Vec::new();
    for entry in fs::read_dir(&pictures_dir)
        .map_err(|e| format!("Failed to read Pictures folder: {:?}", e))?
    {
        if let Ok(entry) = entry {
            let file_path = entry.path();
            let file_name = file_path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_string();
            if let Ok(metadata) = entry.metadata() {
                let file_size = metadata.len();
                let modification_date = metadata
                    .modified()
                    .ok()
                    .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
                    .and_then(|d| DateTime::<Utc>::from_timestamp(d.as_secs() as i64, 0))
                    .map(|dt| dt.to_rfc3339())
                    .unwrap_or_else(|| "Unknown".to_string());

                let lower_name = file_name.to_lowercase();

                files_info.push(FileInfo {
                    file_name,
                    file_size,
                    modification_date,
                    formatted_size: FileInfo::format_size(file_size),
                    file_path: file_path.display().to_string(),
                    lower_name,
                });
            }
        }
    }

    Ok(files_info)
}

#[command]
fn list_downloads() -> Result<Vec<FileInfo>, String> {
    let downloads_dir = home_dir()
        .ok_or("Could not determine home directory".to_string())?
        .join("Downloads");

    if !downloads_dir.exists() || !downloads_dir.is_dir() {
        return Err(format!(
            "Downloads folder not found or invalid: {:?}",
            downloads_dir
        ));
    }

    let mut files_info = Vec::new();
    for entry in fs::read_dir(&downloads_dir)
        .map_err(|e| format!("Failed to read Downloads folder: {:?}", e))?
    {
        if let Ok(entry) = entry {
            let file_path = entry.path();
            let file_name = file_path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_string();
            if let Ok(metadata) = entry.metadata() {
                let file_size = metadata.len();
                let modification_date = metadata
                    .modified()
                    .ok()
                    .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
                    .and_then(|d| DateTime::<Utc>::from_timestamp(d.as_secs() as i64, 0))
                    .map(|dt| dt.to_rfc3339())
                    .unwrap_or_else(|| "Unknown".to_string());
                let lower_name = file_name.clone().to_lowercase();
                files_info.push(FileInfo {
                    file_name,
                    file_size,
                    modification_date,
                    formatted_size: FileInfo::format_size(file_size),
                    file_path: file_path.display().to_string(),
                    lower_name,
                });
            }
        }
    }

    Ok(files_info)
}

#[command]
fn list_documents() -> Result<Vec<FileInfo>, String> {
    let documents_dir =
        document_dir().ok_or("Could not determine Documents directory".to_string())?;

    if !documents_dir.exists() || !documents_dir.is_dir() {
        return Err(format!(
            "Documents folder not found or invalid: {:?}",
            documents_dir
        ));
    }

    let mut files_info = Vec::new();
    for entry in fs::read_dir(&documents_dir)
        .map_err(|e| format!("Failed to read Documents folder: {:?}", e))?
    {
        if let Ok(entry) = entry {
            let file_path = entry.path();
            let file_name = file_path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_string();
            if let Ok(metadata) = entry.metadata() {
                let file_size = metadata.len();
                let modification_date = metadata
                    .modified()
                    .ok()
                    .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
                    .and_then(|d| DateTime::<Utc>::from_timestamp(d.as_secs() as i64, 0))
                    .map(|dt| dt.to_rfc3339())
                    .unwrap_or_else(|| "Unknown".to_string());
                let lower_name = file_name.to_lowercase();

                files_info.push(FileInfo {
                    file_name,
                    file_size,
                    modification_date,
                    formatted_size: FileInfo::format_size(file_size),
                    file_path: file_path.display().to_string(),
                    lower_name,
                });
            }
        }
    }

    Ok(files_info)
}
// You can keep your list_pictures, list_downloads, list_documents commands as before
// They don’t need modifications for ArcSwap

// ------------------- Tauri run -------------------

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            list_disks,
            list_downloads,
            list_documents,
            list_pictures,
            search_files,
            build_index
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
