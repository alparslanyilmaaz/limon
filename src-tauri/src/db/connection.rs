use rusqlite::Connection;
use std::path::Path;

pub fn establish_connection(db_path: &Path) -> Connection {
    Connection::open(db_path).expect("failed to connect to sqlite")
}
