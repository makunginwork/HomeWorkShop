import sys
import os
import fitz # PyMuPDF
import win32com.client
import pythoncom
import re

sys.stdout.reconfigure(encoding='utf-8')
output_dir = r"c:\projectshop\portfolio-system\public\uploads\portfolio"
downloads_dir = r"C:\Users\makung\Downloads"
os.makedirs(output_dir, exist_ok=True)

# Patterns to redact (100% zero personal info)
NAME_PATTERNS = [
    re.compile(r'\b6\d{9}\b'), # 10 digit student ID starting with 6
    re.compile(r'นาย[ก-๙\s]+'),
    re.compile(r'นางสาว[ก-๙\s]+'),
    re.compile(r'อาจารย์[ก-๙\s]+'),
    re.compile(r'ดร\.[ก-๙\s]+'),
    re.compile(r'ผู้จัดทำ[^\n]+'),
    re.compile(r'เสนอ[^\n]+'),
    re.compile(r'อาจารย์ที่ปรึกษา[^\n]+'),
    re.compile(r'Parama', re.IGNORECASE),
    re.compile(r'Natcha', re.IGNORECASE),
    re.compile(r'Prapassorn', re.IGNORECASE),
    re.compile(r'MJU', re.IGNORECASE),
    re.compile(r'แม่โจ้', re.IGNORECASE),
    re.compile(r'ณัฐชา', re.IGNORECASE),
    re.compile(r'ประภัสสร', re.IGNORECASE),
    re.compile(r'ผุสดี', re.IGNORECASE),
    re.compile(r'แซ่ลิ้ม', re.IGNORECASE),
    re.compile(r'ปาริชาติ', re.IGNORECASE),
]

def redact_and_render_pdf(pdf_path, out_png, page_idx=0, zoom=2.0):
    doc = fitz.open(pdf_path)
    if page_idx >= len(doc):
        page_idx = 0
    page = doc[page_idx]

    # Search and redact patterns
    for pat in NAME_PATTERNS:
        text = page.get_text("text")
        for match in pat.finditer(text):
            found_str = match.group(0).strip()
            if len(found_str) > 2:
                for rect in page.search_for(found_str):
                    page.add_redact_annot(rect, fill=(1, 1, 1))

    page.apply_redactions()
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    pix.save(out_png)
    doc.close()
    print(f"Rendered: {os.path.basename(out_png)}")

def process_excel_wb(src, prefix, pages_to_pick=[0, 1, 2, 3, 4]):
    if not os.path.exists(src):
        print("Not found:", src)
        return []
    
    excel = win32com.client.Dispatch("Excel.Application")
    excel.Visible = False
    excel.DisplayAlerts = False
    wb = excel.Workbooks.Open(os.path.abspath(src), ReadOnly=True)
    temp_pdf = os.path.abspath(os.path.join(output_dir, f"temp_{prefix}.pdf"))
    wb.ExportAsFixedFormat(0, temp_pdf)
    wb.Close(False)
    excel.Quit()

    pdf_doc = fitz.open(temp_pdf)
    total = len(pdf_doc)
    print(f"Excel {prefix} total exported pages: {total}")
    results = []
    
    valid_pages = [min(p, total - 1) for p in pages_to_pick]
    valid_pages = sorted(list(set(valid_pages)))

    for i, p_idx in enumerate(valid_pages):
        out_name = f"{prefix}_{i+1:02d}.png"
        out_png = os.path.join(output_dir, out_name)
        redact_and_render_pdf(temp_pdf, out_png, page_idx=p_idx)
        results.append(f"/uploads/portfolio/{out_name}")

    pdf_doc.close()
    if os.path.exists(temp_pdf):
        os.remove(temp_pdf)
    return results

