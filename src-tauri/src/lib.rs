mod commands;
mod db;
mod models;
mod repositories;

use db::{connection::establish_connection, migrations::run_migrations};
use std::sync::Mutex;
use tauri::Manager;

use commands::env_var_commands::{create_env_var, delete_env_var, get_env_vars, update_env_var};
use commands::folder_commands::{create_folder, delete_folder, get_child_folders, get_folders};
use commands::organisation_commands::{
    create_organisation, delete_organisation, get_organisations, rename_organisation,
};
use commands::request_commands::send_request;
use commands::saved_request_commands::{
    create_saved_request, delete_saved_request, get_requests_for_folder, get_saved_request,
    update_saved_request,
};

pub struct AppState {
    pub conn: Mutex<rusqlite::Connection>,
    pub http_client: reqwest::Client,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&data_dir)?;
            let db_path = data_dir.join("app.db");
            let conn = establish_connection(&db_path);
            run_migrations(&conn);
            app.manage(AppState {
                conn: Mutex::new(conn),
                http_client: reqwest::Client::new(),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_organisation,
            delete_organisation,
            rename_organisation,
            get_organisations,
            create_folder,
            get_folders,
            get_child_folders,
            delete_folder,
            send_request,
            create_saved_request,
            get_requests_for_folder,
            get_saved_request,
            update_saved_request,
            delete_saved_request,
            get_env_vars,
            create_env_var,
            update_env_var,
            delete_env_var,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
