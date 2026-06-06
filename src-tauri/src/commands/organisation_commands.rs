use crate::models::organisation::Organisation;
use crate::repositories::organisation_repository;
use crate::AppState;

#[tauri::command]
pub fn create_organisation(state: tauri::State<AppState>, name: String) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    organisation_repository::create(&conn, &name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn rename_organisation(
    state: tauri::State<AppState>,
    id: i64,
    name: String,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    organisation_repository::rename(&conn, id, &name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_organisation(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    organisation_repository::delete(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_organisations(state: tauri::State<AppState>) -> Result<Vec<Organisation>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    organisation_repository::find_all(&conn).map_err(|e| e.to_string())
}
