// Module declarations
pub mod models;
pub mod index;
pub mod disks;
pub mod directories;

// Re-export public types for convenience
pub use models::{FileInfo, DiskInfo};

// ------------------- Tauri run -------------------

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            disks::list_disks,
            directories::list_downloads,
            directories::list_documents,
            directories::list_pictures,
            directories::list_directory_contents,
            index::search_files,
            index::build_index
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
