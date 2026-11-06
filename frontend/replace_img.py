import re
import os

file_path = r"d:\MAGANG AI ENGINEER\BELAJAR-MANDIRI\web-chatbot\frontend\index.html"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the hero-photo div and replace the image inside
content = re.sub(
    r'(<div class="hero-photo">\s*)<img[^>]*src="data:image/[^>]*>(\s*</div>)',
    r'\1<img src="assets/images/profile.jpg" alt="Rizky Alviando" />\2',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Image replaced successfully.")
