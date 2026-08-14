// DOM Elements
const editor = document.getElementById('editor');
const postTitle = document.getElementById('postTitle');
const postDate = document.getElementById('postDate');
const postTags = document.getElementById('postTags');
const publishBtn = document.getElementById('publishBtn');
const clearBtn = document.getElementById('clearBtn');
const previewBtn = document.getElementById('previewBtn');
const imageBtn = document.getElementById('imageBtn');
const imageInput = document.getElementById('imageInput');
const previewModal = document.getElementById('previewModal');
const closePreview = document.getElementById('closePreview');
const copyMarkdown = document.getElementById('copyMarkdown');
const markdownPreview = document.getElementById('markdownPreview');
const postsList = document.getElementById('postsList');
const pageTitle = document.querySelector('.page-title');

// Track if editing existing post
let editingFilename = null;

// Initialize date input with current date
const now = new Date();
now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
postDate.value = now.toISOString().slice(0, 16);

// Toolbar functionality
document.querySelectorAll('.toolbar-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const command = btn.dataset.command;
    const value = btn.dataset.value || null;

    if (command === 'createLink') {
      const url = prompt('Enter URL:');
      if (url) {
        document.execCommand(command, false, url);
      }
    } else if (command === 'formatBlock') {
      document.execCommand(command, false, value);
    } else {
      document.execCommand(command, false, value);
    }
    
    editor.focus();
  });
});

// Image upload functionality
imageBtn.addEventListener('click', () => {
  imageInput.click();
});

imageInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      const imgHtml = `<img src="${data.url}" alt="${file.name}" style="max-width: 100%; height: auto;">`;
      document.execCommand('insertHTML', false, imgHtml);
      showNotification('Image uploaded successfully!', 'success');
    } else {
      showNotification('Failed to upload image', 'error');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    showNotification('Error uploading image', 'error');
  }

  imageInput.value = '';
});

// Convert HTML to Markdown
function htmlToMarkdown(html) {
  let markdown = html;

  // Handle images
  markdown = markdown.replace(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/gi, (match, src, alt) => {
    return `![${alt || 'image'}](${src})`;
  });
  markdown = markdown.replace(/<img[^>]+src="([^"]+)"[^>]*>/gi, (match, src) => {
    return `![](${src})`;
  });

  // Handle links
  markdown = markdown.replace(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi, '[$2]($1)');

  // Handle headings
  markdown = markdown.replace(/<h1[^>]*>([^<]+)<\/h1>/gi, '# $1');
  markdown = markdown.replace(/<h2[^>]*>([^<]+)<\/h2>/gi, '## $1');
  markdown = markdown.replace(/<h3[^>]*>([^<]+)<\/h3>/gi, '### $1');
  markdown = markdown.replace(/<h4[^>]*>([^<]+)<\/h4>/gi, '#### $1');
  markdown = markdown.replace(/<h5[^>]*>([^<]+)<\/h5>/gi, '##### $1');
  markdown = markdown.replace(/<h6[^>]*>([^<]+)<\/h6>/gi, '###### $1');

  // Handle bold
  markdown = markdown.replace(/<strong[^>]*>([^<]+)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>([^<]+)<\/b>/gi, '**$1**');

  // Handle italic
  markdown = markdown.replace(/<em[^>]*>([^<]+)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>([^<]+)<\/i>/gi, '*$1*');

  // Handle strikethrough
  markdown = markdown.replace(/<s[^>]*>([^<]+)<\/s>/gi, '~~$1~~');
  markdown = markdown.replace(/<strike[^>]*>([^<]+)<\/strike>/gi, '~~$1~~');
  markdown = markdown.replace(/<del[^>]*>([^<]+)<\/del>/gi, '~~$1~~');

  // Handle underline (not standard markdown, convert to emphasis)
  markdown = markdown.replace(/<u[^>]*>([^<]+)<\/u>/gi, '_$1_');

  // Handle code blocks
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```');
  markdown = markdown.replace(/<code[^>]*>([^<]+)<\/code>/gi, '`$1`');

  // Handle blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
    const lines = content.replace(/<[^>]+>/g, '').split('\n');
    return lines.map(line => `> ${line.trim()}`).join('\n');
  });

  // Handle unordered lists
  markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
    const items = content.match(/<li[^>]*>([^<]*)<\/li>/gi) || [];
    return items.map(item => {
      const text = item.replace(/<li[^>]*>|<\/li>/gi, '').trim();
      return `- ${text}`;
    }).join('\n');
  });

  // Handle ordered lists
  markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
    const items = content.match(/<li[^>]*>([^<]*)<\/li>/gi) || [];
    return items.map((item, index) => {
      const text = item.replace(/<li[^>]*>|<\/li>/gi, '').trim();
      return `${index + 1}. ${text}`;
    }).join('\n');
  });

  // Handle line breaks and paragraphs
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
  markdown = markdown.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n');
  markdown = markdown.replace(/<p[^>]*>([^<]+)<\/p>/gi, '$1\n\n');
  markdown = markdown.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1\n');

  // Clean up remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, '');

  // Clean up excessive whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.trim();

  return markdown;
}

// Preview functionality
previewBtn.addEventListener('click', () => {
  const markdown = htmlToMarkdown(editor.innerHTML);
  markdownPreview.textContent = markdown;
  previewModal.classList.add('active');
});

closePreview.addEventListener('click', () => {
  previewModal.classList.remove('active');
});

copyMarkdown.addEventListener('click', () => {
  navigator.clipboard.writeText(markdownPreview.textContent).then(() => {
    showNotification('Markdown copied to clipboard!', 'success');
  });
});

previewModal.addEventListener('click', (e) => {
  if (e.target === previewModal) {
    previewModal.classList.remove('active');
  }
});

// Publish post
publishBtn.addEventListener('click', async () => {
  const title = postTitle.value.trim();
  const content = htmlToMarkdown(editor.innerHTML);
  const date = postDate.value;
  const tags = postTags.value.trim();

  if (!title) {
    showNotification('Please enter a post title', 'error');
    return;
  }

  if (!editor.innerHTML.trim() || editor.innerHTML === '<br>') {
    showNotification('Please add some content', 'error');
    return;
  }

  try {
    let response;
    let data;

    if (editingFilename) {
      // Update existing post
      response = await fetch(`/api/posts/${editingFilename}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          content,
          date,
          tags
        })
      });
      data = await response.json();

      if (data.success) {
        showNotification('Post updated successfully!', 'success');
        clearEditor();
        loadPosts();
      } else {
        showNotification('Failed to update post', 'error');
      }
    } else {
      // Create new post
      response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          content,
          date,
          tags
        })
      });
      data = await response.json();

      if (data.success) {
        showNotification('Post published successfully!', 'success');
        clearEditor();
        loadPosts();
      } else {
        showNotification('Failed to publish post', 'error');
      }
    }
  } catch (error) {
    console.error('Error publishing/updating post:', error);
    showNotification('Error publishing/updating post', 'error');
  }
});

