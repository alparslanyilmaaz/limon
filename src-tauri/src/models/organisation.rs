use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Organisation {
    pub id: i64,
    pub name: String,
    pub created_at: String,
}
