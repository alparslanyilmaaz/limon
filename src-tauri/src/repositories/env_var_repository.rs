use rusqlite::{params, Connection};

use crate::models::env_var::EnvVar;

pub fn find_by_org(conn: &Connection, org_id: i64) -> Result<Vec<EnvVar>, rusqlite::Error> {
    let mut stmt = conn.prepare_cached(
        "SELECT id, organisation_id, name, value FROM environment_variables WHERE organisation_id = ?1 ORDER BY name ASC",
    )?;
    let rows = stmt.query_map(params![org_id], |row| {
        Ok(EnvVar {
            id: row.get(0)?,
            organisation_id: row.get(1)?,
            name: row.get(2)?,
            value: row.get(3)?,
        })
    })?;
    let mut result = Vec::new();
    for row in rows {
        result.push(row?);
    }
    Ok(result)
}

pub fn create(
    conn: &Connection,
    org_id: i64,
    name: &str,
    value: &str,
) -> Result<EnvVar, rusqlite::Error> {
    conn.execute(
        "INSERT INTO environment_variables (organisation_id, name, value) VALUES (?1, ?2, ?3)",
        params![org_id, name, value],
    )?;
    let id = conn.last_insert_rowid();
    Ok(EnvVar { id, organisation_id: org_id, name: name.to_string(), value: value.to_string() })
}

pub fn update(conn: &Connection, id: i64, name: &str, value: &str) -> Result<(), rusqlite::Error> {
    conn.execute(
        "UPDATE environment_variables SET name = ?1, value = ?2 WHERE id = ?3",
        params![name, value, id],
    )?;
    Ok(())
}

pub fn delete(conn: &Connection, id: i64) -> Result<(), rusqlite::Error> {
    conn.execute("DELETE FROM environment_variables WHERE id = ?1", params![id])?;
    Ok(())
}
