use crate::models::folder::Folder;
use crate::repositories::folder_repository;
use crate::AppState;

#[tauri::command]
pub fn create_folder(
    state: tauri::State<AppState>,
    organisation_id: i64,
    parent_folder_id: Option<i64>,
    name: String,
) -> Result<Folder, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    folder_repository::create(&conn, organisation_id, parent_folder_id, &name)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_folders(
    state: tauri::State<AppState>,
    organisation_id: i64,
) -> Result<Vec<Folder>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    folder_repository::find_by_organisation(&conn, organisation_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_child_folders(
    state: tauri::State<AppState>,
    parent_folder_id: i64,
) -> Result<Vec<Folder>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    folder_repository::get_children(&conn, parent_folder_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_folder(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    folder_repository::delete(&conn, id).map_err(|e| e.to_string())
}
