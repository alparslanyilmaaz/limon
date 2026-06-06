use rusqlite::{params, Connection};

use crate::models::organisation::Organisation;

pub fn create(conn: &Connection, name: &str) -> Result<(), rusqlite::Error> {
    conn.execute(
        "
        INSERT INTO organisations (name)
        VALUES (?1)
        ",
        params![name],
    )?;

    Ok(())
}

pub fn find_all(conn: &Connection) -> Result<Vec<Organisation>, rusqlite::Error> {
    let mut stmt = conn.prepare_cached(
        "
        SELECT id, name, created_at
        FROM organisations
        ORDER BY id DESC
        ",
    )?;

    let organisations = stmt.query_map([], |row| {
        Ok(Organisation {
            id: row.get(0)?,
            name: row.get(1)?,
            created_at: row.get(2)?,
        })
    })?;

    let mut result = Vec::new();

    for organisation in organisations {
        result.push(organisation?);
    }

    Ok(result)
}

pub fn rename(conn: &Connection, id: i64, name: &str) -> Result<(), rusqlite::Error> {
    conn.execute(
        "UPDATE organisations SET name = ?1 WHERE id = ?2",
        params![name, id],
    )?;

    Ok(())
}

pub fn delete(conn: &Connection, id: i64) -> Result<(), rusqlite::Error> {
    conn.execute(
        "
        DELETE FROM organisations
        WHERE id = ?1
        ",
        params![id],
    )?;

    Ok(())
}
