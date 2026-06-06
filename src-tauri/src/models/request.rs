use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct RequestMinified {
    pub id: i64,
    pub folder_id: i64,
    pub name: String,
    pub method: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SavedRequest {
    pub id: i64,
    pub folder_id: i64,
    pub name: String,
    pub method: String,
    pub url: String,
    pub headers: Option<String>,
    pub body: Option<String>,
    pub body_type: String,
}
