import re
import os

file_path = r"d:\MAGANG AI ENGINEER\BELAJAR-MANDIRI\web-chatbot\frontend\index.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_content = re.sub(r'src="data:image/[^"]+"', 'src="assets/images/profile.jpg"', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Replacement complete.")
