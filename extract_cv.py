import sys
sys.path.append(r"D:\MAGANG AI ENGINEER\PROJEK-PROJEK MAGANG\extraction")
from extractor import PDFMarkdownExtractor

extractor = PDFMarkdownExtractor(output_dir=r"D:\MAGANG AI ENGINEER\BELAJAR-MANDIRI\web-chatbot")
pdf_info = {
    "path": r"D:\MAGANG AI ENGINEER\Berkas-berkas lamaran kerja\Rizky Alviando-CV-ID.pdf",
    "is_valid": True,
    "relative_path": "cv.pdf"
}
result = extractor.extract_to_markdown(pdf_info)
print(result)
