use arc_swap::ArcSwap;
use blake3;
use chrono::{DateTime, Utc};
use once_cell::sync::Lazy;
use rayon::prelude::*;
use std::{collections::HashMap, sync::Arc, time::UNIX_EPOCH};
use sysinfo::Disks;
use walkdir::WalkDir;

use crate::models::FileInfo;

static FILE_INDEX: Lazy<ArcSwap<HashMap<String, Arc<FileInfo>>>> =
    Lazy::new(|| ArcSwap::new(Arc::new(HashMap::new())));

#[tauri::command]
pub async fn build_index() -> Result<(), String> {
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
                            file_type: "file".to_string(), // Index only contains files (filtered on line 28)
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

#[tauri::command]
pub async fn search_files(query: String) -> Result<Vec<FileInfo>, String> {
    let query_lower = query.trim().to_lowercase();

    if query_lower.is_empty() {
        return Ok(vec![]);
    }

    let index_snapshot = FILE_INDEX.load_full();

    let results = tokio::task::spawn_blocking(move || {
        let query_hash = blake3::hash(query_lower.as_bytes()).to_hex().to_string();

        // Exact hash match (only works for exact filename matches)
        if let Some(file) = index_snapshot.get(&query_hash) {
            return vec![(*file).as_ref().clone()];
        }

        // Substring search fallback - search in lowercase file names
        index_snapshot
            .values()
            .filter(|file| file.lower_name.contains(&query_lower))
            .map(|file| (*file).as_ref().clone())
            .collect::<Vec<_>>()
    })
    .await
    .map_err(|e| format!("Task join error: {:?}", e))?;

    Ok(results)
}

