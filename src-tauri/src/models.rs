use chrono::{DateTime, Utc};
use std::time::UNIX_EPOCH;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct FileInfo {
    pub file_name: String,
    pub file_size: u64,
    pub modification_date: String,
    pub formatted_size: String,
    pub file_path: String,
    pub lower_name: String, // precomputed lowercase name for faster search
    pub file_type: String, // "file", "directory", "symlink", or "unknown"
}

impl FileInfo {
    pub fn new(
        file_name: String,
        file_size: u64,
        modification_date: String,
        file_path: String,
        file_type: String,
    ) -> Self {
        let lower_name = file_name.to_lowercase();
        Self {
            file_name,
            file_size,
            modification_date,
            formatted_size: Self::format_size(file_size),
            file_path,
            lower_name,
            file_type,
        }
    }

    pub fn format_size(bytes: u64) -> String {
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

    pub fn from_metadata(
        file_name: String,
        file_path: String,
        metadata: &std::fs::Metadata,
    ) -> Self {
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

        // Determine file type from metadata
        let file_type = if metadata.is_dir() {
            "directory".to_string()
        } else if metadata.is_file() {
            "file".to_string()
        } else if metadata.is_symlink() {
            "symlink".to_string()
        } else {
            "unknown".to_string()
        };

        Self::new(file_name, file_size, modification_date, file_path, file_type)
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

