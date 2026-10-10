import os

dir_path = r'd:\professional_practice_exam\Yemen_Medical_Licensure_Exam_Center_V15.14_ANSWER_FIX'

# 1. Write manifest.json
manifest_path = os.path.join(dir_path, 'manifest.json')
manifest_content = '''{
  "name": "Kafa\'ah Licensure",
  "short_name": "Kafa\'ah",
  "description": "Professional Licensure Question Bank & Exam Intelligence",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#f5f7fa",
  "theme_color": "#3c4a5c",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}'''
with open(manifest_path, 'w', encoding='utf-8') as f:
    f.write(manifest_content)

# 2. Write sw.js
sw_path = os.path.join(dir_path, 'sw.js')
sw_content = '''const CACHE_NAME = 'kafaah-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './scalable-db.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});'''
with open(sw_path, 'w', encoding='utf-8') as f:
    f.write(sw_content)

# 3. Modify index.html for PWA support
index_path = os.path.join(dir_path, 'index.html')
with open(index_path, 'r', encoding='utf-8') as f:
    index_html = f.read()

# Add manifest link
if '<link rel="manifest"' not in index_html:
    index_html = index_html.replace('</head>', '  <link rel="manifest" href="manifest.json">\n</head>')

# Add service worker registration
if 'serviceWorker' not in index_html:
    sw_script = """<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}
</script>
</body>"""
    index_html = index_html.replace('</body>', sw_script)

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(index_html)

print("PWA setup complete.")
