#!/bin/bash

set -e

# Navigate to the wasm crate directory
cd crates/wasm

echo "Building the WASM package..."
wasm-pack build --target web --out-dir ../../wasm/pkg

echo "Build complete. WASM package is located in wasm/pkg."
