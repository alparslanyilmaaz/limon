use rusqlite::Row;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Folder {
    pub id: i64,
    pub organisation_id: i64,
    pub parent_folder_id: Option<i64>,
    pub name: String,
    pub created_at: String,
}

impl Folder {
    pub fn from_row(row: &Row) -> rusqlite::Result<Self> {
        Ok(Self {
            id: row.get(0)?,
            organisation_id: row.get(1)?,
            parent_folder_id: row.get(2)?,
            name: row.get(3)?,
            created_at: row.get(4)?,
        })
    }
}
