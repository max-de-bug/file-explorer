use chrono::{DateTime, Utc};
use dirs_next::{document_dir, home_dir, picture_dir};
use std::{fs, path::Path, time::UNIX_EPOCH};
use tauri::command;
use walkdir::WalkDir;

use crate::models::FileInfo;

/// Helper function to detect file type from a path
/// Returns a string describing the type: "file", "directory", "symlink", or "unknown"
pub fn detect_file_type(path: &Path) -> String {
    if !path.exists() {
        return "not_found".to_string();
    }

    // Method 1: Using Path methods (convenient but may follow symlinks)
    if path.is_dir() {
        return "directory".to_string();
    }
    if path.is_file() {
        return "file".to_string();
    }
    if path.is_symlink() {
        return "symlink".to_string();
    }

    // Method 2: Using metadata (more accurate, can check symlink targets)
    if let Ok(metadata) = fs::metadata(path) {
        if metadata.is_dir() {
            return "directory".to_string();
        }
        if metadata.is_file() {
            return "file".to_string();
        }
        if metadata.is_symlink() {
            return "symlink".to_string();
        }
    }

    "unknown".to_string()
}

/// Helper function to get detailed file type information
pub fn get_file_type_info(path: &Path) -> (String, bool, bool, bool) {
    let exists = path.exists();
    let is_file = path.is_file();
    let is_dir = path.is_dir();
    let is_symlink = path.is_symlink();

    let file_type = if !exists {
        "not_found"
    } else if is_dir {
        "directory"
    } else if is_file {
        "file"
    } else if is_symlink {
        "symlink"
    } else {
        "unknown"
    };

    (file_type.to_string(), is_file, is_dir, is_symlink)
}

/// Determines file type from metadata using a match statement
fn get_file_type_from_metadata(metadata: &fs::Metadata) -> String {
    match (metadata.is_dir(), metadata.is_file(), metadata.is_symlink()) {
        (true, _, _) => "directory".to_string(),
        (_, true, _) => "file".to_string(),
        (_, _, true) => "symlink".to_string(),
        _ => "unknown".to_string(),
    }
}

/// Recursively calculate the total size of a directory
/// Returns the sum of all file sizes within the directory and its subdirectories
fn calculate_directory_size(dir_path: &Path) -> u64 {
    let mut total_size = 0u64;
    
    for entry in WalkDir::new(dir_path).into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.is_file() {
            if let Ok(metadata) = fs::metadata(path) {
                total_size += metadata.len();
            }
        }
    }
    
    total_size
}

#[command]
pub fn list_pictures() -> Result<Vec<FileInfo>, String> {
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
            
            // DETECTING FILE TYPES - Multiple methods available:
            // Method 1: Using Path methods (simple, but may follow symlinks)
            // let is_file = file_path.is_file();
            // let is_dir = file_path.is_dir();
            // let is_symlink = file_path.is_symlink();
            
            // Method 2: Using metadata (more accurate, checks actual file type)
            if let Ok(metadata) = entry.metadata() {
                // Check file type using metadata
                // Uncomment these to use file type detection:
                // let is_file = metadata.is_file();
                // let is_dir = metadata.is_dir();
                // let is_symlink = metadata.is_symlink();
                
                // Filter: Only process files (skip directories)
                // Uncomment the next line to skip directories:
                // if metadata.is_dir() { continue; }
                
                // Filter: Only process directories (skip files)
                // Uncomment the next line to skip files:
                // if metadata.is_file() { continue; }
                
                let file_name = file_path
                    .file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("")
                    .to_string();
                
                // Determine file type from metadata using match
                let is_directory = metadata.is_dir();
                let file_type = get_file_type_from_metadata(&metadata);
                
                // Calculate size: for directories, recursively sum all files; for files, use metadata.len()
                let file_size = if is_directory {
                    calculate_directory_size(&file_path)
                } else {
                    metadata.len()
                };
                
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
                    file_type,
                });
            }
        }
    }

    Ok(files_info)
}

#[command]
pub fn list_downloads() -> Result<Vec<FileInfo>, String> {
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
                // Determine file type from metadata using match
                let is_directory = metadata.is_dir();
                let file_type = get_file_type_from_metadata(&metadata);
                
                // Calculate size: for directories, recursively sum all files; for files, use metadata.len()
                let file_size = if is_directory {
                    calculate_directory_size(&file_path)
                } else {
                    metadata.len()
                };
                
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
                    file_type,
                });
            }
        }
    }

    Ok(files_info)
}

#[command]
pub fn list_documents() -> Result<Vec<FileInfo>, String> {
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
                // Determine file type from metadata using match
                let is_directory = metadata.is_dir();
                let file_type = get_file_type_from_metadata(&metadata);
                
                // Calculate size: for directories, recursively sum all files; for files, use metadata.len()
                let file_size = if is_directory {
                    calculate_directory_size(&file_path)
                } else {
                    metadata.len()
                };
                
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
                    file_type,
                });
            }
        }
    }

    Ok(files_info)
}

/// Example command demonstrating how to detect files, folders, and other types
/// This function lists all entries in a directory and categorizes them
/// Returns: Vec of (name, type_string, is_file, is_dir, is_symlink)
#[command]
pub fn list_directory_contents(dir_path: String) -> Result<Vec<(String, String, bool, bool, bool)>, String> {
    let path = Path::new(&dir_path);
    
    // Check if path exists
    if !path.exists() {
        return Err(format!("Path does not exist: {}", dir_path));
    }
    
    // Check if it's a directory
    if !path.is_dir() {
        return Err(format!("Path is not a directory: {}", dir_path));
    }
    
    let mut results = Vec::new();
    
    for entry in fs::read_dir(path)
        .map_err(|e| format!("Failed to read directory: {:?}", e))?
    {
        if let Ok(entry) = entry {
            let file_path = entry.path();
            let file_name = file_path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_string();
            
            // Multiple ways to detect file type:
            
            // Method 1: Using Path methods (may follow symlinks)
            let _is_file_path = file_path.is_file();
            let _is_dir_path = file_path.is_dir();
            let _is_symlink_path = file_path.is_symlink();
            
            // Method 2: Using metadata (more reliable, checks actual type)
            let (is_file_meta, is_dir_meta, is_symlink_meta) = if let Ok(metadata) = entry.metadata() {
                (metadata.is_file(), metadata.is_dir(), metadata.is_symlink())
            } else {
                (false, false, false)
            };
            
            // Method 3: Using our helper function
            let file_type = detect_file_type(&file_path);
            
            // Store results: (name, type, is_file, is_dir, is_symlink)
            results.push((
                file_name,
                file_type,
                is_file_meta,
                is_dir_meta,
                is_symlink_meta,
            ));
        }
    }
    
    Ok(results)
}

