import os

project_dir = r"d:\professional_practice_exam\kafaah"
components_dir = os.path.join(project_dir, 'src', 'components')
os.makedirs(components_dir, exist_ok=True)

# 1. The SVG Logo Component
logo_js = """
export default function Logo({ size = 40, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))' }}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      {/* Abstract overlapping layers */}
      <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" fill="url(#grad1)" opacity="0.8" />
      <path d="M50 25 L75 40 L75 60 L50 75 L25 60 L25 40 Z" fill="url(#grad2)" opacity="0.9" />
      <path d="M50 40 L60 46 L60 54 L50 60 L40 54 L40 46 Z" fill="#ffffff" />
    </svg>
  );
}
"""
with open(os.path.join(components_dir, 'Logo.js'), 'w', encoding='utf-8') as f:
    f.write(logo_js)

# 2. Also save it as public/icon.svg for the PWA manifest and favicon
svg_content = """<svg width="512" height="512" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#8b5cf6" />
      <stop offset="100%" stopColor="#ec4899" />
    </linearGradient>
    <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#06b6d4" />
      <stop offset="100%" stopColor="#3b82f6" />
    </linearGradient>
  </defs>
  <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" fill="url(#grad1)" opacity="0.8" />
  <path d="M50 25 L75 40 L75 60 L50 75 L25 60 L25 40 Z" fill="url(#grad2)" opacity="0.9" />
  <path d="M50 40 L60 46 L60 54 L50 60 L40 54 L40 46 Z" fill="#ffffff" />
</svg>"""
with open(os.path.join(project_dir, 'public', 'icon.svg'), 'w', encoding='utf-8') as f:
    f.write(svg_content)
    
# 3. Update layout.js to use the Logo
layout_path = os.path.join(project_dir, 'src', 'app', 'layout.js')
with open(layout_path, 'r', encoding='utf-8') as f:
    layout_content = f.read()

# Replace the text logo with the Logo component
layout_content = layout_content.replace(
    "import { Home, Compass, User, BrainCircuit, Activity } from 'lucide-react';",
    "import { Home, Compass, User, BrainCircuit, Activity } from 'lucide-react';\nimport Logo from '../components/Logo';"
)
layout_content = layout_content.replace(
    '<div className="brand">\n            🛡️ كفاءة\n          </div>',
    '<div className="brand" style={{ gap: "10px" }}>\n            <Logo size={36} /> كفاءة\n          </div>'
)
layout_content = layout_content.replace('<link rel="manifest" href="/manifest.json" />', '<link rel="manifest" href="/manifest.json" />\n        <link rel="icon" type="image/svg+xml" href="/icon.svg" />')

with open(layout_path, 'w', encoding='utf-8') as f:
    f.write(layout_content)
    
# 4. Update manifest.json to use the new icon.svg
manifest_path = os.path.join(project_dir, 'public', 'manifest.json')
import json
with open(manifest_path, 'r', encoding='utf-8') as f:
    manifest = json.load(f)
manifest['icons'] = [
    {
      "src": "/icon.svg",
      "sizes": "512x512",
      "type": "image/svg+xml"
    }
]
with open(manifest_path, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print("SVG Logo and branding updated successfully.")
