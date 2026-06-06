use rusqlite::{params, Connection};

use crate::models::folder::Folder;

pub fn create(
    conn: &Connection,
    organisation_id: i64,
    parent_folder_id: Option<i64>,
    name: &str,
) -> Result<Folder, rusqlite::Error> {
    conn.execute(
        "INSERT INTO folders (organisation_id, parent_folder_id, name) VALUES (?1, ?2, ?3)",
        params![organisation_id, parent_folder_id, name],
    )?;
    let id = conn.last_insert_rowid();
    conn.query_row("SELECT * FROM folders WHERE id = ?1", params![id], Folder::from_row)
}

pub fn find_by_organisation(conn: &Connection, organisation_id: i64) -> Result<Vec<Folder>, rusqlite::Error> {
    let mut stmt = conn.prepare_cached(
        "SELECT * FROM folders WHERE organisation_id = ?1 AND parent_folder_id IS NULL ORDER BY id DESC",
    )?;
    let rows = stmt.query_map(params![organisation_id], Folder::from_row)?;
    let mut result = Vec::new();
    for row in rows { result.push(row?); }
    Ok(result)
}

pub fn get_children(conn: &Connection, parent_folder_id: i64) -> Result<Vec<Folder>, rusqlite::Error> {
    let mut stmt = conn.prepare_cached(
        "SELECT * FROM folders WHERE parent_folder_id = ?1 ORDER BY id DESC",
    )?;
    let rows = stmt.query_map(params![parent_folder_id], Folder::from_row)?;
    let mut result = Vec::new();
    for row in rows { result.push(row?); }
    Ok(result)
}

pub fn delete(conn: &Connection, id: i64) -> Result<(), rusqlite::Error> {
    conn.execute("DELETE FROM folders WHERE id = ?1", params![id])?;
    Ok(())
}
