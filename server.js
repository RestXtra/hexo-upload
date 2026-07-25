const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const matter = require('gray-matter');
const multer = require('multer');

const app = express();
const PORT = 3210;

let HEXO_DIR = process.env.HEXO_DIR || loadConfig().hexoDir || path.resolve(__dirname, '..', 'myblog');
let POSTS_DIR = path.join(HEXO_DIR, 'source', '_posts');
let IMAGES_DIR = path.join(HEXO_DIR, 'source', 'images');
let THEME_CONFIG = path.join(HEXO_DIR, 'themes', 'redefine', '_config.yml');

function updateHexoPaths(newDir) {
  HEXO_DIR = newDir;
  POSTS_DIR = path.join(HEXO_DIR, 'source', '_posts');
  IMAGES_DIR = path.join(HEXO_DIR, 'source', 'images');
  THEME_CONFIG = path.join(HEXO_DIR, 'themes', 'redefine', '_config.yml');
  ensureDir(IMAGES_DIR);
}

const CONFIG_FILE = path.join(__dirname, 'config.json');

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch (e) { /* ignore */ }
  return {};
}

function saveConfig(data) {
  const current = loadConfig();
  Object.assign(current, data);
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(current, null, 2), 'utf8');
}

app.use(express.json({ limit: '50mb' }));

