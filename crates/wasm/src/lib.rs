use wasm_bindgen::prelude::*;
use surrealdb::engine::any::connect;
use surrealdb::opt::auth::Root;

#[wasm_bindgen(start)]
pub async fn run() -> Result<(), JsValue> {
    // Connect to SurrealDB
    let db = connect("ws://localhost:8000").await.map_err(|e| JsValue::from_str(&e.to_string()))?;

    // Sign in to the database
    db.signin(Root {
        username: "root",
        password: "root",
    }).await.map_err(|e| JsValue::from_str(&e.to_string()))?;

    // Use a specific namespace and database
    db.use_ns("namespace").use_db("database").await.map_err(|e| JsValue::from_str(&e.to_string()))?;

    // Example query
    let query = "SELECT * FROM table";
    let result = db.query(query).await.map_err(|e| JsValue::from_str(&e.to_string()))?;

    // Log the result
    web_sys::console::log_1(&JsValue::from_str(&format!("{:?}", result)));

    Ok(())
}
