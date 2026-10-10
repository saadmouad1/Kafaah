import os
import re

dir_path = r'd:\professional_practice_exam\Yemen_Medical_Licensure_Exam_Center_V15.14_ANSWER_FIX'

# 1. Update index.html
index_file = os.path.join(dir_path, 'index.html')
with open(index_file, 'r', encoding='utf-8') as f:
    index_html = f.read()

index_html = index_html.replace('Yemen Medical Licensure Question Bank & Exam Intelligence', 'Kafa\'ah - Professional Licensure Question Bank & Exam Intelligence')
index_html = index_html.replace('Yemen Medical Licensure — Question Intelligence', 'Kafa\'ah — Professional Intelligence')
index_html = index_html.replace('<div class="brand-title">Yemen Medical Licensure</div>', '<div class="brand-title">Kafa\'ah (كفاءة)</div>')
index_html = index_html.replace('🩺', '🎯')
index_html = index_html.replace('Medical Intelligence', 'Professional Intelligence')
index_html = index_html.replace('Yemen Medical Licensure', 'Kafa\'ah Licensure')
index_html = index_html.replace('Medical Sections', 'Professional Fields')
index_html = index_html.replace('medicalProfession', 'profession')

with open(index_file, 'w', encoding='utf-8') as f:
    f.write(index_html)

# 2. Update style.css colors (Sky Blue and Light Grey)
style_file = os.path.join(dir_path, 'style.css')
with open(style_file, 'r', encoding='utf-8') as f:
    style_css = f.read()

# Replace the variables block in V11.4 block
style_css = re.sub(
    r':root\{\s*--navy:#[0-9a-fA-F]+;--navy-deep:#[0-9a-fA-F]+;--blue:#[0-9a-fA-F]+;--teal:#[0-9a-fA-F]+;.*?\}',
    ':root{--navy:#3c4a5c;--navy-deep:#2b3744;--blue:#1da1f2;--teal:#6fb9e6;--cyan:#a3d8f4;--mint:#f0f5f8;--gold:#f2b84b;--purple:#8c9eff;--ink:#2c3e50;--muted:#7f8c8d;--bg:#f5f7fa;--line:#e1e8ed;--shadow-soft:0 10px 30px rgba(60,74,92,.07);--shadow-card:0 14px 34px rgba(60,74,92,.09)}',
    style_css,
    flags=re.DOTALL
)

# Replace other theme blocks
style_css = re.sub(
    r':root\{--navy:#0b3b5e;.*?\}',
    ':root{--navy:#3c4a5c;--navy2:#2b3744;--blue:#1da1f2;--teal:#6fb9e6;--teal2:#e1e8ed;--red:#e74c3c;--gold:#f1c40f;--gold2:#fdfae2;--purple:#9b59b6;--purple2:#f5eef8;--ink:#2c3e50;--muted:#7f8c8d;--bg:#f5f7fa;--card:#fff;--line:#e1e8ed;--shadow:0 10px 28px rgba(60,74,92,.08)}',
    style_css
)

style_css = re.sub(
    r':root\{--navy:#073b5c;.*?\}',
    ':root{--navy:#3c4a5c;--navy2:#2b3744;--blue:#1da1f2;--teal:#6fb9e6;--mint:#f0f5f8;--gold:#f1c40f;--purple:#9b59b6;--ink:#2c3e50;--muted:#7f8c8d;--bg:#f5f7fa;--card:#ffffff;--line:#e1e8ed;--soft:#f7fafc;--shadow:0 8px 24px rgba(60,74,92,.075)}',
    style_css
)

with open(style_file, 'w', encoding='utf-8') as f:
    f.write(style_css)

# 3. Update app.js (Categories and strings)
app_file = os.path.join(dir_path, 'app.js')
with open(app_file, 'r', encoding='utf-8') as f:
    app_js = f.read()

# Replace subjects
app_js = re.sub(r'var SUBJECTS\s*=\s*\[.*?\];', '''var SUBJECTS = [
  { id: 'engineering', title: 'Engineering', icon: '🏗️', sub: ['Civil', 'Mechanical', 'Electrical', 'Software', 'Architecture'] },
  { id: 'medicine', title: 'Medicine & Health', icon: '🩺', sub: ['Internal Medicine', 'Surgery', 'Pediatrics', 'Dentistry', 'Nursing'] },
  { id: 'law', title: 'Law & Legal', icon: '⚖️', sub: ['Corporate Law', 'Criminal Law', 'Civil Rights', 'International Law'] },
  { id: 'education', title: 'Education', icon: '📚', sub: ['Early Childhood', 'Special Education', 'Educational Leadership'] },
  { id: 'accounting', title: 'Accounting & Finance', icon: '📊', sub: ['CPA', 'Auditing', 'Taxation', 'Corporate Finance'] },
  { id: 'it', title: 'Information Technology', icon: '💻', sub: ['Cybersecurity', 'Cloud Computing', 'Data Science', 'Networking'] }
];''', app_js, flags=re.DOTALL)

app_js = app_js.replace('Medical Intelligence', 'Professional Intelligence')
app_js = app_js.replace('Yemen Medical Licensure', 'Kafa\'ah Licensure')
app_js = app_js.replace('🩺', '🎯')
app_js = app_js.replace('medicalProfession', 'profession')

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_js)

print("Refactoring complete.")
