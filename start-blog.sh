#!/bin/bash

# Start Jekyll Blog only

echo "📝 Starting Jekyll blog on port 4000..."
cd "$(dirname "$0")"
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
/opt/homebrew/opt/ruby/bin/bundle exec jekyll serve

echo "📖 Blog: http://localhost:4000"
