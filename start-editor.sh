#!/bin/bash

# Start Editor only

echo "✏️  Starting editor on port 8798..."
cd "$(dirname "$0")/editor"
npm start

echo "✏️  Editor: http://localhost:8798"
