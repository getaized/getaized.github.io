const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 8798;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../assets/images');
    fs.mkdir(uploadDir, { recursive: true }).then(() => {
      cb(null, uploadDir);
    }).catch(err => cb(err));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// API Routes

// Upload image
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ 
    success: true, 
    filename: req.file.filename,
    url: `/assets/images/${req.file.filename}`
  });
});

// Create new post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, date, tags } = req.body;
    
    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Format date for filename
    const dateObj = date ? new Date(date) : new Date();
    const dateStr = dateObj.toISOString().split('T')[0];
    const filename = `${dateStr}-${slug}.md`;
    
    // Generate front matter
    const frontMatter = `---
layout: post
title: ${title}
date: ${dateObj.toISOString()}
${tags ? `tags: [${tags}]` : ''}
---

`;

    // Combine front matter with content
    const fullContent = frontMatter + content;
    
    // Write to _posts directory
    const postsDir = path.join(__dirname, '../_posts');
    await fs.mkdir(postsDir, { recursive: true });
    
    const filePath = path.join(postsDir, filename);
    await fs.writeFile(filePath, fullContent, 'utf8');
    
    res.json({ 
      success: true, 
      filename: filename,
      path: filePath
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// List existing posts
app.get('/api/posts', async (req, res) => {
  try {
    const postsDir = path.join(__dirname, '../_posts');
    const files = await fs.readdir(postsDir);
    const posts = files.filter(f => f.endsWith('.md'));
    res.json({ posts });
  } catch (error) {
    res.json({ posts: [] });
  }
});

// Get single post content
app.get('/api/posts/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../_posts', filename);
    const content = await fs.readFile(filePath, 'utf8');
    
    // Parse front matter
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (frontMatterMatch) {
      const frontMatter = frontMatterMatch[1];
      const body = frontMatterMatch[2];
      
      // Parse front matter
      const titleMatch = frontMatter.match(/title: (.+)/);
      const dateMatch = frontMatter.match(/date: (.+)/);
      const tagsMatch = frontMatter.match(/tags: \[(.+)\]/);
      
      res.json({
        success: true,
        title: titleMatch ? titleMatch[1].trim() : '',
        date: dateMatch ? dateMatch[1].trim() : '',
        tags: tagsMatch ? tagsMatch[1].trim() : '',
        content: body.trim(),
        filename: filename
      });
    } else {
      res.json({
        success: true,
        title: '',
        date: '',
        tags: '',
        content: content,
        filename: filename
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update post
app.put('/api/posts/:filename', async (req, res) => {
  try {
    const { title, content, date, tags } = req.body;
    const oldFilename = req.params.filename;
    
    // Generate new slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Format date for filename
    const dateObj = date ? new Date(date) : new Date();
    const dateStr = dateObj.toISOString().split('T')[0];
    const newFilename = `${dateStr}-${slug}.md`;
    
    // Generate front matter
    const frontMatter = `---
layout: post
title: ${title}
date: ${dateObj.toISOString()}
${tags ? `tags: [${tags}]` : ''}
---

`;

    // Combine front matter with content
    const fullContent = frontMatter + content;
    
    // Write to _posts directory
    const postsDir = path.join(__dirname, '../_posts');
    await fs.mkdir(postsDir, { recursive: true });
    
    const filePath = path.join(postsDir, newFilename);
    await fs.writeFile(filePath, fullContent, 'utf8');
    
    // Delete old file if filename changed
    if (oldFilename !== newFilename) {
      const oldFilePath = path.join(postsDir, oldFilename);
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        // File might not exist, ignore
      }
    }
    
    res.json({ 
      success: true, 
      filename: newFilename,
      path: filePath
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete post
app.delete('/api/posts/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../_posts', filename);
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Editor server running at http://localhost:${PORT}`);
});
