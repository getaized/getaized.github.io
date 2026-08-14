#!/bin/bash

# Start Jekyll Blog and Editor

echo "🚀 Starting GetAIzed Blog and Editor..."

# Start Jekyll blog
echo "📝 Starting Jekyll blog on port 4000..."
cd "$(dirname "$0")"
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
/opt/homebrew/opt/ruby/bin/bundle exec jekyll serve &
JEKYLL_PID=$!

# Start editor
echo "✏️  Starting editor on port 8798..."
cd "$(dirname "$0")/editor"
npm start &
EDITOR_PID=$!

echo ""
echo "✅ Services started!"
echo "📖 Blog: http://localhost:4000"
echo "✏️  Editor: http://localhost:8798"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for both processes
wait $JEKYLL_PID $EDITOR_PID
