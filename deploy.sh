#!/bin/bash

# Exit on error
set -e

echo "============================================="
echo "  GetAIzed: Static Compilation & Deployment  "
echo "============================================="

# Ensure we are in the project root directory
cd "$(dirname "$0")"

# 1. Install dependencies
echo "📦 Step 1: Installing Ruby dependencies..."
bundle install

# 2. Check for Git repository and remote
git_repo_found=false
remote_url=""
username=""
repo_name=""

if [ -d .git ]; then
    git_repo_found=true
    if git remote get-url origin >/dev/null 2>&1; then
        remote_url=$(git remote get-url origin)
        echo "🔗 Detected Git remote origin: $remote_url"
        
        # Parse username and repo name from URL
        if [[ $remote_url =~ github\.com[:/]([^/]+)/([^.]+)(\.git)? ]]; then
            username="${BASH_REMATCH[1]}"
            repo_name="${BASH_REMATCH[2]}"
            echo "👤 GitHub Username: $username"
            echo "📁 Repository Name: $repo_name"
        fi
    fi
fi

# 3. Determine baseurl and url
default_url="https://username.github.io"
default_baseurl=""

if [ -n "$username" ] && [ -n "$repo_name" ]; then
    default_url="https://${username}.github.io"
    if [ "${repo_name}" = "${username}.github.io" ]; then
        default_baseurl=""
    else
        default_baseurl="/${repo_name}"
    fi
fi

# Ask for confirmation of settings
echo ""
echo "--- Configuration ---"
echo "Configure your GitHub Pages URL parameters:"
read -p "Site URL (default: $default_url): " custom_url
url=${custom_url:-$default_url}

read -p "Subfolder path / baseurl (default: $default_baseurl): " custom_baseurl
baseurl=${custom_baseurl:-$default_baseurl}

# 4. Generate temporary Jekyll config override
config_override="_config_production_override.yml"
echo "📝 Creating temporary production configuration..."
cat << EOF > "$config_override"
# Auto-generated for deployment
url: "$url"
baseurl: "$baseurl"
EOF

# 5. Compile the static site
echo ""
echo "⚙️  Step 2: Compiling Jekyll site for production..."
JEKYLL_ENV=production bundle exec jekyll build --config _config.yml,"$config_override"

# Clean up temp config
rm "$config_override"
echo "✅ Compilation complete! Static site generated in: _site/"

# 6. Optional deployment
if [ "$git_repo_found" = true ] && [ -n "$remote_url" ]; then
    echo ""
    echo "--- Deployment ---"
    read -p "Do you want to deploy the compiled '_site' to the 'gh-pages' branch of your origin remote? (y/n): " do_deploy
    if [[ "$do_deploy" =~ ^[Yy]$ ]]; then
        echo "🚀 Preparing deployment to branch 'gh-pages'..."
        
        # Save absolute path to project root
        project_root=$(pwd)
        
        # Navigate to _site
        cd _site
        
        # Initialize temp repository
        git init
        git checkout -b gh-pages
        git add .
        git commit -m "Deploy static site to GitHub Pages [skip ci]"
        
        # Add remote and force push
        git remote add origin "$remote_url"
        echo "Pushing compiled files to GitHub..."
        git push -f origin gh-pages
        
        # Clean up local git in _site
        rm -rf .git
        
        # Return to project root
        cd "$project_root"
        
        echo ""
        echo "🎉 Deployment successful!"
        if [ -n "$baseurl" ]; then
            echo "🌐 Your blog should be live at: $url$baseurl"
        else
            echo "🌐 Your blog should be live at: $url"
        fi
    else
        echo "ℹ️  Deployment skipped. You can manually copy the contents of '_site/' to your hosting provider."
    fi
else
    echo ""
    echo "ℹ️  No Git remote origin found. To deploy to GitHub Pages automatically via this script:"
    echo "  1. Initialize git: git init"
    echo "  2. Add your remote: git remote add origin https://github.com/username/repository.git"
    echo "  3. Commit your changes: git add . && git commit -m 'Initial commit'"
    echo "  4. Run this script again."
fi
