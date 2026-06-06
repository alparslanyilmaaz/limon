use rusqlite::Connection;

pub fn run_migrations(conn: &Connection) {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS organisations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS folders (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            organisation_id  INTEGER NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
            parent_folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
            name             TEXT    NOT NULL,
            created_at       TEXT    DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS environment_variables (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            organisation_id INTEGER NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
            name            TEXT    NOT NULL,
            value           TEXT    NOT NULL DEFAULT '',
            created_at      TEXT    DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS requests (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            organisation_id  INTEGER NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
            folder_id        INTEGER REFERENCES folders(id) ON DELETE CASCADE,
            name             TEXT    NOT NULL,
            method           TEXT    NOT NULL DEFAULT 'GET',
            url              TEXT    NOT NULL DEFAULT '',
            headers          TEXT,
            body             TEXT,
            body_type        TEXT    NOT NULL DEFAULT 'none',
            created_at       TEXT    DEFAULT CURRENT_TIMESTAMP
        );
        ",
    )
    .expect("failed to run migrations");

    // Add body_type to existing installs that predate the column
    let _ = conn.execute(
        "ALTER TABLE requests ADD COLUMN body_type TEXT NOT NULL DEFAULT 'none'",
        [],
    );
}