def process_word_doc(doc_filename, out_prefix, max_pages=5):
    src = os.path.join(downloads_dir, doc_filename)
    if not os.path.exists(src):
        print("Not found:", src)
        return []

    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False
    doc = word.Documents.Open(os.path.abspath(src), ReadOnly=True)
    temp_pdf = os.path.abspath(os.path.join(output_dir, f"temp_{out_prefix}.pdf"))
    doc.ExportAsFixedFormat(temp_pdf, 17) # 17 = wdExportFormatPDF
    doc.Close(False)
    word.Quit()

    pdf_doc = fitz.open(temp_pdf)
    total = len(pdf_doc)
    print(f"Word {out_prefix} total pages: {total}")
    results = []
    
    # Pick steps
    pages_to_pick = [0, 1, min(2, total-1), min(3, total-1), total-1]
    pages_to_pick = sorted(list(set(pages_to_pick)))[:max_pages]

    for i, p_idx in enumerate(pages_to_pick):
        out_name = f"{out_prefix}_{i+1:02d}.png"
        out_png = os.path.join(output_dir, out_name)
        redact_and_render_pdf(temp_pdf, out_png, page_idx=p_idx)
        results.append(f"/uploads/portfolio/{out_name}")

    pdf_doc.close()
    if os.path.exists(temp_pdf):
        os.remove(temp_pdf)
    return results

def process_ppsx_internship():
    src = os.path.join(downloads_dir, "การฝึกงาน นศ 16 กย 69 (1).ppsx")
    if not os.path.exists(src):
        src = os.path.join(downloads_dir, "การฝึกงาน นศ 16 กย 69.ppsx")
    if not os.path.exists(src):
        print("Not found internship presentation")
        return []

    ppt = win32com.client.Dispatch("PowerPoint.Application")
    pres = ppt.Presentations.Open(os.path.abspath(src), ReadOnly=True, Untitled=False, WithWindow=False)

    total_slides = pres.Slides.Count
    print(f"Internship total slides: {total_slides}")
    results = []

    slide_indices = [1, 2, min(5, total_slides), min(10, total_slides), total_slides]
    slide_indices = sorted(list(set(slide_indices)))[:5]

    for i, s_idx in enumerate(slide_indices):
        out_name = f"cap_dl_intern_{i+1:02d}.png"
        out_png = os.path.join(output_dir, out_name)
        slide = pres.Slides(s_idx)
        slide.Export(out_png, "PNG", 1920, 1080)

        # PyMuPDF to redact student names on title slide
        if i == 0:
            img_doc = fitz.open(out_png)
            page = img_doc[0]
            w, h = page.rect.width, page.rect.height
            page.add_redact_annot(fitz.Rect(w*0.25, h*0.62, w*0.95, h*0.95), fill=(0.08, 0.12, 0.22))
            page.apply_redactions()
            pix = page.get_pixmap(alpha=False)
            pix.save(out_png)
            img_doc.close()

        results.append(f"/uploads/portfolio/{out_name}")
        print(f"Exported slide {s_idx} -> {out_name}")

    pres.Close()
    ppt.Quit()
    return results

if __name__ == "__main__":
    print("=== Processing Downloads Work Files ===")
    beef_src = os.path.join(downloads_dir, "Business&AccountDesign ( Holy beef burger)01.xlsx")
    beef_imgs = process_excel_wb(beef_src, "cap_dl_beef", [0, 1, 2, 3, 5])
    print("Beef Excel:", len(beef_imgs))

    tensile_src = os.path.join(downloads_dir, "Tensile_Film plastics_กลุ่ม2.2 แก้ไข.xlsx")
    tensile_imgs = process_excel_wb(tensile_src, "cap_dl_tensile", [0, 1, 2, 3])
    print("Tensile Excel:", len(tensile_imgs))

    cs121_imgs = process_word_doc("CS121_Ultimate_Exam_and_Lab_Guide.docx", "cap_dl_cs121", 5)
    print("CS121 Docx:", len(cs121_imgs))

    seq_imgs = process_word_doc("worksheet11_sequential_solution_bitmap.docx", "cap_dl_seqlogic", 4)
    print("Sequential Logic Docx:", len(seq_imgs))

    sqc_imgs = process_word_doc("สถิติ_G2.docx", "cap_dl_sqc", 5)
    print("SQC Docx:", len(sqc_imgs))

    intern_imgs = process_ppsx_internship()
    print("Internship PPT:", len(intern_imgs))
    print("=== All captures from Downloads complete! ===")
