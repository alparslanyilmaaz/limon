use rusqlite::{params, Connection};

use crate::models::request::{RequestMinified, SavedRequest};

pub fn create(
    conn: &Connection,
    organisation_id: i64,
    folder_id: i64,
    name: &str,
) -> Result<RequestMinified, rusqlite::Error> {
    conn.execute(
        "INSERT INTO requests (organisation_id, folder_id, name, method, url, body_type) VALUES (?1, ?2, ?3, 'GET', '', 'none')",
        params![organisation_id, folder_id, name],
    )?;
    let id = conn.last_insert_rowid();
    Ok(RequestMinified { id, folder_id, name: name.to_string(), method: "GET".to_string() })
}

pub fn find_by_folder(conn: &Connection, folder_id: i64) -> Result<Vec<RequestMinified>, rusqlite::Error> {
    let mut stmt = conn.prepare_cached(
        "SELECT id, folder_id, name, method FROM requests WHERE folder_id = ?1 ORDER BY id DESC",
    )?;
    let rows = stmt.query_map(params![folder_id], |row| {
        Ok(RequestMinified {
            id: row.get(0)?,
            folder_id: row.get(1)?,
            name: row.get(2)?,
            method: row.get(3)?,
        })
    })?;
    let mut result = Vec::new();
    for row in rows { result.push(row?); }
    Ok(result)
}

pub fn find_by_id(conn: &Connection, id: i64) -> Result<SavedRequest, rusqlite::Error> {
    conn.query_row(
        "SELECT id, folder_id, name, method, url, headers, body, body_type FROM requests WHERE id = ?1",
        params![id],
        |row| {
            Ok(SavedRequest {
                id: row.get(0)?,
                folder_id: row.get(1)?,
                name: row.get(2)?,
                method: row.get(3)?,
                url: row.get(4)?,
                headers: row.get(5)?,
                body: row.get(6)?,
                body_type: row.get::<_, Option<String>>(7)?.unwrap_or_else(|| "none".to_string()),
            })
        },
    )
}

pub fn delete(conn: &Connection, id: i64) -> Result<(), rusqlite::Error> {
    conn.execute("DELETE FROM requests WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn update(
    conn: &Connection,
    id: i64,
    method: &str,
    url: &str,
    headers: Option<&str>,
    body: Option<&str>,
    body_type: &str,
) -> Result<(), rusqlite::Error> {
    conn.execute(
        "UPDATE requests SET method = ?1, url = ?2, headers = ?3, body = ?4, body_type = ?5 WHERE id = ?6",
        params![method, url, headers, body, body_type, id],
    )?;
    Ok(())
}
