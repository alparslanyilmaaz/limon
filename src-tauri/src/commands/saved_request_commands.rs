use crate::models::request::{RequestMinified, SavedRequest};
use crate::repositories::request_repository;
use crate::AppState;

#[tauri::command]
pub fn create_saved_request(
    state: tauri::State<AppState>,
    organisation_id: i64,
    folder_id: i64,
    name: String,
) -> Result<RequestMinified, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    request_repository::create(&conn, organisation_id, folder_id, &name)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_requests_for_folder(
    state: tauri::State<AppState>,
    folder_id: i64,
) -> Result<Vec<RequestMinified>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    request_repository::find_by_folder(&conn, folder_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_saved_request(
    state: tauri::State<AppState>,
    id: i64,
) -> Result<SavedRequest, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    request_repository::find_by_id(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_saved_request(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    request_repository::delete(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_saved_request(
    state: tauri::State<AppState>,
    id: i64,
    method: String,
    url: String,
    headers: Option<String>,
    body: Option<String>,
    body_type: String,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    request_repository::update(
        &conn,
        id,
        &method,
        &url,
        headers.as_deref(),
        body.as_deref(),
        &body_type,
    )
    .map_err(|e| e.to_string())
}