// Clear editor
clearBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear the editor?')) {
    clearEditor();
  }
});

function clearEditor() {
  postTitle.value = '';
  postTags.value = '';
  editor.innerHTML = '';
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  postDate.value = now.toISOString().slice(0, 16);
  editingFilename = null;
  pageTitle.textContent = 'New Post';
  publishBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
    Publish
  `;
}

// Load post for editing
async function loadPostForEditing(filename) {
  try {
    const response = await fetch(`/api/posts/${filename}`);
    const data = await response.json();
    
    if (data.success) {
      postTitle.value = data.title;
      postTags.value = data.tags;
      editor.innerHTML = data.content;
      
      // Format date for datetime-local input
      if (data.date) {
        const dateObj = new Date(data.date);
        dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
        postDate.value = dateObj.toISOString().slice(0, 16);
      }
      
      editingFilename = data.filename;
      pageTitle.textContent = 'Edit Post';
      publishBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        Update
      `;
      
      showNotification('Post loaded for editing', 'success');
    } else {
      showNotification('Failed to load post', 'error');
    }
  } catch (error) {
    console.error('Error loading post:', error);
    showNotification('Error loading post', 'error');
  }
}

// Load existing posts
async function loadPosts() {
  try {
    const response = await fetch('/api/posts');
    const data = await response.json();
    
    postsList.innerHTML = '';
    
    if (data.posts && data.posts.length > 0) {
      data.posts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        postItem.innerHTML = `
          <span class="post-name">${post}</span>
          <div class="post-actions">
            <button class="edit-btn" data-filename="${post}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="delete-btn" data-filename="${post}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        `;
        postsList.appendChild(postItem);
      });

      // Add edit functionality
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const filename = e.currentTarget.dataset.filename;
          await loadPostForEditing(filename);
        });
      });

      // Add delete functionality
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const filename = e.currentTarget.dataset.filename;
          if (confirm(`Are you sure you want to delete ${filename}?`)) {
            try {
              const response = await fetch(`/api/posts/${filename}`, {
                method: 'DELETE'
              });
              const data = await response.json();
              
              if (data.success) {
                showNotification('Post deleted successfully', 'success');
                loadPosts();
              } else {
                showNotification('Failed to delete post', 'error');
              }
            } catch (error) {
              console.error('Error deleting post:', error);
              showNotification('Error deleting post', 'error');
            }
          }
        });
      });
    } else {
      postsList.innerHTML = '<p style="color: var(--text-muted); font-style: italic; font-size: 0.875rem;">No posts yet. Create your first post!</p>';
    }
  } catch (error) {
    console.error('Error loading posts:', error);
    postsList.innerHTML = '<p style="color: #dc3545; font-size: 0.875rem;">Error loading posts</p>';
  }
}

// Show notification
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Load posts on page load
loadPosts();