ensureDir(IMAGES_DIR);
app.use('/images', express.static(IMAGES_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMAGES_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const name = Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
    cb(null, name);
  }
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

const clientDist = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getAllPosts() {
  const posts = [];
  function walk(dir, relative = '') {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.isDirectory()) {
        walk(path.join(dir, item.name), path.join(relative, item.name));
      } else if (item.name.endsWith('.md')) {
        const filePath = path.join(dir, item.name);
        try {
          const raw = fs.readFileSync(filePath, 'utf8');
          const parsed = matter(raw);
          const stat = fs.statSync(filePath);
          posts.push({
            slug: path.join(relative, item.name).replace(/\\/g, '/'),
            title: parsed.data.title || item.name.replace('.md', ''),
            date: parsed.data.date ? new Date(parsed.data.date).toISOString() : stat.mtime.toISOString(),
            tags: parsed.data.tags || [],
            categories: parsed.data.categories || [],
            excerpt: parsed.data.excerpt || parsed.data.description || (parsed.content || '').substring(0, 120).replace(/[#*`\[\]>]/g, '').trim(),
            published: parsed.data.published !== false
          });
        } catch (e) {
          const stat = fs.statSync(filePath);
          posts.push({
            slug: path.join(relative, item.name).replace(/\\/g, '/'),
            title: item.name.replace('.md', ''),
            date: stat.mtime.toISOString(),
            tags: [], categories: [],
            excerpt: '', published: true
          });
        }
      }
    }
  }
  walk(POSTS_DIR);
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}

function getPost(slug) {
  const filePath = path.join(POSTS_DIR, slug);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  return { slug, frontmatter: parsed.data, content: parsed.content, raw };
}

function savePost(slug, frontmatter, content) {
  const filePath = path.join(POSTS_DIR, slug);
  ensureDir(path.dirname(filePath));
  const fm = {};
  for (const [k, v] of Object.entries(frontmatter)) {
    if (v !== undefined && v !== null && v !== '') fm[k] = v;
  }
  // Normalize: use 'excerpt' key (Hexo maps this to post.excerpt), migrate from 'description'
  if (fm.description && !fm.excerpt) {
    fm.excerpt = fm.description;
  }
  delete fm.description;
  if (!fm.date) fm.date = new Date().toISOString();
  const output = matter.stringify(content, fm);
  fs.writeFileSync(filePath, output, 'utf8');
  return true;
}

function deletePost(slug) {
  const filePath = path.join(POSTS_DIR, slug);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

app.get('/api/posts', (req, res) => {
  try { res.json(getAllPosts()); } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/posts/:slug', (req, res) => {
  try {
    const post = getPost(req.params.slug);
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json(post);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/posts', (req, res) => {
  try {
    const { title, tags, categories, content, published, excerpt } = req.body;
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const slug = `${dateStr}-${(title || 'untitled').replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '-').replace(/-+/g, '-').substring(0, 60)}.md`;
    const frontmatter = {
      title: title || 'Untitled',
      date: date.toISOString(),
      tags: tags || [],
      categories: categories || [],
      published: published !== false
    };
    if (excerpt) frontmatter.excerpt = excerpt;
    savePost(slug, frontmatter, content || '');
    res.json({ success: true, slug });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/posts/:slug', (req, res) => {
  try {
    const { frontmatter, content } = req.body;
    savePost(req.params.slug, frontmatter, content);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/posts/:slug', (req, res) => {
  try {
    deletePost(req.params.slug);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/categories', (req, res) => {
  const posts = getAllPosts();
  const cats = new Set();
  posts.forEach(p => {
    if (Array.isArray(p.categories)) p.categories.forEach(c => cats.add(c));
    else if (p.categories) cats.add(p.categories);
  });
  res.json([...cats].sort());
});

app.get('/api/tags', (req, res) => {
  const posts = getAllPosts();
  const tags = new Set();
  posts.forEach(p => {
    if (Array.isArray(p.tags)) p.tags.forEach(t => tags.add(t));
    else if (p.tags) tags.add(p.tags);
  });
  res.json([...tags].sort());
});

app.post('/api/upload-image', (req, res, next) => {
  // slug comes from URL query string (parsed by Express before any body middleware)
  const slug = req.query.slug || '';
  const articleDir = slug ? slug.replace(/\.md$/, '').replace(/[\\/]/g, '-').replace(/[^a-zA-Z0-9一-鿿_-]/g, '') : '_common';

  const targetDir = path.join(IMAGES_DIR, articleDir);
  ensureDir(targetDir);

  const perArticleStorage = multer.diskStorage({
    destination: (req2, file, cb) => cb(null, targetDir),
    filename: (req2, file, cb) => {
      const ext = path.extname(file.originalname) || '.png';
      const name = Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
      cb(null, name);
    }
  });

  multer({ storage: perArticleStorage, limits: { fileSize: 20 * 1024 * 1024 } }).single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ code: 1, msg: err.message, data: null });
    if (!req.file) return res.status(400).json({ code: 1, msg: 'No file', data: null });

    const url = `/images/${articleDir}/${req.file.filename}`;
    res.json({ code: 0, msg: '', data: { originalURL: url, url } });
  });
});

function readThemeConfig() {
  const raw = fs.readFileSync(THEME_CONFIG, 'utf8');
  const extract = (key, parent = null) => {
    const lines = raw.split('\n');
    let inSection = !parent;
    let level = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const indent = line.match(/^(\s*)/)[1].length;
      if (parent && line.trim() === parent + ':') { inSection = true; level = indent; continue; }
      if (inSection && parent && indent <= level && line.trim() !== '') inSection = false;
      if (inSection && line.trim().startsWith(key + ':')) {
        return line.replace(/^[^:]+:\s*/, '').trim().replace(/^['"]|['"]$/g, '');
      }
    }
    return '';
  };
  const extractArray = (key, parent) => {
    const lines = raw.split('\n');
    let inSection = false;
    let level = 0;
    let items = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const indent = line.match(/^(\s*)/)[1].length;
      if (line.trim() === parent + ':') { inSection = true; level = indent; continue; }
      if (inSection && indent <= level && line.trim() !== '') inSection = false;
      if (inSection && line.trim().startsWith(key + ':')) {
        inSection = false;
        for (let j = i + 1; j < lines.length; j++) {
          const l = lines[j];
          const d = l.match(/^(\s*)/)[1].length;
          if (d <= indent + 2 && l.trim() !== '') break;
          const m = l.match(/^\s*-\s+(.+)/);
          if (m) items.push(m[1].replace(/^['"]|['"]$/g, ''));
        }
      }
    }
    return items;
  };
  return {
    avatar: extract('avatar', 'defaults'),
    bannerLight: extract('light', 'image'),
    bannerDark: extract('dark', 'image'),
    title: extract('title', 'home_banner'),
    subtitle: extractArray('text', 'subtitle')
  };
}

function updateThemeConfigValue(content, section, key, newValue) {
  const lines = content.split('\n');
  let inSection = false;
  let level = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const indent = line.match(/^(\s*)/)[1].length;
    if (line.trim() === section + ':') { inSection = true; level = indent; continue; }
    if (inSection && indent <= level && line.trim() !== '') inSection = false;
    if (inSection && line.trim().startsWith(key + ':')) {
      const before = line.substring(0, line.indexOf(':') + 1);
      lines[i] = before + ' ' + newValue;
      return lines.join('\n');
    }
  }
  return content;
}

function updateThemeConfigSubtitle(content, texts) {
  const lines = content.split('\n');
  let inSubtitle = false;
  let inText = false;
  let subtitleLevel = 0;
  let textLevel = 0;
  let textLineIdx = -1;
  let startIdx = -1;
  let endIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const indent = line.match(/^(\s*)/)[1].length;
    const t = line.trim();
    if (t === 'subtitle:') { inSubtitle = true; subtitleLevel = indent; continue; }
    if (inSubtitle && indent <= subtitleLevel && t !== '') inSubtitle = false;
    // Match both 'text:' (bare key) and 'text: []' (inline empty array with optional comment)
    if (inSubtitle && t.startsWith('text:')) { inText = true; textLevel = indent; textLineIdx = i; startIdx = i + 1; continue; }
    if (inText && indent <= textLevel && t !== '') { endIdx = i; break; }
  }
  if (textLineIdx === -1) return content;
  // Clean the text: line — remove inline value/comment, keep just the key
  lines[textLineIdx] = ' '.repeat(textLevel) + 'text:';
  const prefix = ' '.repeat(textLevel + 2);
  const newLines = texts.map(t => prefix + '- ' + JSON.stringify(t));
  const before = lines.slice(0, startIdx);
  const after = endIdx > 0 ? lines.slice(endIdx) : [];
  return [...before, ...newLines, ...after].join('\n');
}

app.get('/api/theme-config', (req, res) => {
  try {
    res.json(readThemeConfig());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/theme-config', (req, res) => {
  try {
    let content = fs.readFileSync(THEME_CONFIG, 'utf8');
    const { avatar, bannerLight, bannerDark, title, subtitle } = req.body;
    if (avatar !== undefined) content = updateThemeConfigValue(content, 'defaults', 'avatar', avatar);
    if (bannerLight !== undefined) content = updateThemeConfigValue(content, 'image', 'light', bannerLight);
    if (bannerDark !== undefined) content = updateThemeConfigValue(content, 'image', 'dark', bannerDark);
    if (title !== undefined) content = updateThemeConfigValue(content, 'home_banner', 'title', title);
    if (subtitle !== undefined) content = updateThemeConfigSubtitle(content, subtitle);
    fs.writeFileSync(THEME_CONFIG, content, 'utf8');
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMAGES_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const name = Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
    cb(null, name);
  }
});
const profileUpload = multer({ storage: profileStorage, limits: { fileSize: 20 * 1024 * 1024 } });

app.post('/api/upload-profile-image', profileUpload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const type = req.body.type || 'image';
  const ext = path.extname(req.file.originalname) || '.png';

  let fixedName;
  if (type === 'avatar') fixedName = 'avatar' + ext;
  else if (type === 'banner-light') fixedName = 'banner-light' + ext;
  else if (type === 'banner-dark') fixedName = 'banner-dark' + ext;
  else fixedName = req.file.filename;

  const oldPath = path.join(IMAGES_DIR, req.file.filename);
  const newPath = path.join(IMAGES_DIR, fixedName);
  if (oldPath !== newPath && fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
  }

  const url = '/images/' + fixedName;
  if (type === 'avatar' || type === 'banner-light' || type === 'banner-dark') {
    let content = fs.readFileSync(THEME_CONFIG, 'utf8');
    if (type === 'avatar') content = updateThemeConfigValue(content, 'defaults', 'avatar', url);
    else if (type === 'banner-light') content = updateThemeConfigValue(content, 'image', 'light', url);
    else if (type === 'banner-dark') content = updateThemeConfigValue(content, 'image', 'dark', url);
    fs.writeFileSync(THEME_CONFIG, content, 'utf8');
  }
  res.json({ success: true, url });
});

app.post('/api/deploy', (req, res) => {
  try {
    res.json({ status: 'deploying', message: '开始部署...' });
    exec('npx hexo clean && npx hexo generate && npx hexo deploy', {
      cwd: HEXO_DIR, maxBuffer: 1024 * 1024 * 10
    }, (error, stdout, stderr) => {
      if (error) console.error('Deploy failed:', error.message);
      else console.log('Deploy success:', stdout);
    });
  } catch (e) { console.error('Deploy error:', e.message); }
});

app.post('/api/sync-source', (req, res) => {
  try {
    res.json({ status: 'syncing', message: '开始同步源码...' });
    const syncScript = [
      `cd "${HEXO_DIR}" && git add -A`,
      `cd "${HEXO_DIR}" && git commit -m "deploy: update blog source" || true`,
      `cd "${HEXO_DIR}" && git push origin master`
    ].join(' && ');
    exec(syncScript, {
      cwd: HEXO_DIR, maxBuffer: 1024 * 1024 * 10
    }, (error, stdout, stderr) => {
      if (error) console.error('Source sync failed:', error.message);
      else console.log('Source sync success:\n', stdout);
    });
  } catch (e) { console.error('Source sync error:', e.message); }
});

app.post('/api/generate', (req, res) => {
  exec('npx hexo clean && npx hexo generate', {
    cwd: HEXO_DIR, maxBuffer: 1024 * 1024 * 10
  }, (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, message: '生成完成' });
  });
});

app.post('/api/preview', (req, res) => {
  exec('npx hexo server', {
    cwd: HEXO_DIR, maxBuffer: 1024 * 1024 * 10
  }, (error) => {
    if (error) console.error('Preview error:', error.message);
  });
  res.json({ success: true, url: 'http://localhost:4000' });
});

app.get('/api/hexo-info', (req, res) => {
  res.json({ hexoDir: HEXO_DIR, postsDir: POSTS_DIR, postsCount: getAllPosts().length });
});

app.post('/api/config', (req, res) => {
  try {
    const { hexoDir } = req.body;
    if (hexoDir) {
      saveConfig({ hexoDir });
      updateHexoPaths(hexoDir);
    }
    res.json({ success: true, hexoDir: HEXO_DIR });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/config', (req, res) => {
  res.json({ hexoDir: HEXO_DIR });
});

if (fs.existsSync(clientDist)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   Hexo Upload - 博客管理后台已启动           ║
  ║   API:  http://localhost:${PORT}/api             ║
  ║   前端: http://localhost:5173 (Vite开发模式)  ║
  ║   Hexo: ${HEXO_DIR}
  ╚══════════════════════════════════════════════╝
  `);
});