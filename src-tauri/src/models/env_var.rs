use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct EnvVar {
    pub id: i64,
    pub organisation_id: i64,
    pub name: String,
    pub value: String,
}
