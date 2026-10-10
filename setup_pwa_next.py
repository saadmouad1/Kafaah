import os
import json

project_dir = r"d:\professional_practice_exam\kafaah"

# 1. Update next.config.mjs
next_config = """
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
});

export default withPWA({
  reactStrictMode: true,
});
"""
with open(os.path.join(project_dir, 'next.config.mjs'), 'w', encoding='utf-8') as f:
    f.write(next_config)

# 2. Create manifest.json
manifest = {
  "name": "منصة كفاءة للتدريب المهني",
  "short_name": "كفاءة",
  "description": "المنصة الاحترافية الأولى للتدريب على رخص مزاولة المهن",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1da1f2",
  "icons": [
    {
      "src": "/favicon.ico",
      "sizes": "64x64",
      "type": "image/x-icon"
    }
  ]
}
with open(os.path.join(project_dir, 'public', 'manifest.json'), 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

# 3. Add manifest to layout.js (update head)
layout_path = os.path.join(project_dir, 'src', 'app', 'layout.js')
with open(layout_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace <html lang="ar" dir="rtl"> with the same but adding a <head> inside <body> or before <body>
if '<head>' not in content:
    content = content.replace(
        '<html lang="ar" dir="rtl">',
        '<html lang="ar" dir="rtl">\n      <head>\n        <link rel="manifest" href="/manifest.json" />\n        <meta name="theme-color" content="#1da1f2" />\n      </head>'
    )
    with open(layout_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("PWA configured.")
