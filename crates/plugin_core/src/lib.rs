use serde::{Deserialize, Serialize};
use surrealdb::Surreal;
use surrealdb::engine::local::IndxDb;
use surrealdb::RecordId;
use wasm_bindgen::prelude::*;

#[derive(Debug, Serialize)]
struct Bookmark<'a> {
    title: &'a str,
    url: &'a str,
}

#[derive(Debug, Deserialize)]
struct Record {
    id: RecordId,
}

#[wasm_bindgen]
pub async fn save_stack(title: &str, url: &str) -> Result<JsValue, JsValue> {
    // Create an IndexedDB-backed database connection
    let db = Surreal::new::<IndxDb>("stackfinder").await.map_err(|e| e.to_string())?;

    // Select a specific namespace / database
    db.use_ns("stackfinder").use_db("bookmarks").await.map_err(|e| e.to_string())?;

    // Create a new bookmark
    let bookmark: Option<Record> = db
        .create("bookmark")
        .content(Bookmark { title, url })
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(JsValue::from_serde(&bookmark).unwrap())
}
