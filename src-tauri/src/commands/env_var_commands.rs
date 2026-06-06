use crate::models::env_var::EnvVar;
use crate::repositories::env_var_repository;
use crate::AppState;

#[tauri::command]
pub fn get_env_vars(
    state: tauri::State<AppState>,
    organisation_id: i64,
) -> Result<Vec<EnvVar>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    env_var_repository::find_by_org(&conn, organisation_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_env_var(
    state: tauri::State<AppState>,
    organisation_id: i64,
    name: String,
    value: String,
) -> Result<EnvVar, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    env_var_repository::create(&conn, organisation_id, &name, &value).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_env_var(
    state: tauri::State<AppState>,
    id: i64,
    name: String,
    value: String,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    env_var_repository::update(&conn, id, &name, &value).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_env_var(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    env_var_repository::delete(&conn, id).map_err(|e| e.to_string())
}
