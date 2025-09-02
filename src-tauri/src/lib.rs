use std::{fs, time::UNIX_EPOCH};
use chrono::{DateTime, Utc};
use tauri::command;
use dirs_next::home_dir;
use sysinfo::Disks;

#[derive(serde::Serialize, serde::Deserialize)]
#[derive(Debug)]
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

#[derive(serde::Serialize, serde::Deserialize)]
#[derive(Debug)]  // Deriving Debug here

pub struct FileInfo {
    pub file_name: String,
    pub file_size: u64,
    pub modification_date: String,
    pub formatted_size: String,
}

impl FileInfo {
    pub fn new(file_name: String, file_size: u64, modification_date: String) -> Self {
        Self {
            file_name,
            file_size,
            modification_date,
            formatted_size: Self::format_size(file_size),
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
// List all disks on the system
#[tauri::command]
fn list_disks() -> Vec<DiskInfo> {
    let disks = Disks::new_with_refreshed_list();
    let mut disk_info = Vec::new();
    for disk in disks.list() {
        disk_info.push(DiskInfo::new(disk));
    }
    disk_info
}

// List files in the user's Downloads folder

#[command]
fn list_downloads() -> Result<Vec<FileInfo>, String> {
    // Get the user's home directory
    let home_dir = home_dir().ok_or_else(|| "Could not determine home directory".to_string())?;

    // Construct the Downloads folder path
    let downloads_dir = home_dir.join("Downloads");

    // Check if the Downloads folder exists and is a directory
    if !downloads_dir.exists() {
        return Err(format!("Downloads folder not found: {:?}", downloads_dir));
    }
    if !downloads_dir.is_dir() {
        return Err(format!("Path is not a directory: {:?}", downloads_dir));
    }

    // Read the contents of the Downloads directory
    let entries = fs::read_dir(&downloads_dir).map_err(|e| {
        format!("Failed to read the Downloads folder: {:?}", e)
    })?;

    let mut files_info = Vec::new();
    // Iterate over the directory entries and collect file info
    for entry in entries {
        if let Ok(entry) = entry {
            let file_name = entry.file_name().to_string_lossy().into_owned();
            
            if let Ok(metadata) = entry.metadata() {
                // Get the file size
                let file_size = metadata.len();
                
                // Get the last modification time
                let modification_time = metadata.modified().ok();
                let modification_date = modification_time
                    .and_then(|time| time.duration_since(UNIX_EPOCH).ok())
                    .map_or_else(
                        || "Unknown".to_string(), // Default to "Unknown" if None
                        |duration| {
                            let utc_datetime = DateTime::<Utc>::from_timestamp(duration.as_secs() as i64, 0);
                            utc_datetime.expect("Reason").to_rfc3339() // Format the DateTime as RFC3339
                        }
                    );

                // Add the file info to the result
                files_info.push(FileInfo {
                    file_name,
                    file_size,
                    modification_date,
                    formatted_size: FileInfo::format_size(file_size),
                });
            }
        }
    }

    Ok(files_info)
}
#[command]
fn list_documents() -> Result<Vec<FileInfo>, String> {
    // Get the Documents folder path using the dirs crate
    let documents_dir = dirs::document_dir().ok_or_else(|| "Could not determine Documents directory".to_string())?;

    // Check if the Documents folder exists and is a directory
    if !documents_dir.exists() {
        return Err(format!("Documents folder not found: {:?}", documents_dir));
    }
    if !documents_dir.is_dir() {
        return Err(format!("Path is not a directory: {:?}", documents_dir));
    }

    // Read the contents of the Documents directory
    let entries = fs::read_dir(&documents_dir).map_err(|e| {
        format!("Failed to read the Documents folder: {:?}", e)
    })?;

    let mut files_info = Vec::new();

    // Iterate over the directory entries and collect file info
    for entry in entries {
        if let Ok(entry) = entry {
            let file_name = entry.file_name().to_string_lossy().into_owned();

            if let Ok(metadata) = entry.metadata() {
                let file_size = metadata.len();

                // Get the modification date
                let modification_date = match metadata.modified() {
                    Ok(time) => {
                        let duration_since_epoch = time.duration_since(UNIX_EPOCH).unwrap_or_default();
                        let datetime = chrono::NaiveDateTime::from_timestamp_opt(duration_since_epoch.as_secs() as i64, 0);
                        datetime.map_or("Unknown".to_string(), |dt| dt.to_string())
                    }
                    Err(_) => "Unknown".to_string(),
                };

                // Add the file info to the result
                files_info.push(FileInfo {
                    file_name,
                    file_size,
                    modification_date,
                    formatted_size: FileInfo::format_size(file_size),
                });
            }
        }
    }

    Ok(files_info)
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![list_disks, list_downloads, list_documents]) // Add list_downloads here
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
