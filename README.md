# GetAIzed Blog

A minimal, professional blog built with Jekyll featuring:

- **Clean, minimal design** with modern typography
- **Light/dark mode** with system preference detection
- **Glassy effects** with backdrop blur for modern aesthetics
- **Reading progress indicator** for better UX
- **Darker dark mode** for comfortable reading
- **Fully responsive** layout for all devices
- **Fast and lightweight** static site
- **WYSIWYG editor** for easy content creation

## Quick Start

### Easy Run Scripts

Use the provided scripts to start the blog and editor:

```bash
# Start both blog and editor
./start.sh

# Start only the blog
./start-blog.sh

# Start only the editor
./start-editor.sh
```

### Manual Setup

#### Prerequisites

- Ruby (version 4.0 or higher recommended)
- Node.js (for the editor)
- Bundler

#### Blog Setup

1. Install Ruby dependencies:
   ```bash
   bundle install
   ```

2. Start the Jekyll blog:
   ```bash
   export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
   bundle exec jekyll serve
   ```

3. Open your browser to `http://localhost:4000`

#### Editor Setup

1. Install Node dependencies:
   ```bash
   cd editor
   npm install
   ```

2. Start the editor:
   ```bash
   npm start
   ```

3. Open your browser to `http://localhost:8798`

## Features

### Blog Features

- **Professional Design**: Clean typography with glassmorphism effects
- **Dark Mode**: True dark mode with deeper blacks (#0a0a0a) for better contrast
- **Reading Progress**: Visual progress bar at the top of each page
- **Responsive**: Optimized for mobile, tablet, and desktop
- **Image Optimization**: Images are automatically sized and styled
- **Code Blocks**: Styled code blocks with syntax highlighting support

### Editor Features

- **WYSIWYG Editing**: Rich text editor with formatting toolbar
- **Image Upload**: Drag-and-drop image upload with automatic placement
- **Markdown Generation**: Converts rich text to Jekyll-compatible markdown
- **Post Management**: Create, preview, and delete posts
- **Auto-formatting**: Generates proper Jekyll front matter
- **Live Preview**: Preview markdown before publishing

## Customization

### Content

- Edit `_config.yml` to change site title, description, and other settings
- Add new posts using the WYSIWYG editor at `http://localhost:8798`
- Or manually add posts in the `_posts` directory with format `YYYY-MM-DD-title.md`
- Modify pages in the root directory (e.g., `about.md`)

### Styling

- Customize colors and fonts in `assets/css/style.css`
- The theme uses CSS variables for easy theming
- Glassy effects use `backdrop-filter` for modern aesthetics
- Responsive breakpoints are at 640px

### Theme Variables

Light mode:
- `--bg-primary`: #ffffff
- `--bg-secondary`: #f9fafb
- `--text-primary`: #111827
- `--accent-color`: #2563eb

Dark mode:
- `--bg-primary`: #0a0a0a (deep black)
- `--bg-secondary`: #141414
- `--text-primary`: #e5e5e5
- `--accent-color`: #3b82f6

## Deployment

This blog can be deployed to any static hosting service:

- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront

## Project Structure

```
.
├── _config.yml          # Jekyll configuration
├── _layouts/            # HTML templates
├── _posts/              # Blog posts
├── assets/
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   └── images/         # Uploaded images
├── editor/             # WYSIWYG editor
│   ├── public/         # Editor frontend
│   ├── server.js       # Editor backend
│   └── package.json    # Node dependencies
├── start.sh            # Start both services
├── start-blog.sh       # Start blog only
└── start-editor.sh     # Start editor only
```

## License

© 2026 GetAIzed. All rights reserved.
