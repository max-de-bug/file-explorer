use sysinfo::Disks;
use tauri::command;

use crate::models::DiskInfo;

#[command]
pub fn list_disks() -> Vec<DiskInfo> {
    let disks = Disks::new_with_refreshed_list();
    let mut disk_info = Vec::new();
    
    // Collect ALL disks - don't filter any out
    // This ensures all drives (C:, D:, etc.) are included
    for disk in disks.list() {
        disk_info.push(DiskInfo::new(disk));
    }
    
    disk_info
}

