import os
import sys
import pymupdf
import win32com.client
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

downloads_dir = r"C:\Users\makung\Downloads"
out_dir = r"c:\projectshop\portfolio-system\public\uploads\portfolio"
os.makedirs(out_dir, exist_ok=True)

print("=== Starting Downloads Portfolio Generation Pipeline ===")

def redact_and_save(page, out_png, zoom=2.0):
    # Redact sensitive student info
    sensitive_terms = [
        "นาย", "นางสาว", "รหัสนักศึกษา", "จัดทำโดย", "ผู้จัดทำ", "รหัสประจำตัว",
        "เสนออาจารย์", "Parama", "Natcha", "Prapassorn", "ณัฐชา", "ประภัสสร",
        "ผุสดี", "แซ่ลิ้ม", "ปาริชาติ", "670410", "690610", "MJU", "แม่โจ้",
        "อ.ธนัช", "อ.กอลฟท์"
    ]
    for term in sensitive_terms:
        quads = page.search_for(term)
        for q in quads:
            rect = pymupdf.Rect(q.x0 - 15, q.y0 - 2, min(q.x1 + 250, page.rect.width - 20), q.y1 + 4)
            page.add_redact_annot(rect, fill=(1, 1, 1))
    page.apply_redactions()

    mat = pymupdf.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    pix.save(out_png)
    print(f"[+] Saved: {os.path.basename(out_png)}")

def render_existing_pdf(pdf_name, page_indices, prefix):
    pdf_path = os.path.join(downloads_dir, pdf_name)
    if not os.path.exists(pdf_path):
        print(f"[-] Not found: {pdf_name}")
        return []
    doc = pymupdf.open(pdf_path)
    total = len(doc)
    print(f"Rendering {pdf_name} (total {total} pages)")
    results = []
    for i, idx in enumerate(page_indices):
        p_idx = min(idx, total - 1)
        page = doc[p_idx]
        out_name = f"{prefix}_{i+1:02d}.png"
        out_png = os.path.join(out_dir, out_name)
        redact_and_save(page, out_png)
        results.append(f"/uploads/portfolio/{out_name}")
    doc.close()
    return results

# 1. Word / PDF: CS121 Digital Logic Master Guide
cs121_imgs = render_existing_pdf(
    "CS121_Ultimate_Exam_and_Lab_Guide.pdf",
    [0, 1, 3, 5, 8],
    "cap_dl_cs121"
)

# 2. Word / PDF: Sequential Logic & Flip-Flop Worksheet
seq_imgs = render_existing_pdf(
    "worksheet11_sequential_solution_bitmap.pdf",
    [0, 1, 2, 3],
    "cap_dl_seqlogic"
)

# 3. Word / PDF: Logic Gate Circuit Analysis Worksheet
logic_imgs = render_existing_pdf(
    "worksheet7_logic_gate (1).pdf",
    [0, 1, 2, 3],
    "cap_dl_logicgate"
)

# 4. Engineering: Biomass & Energy Engineering Calculation Assignment
bio_imgs = render_existing_pdf(
    "HW-BioMass1.pdf",
    [0, 1, 2, 3],
    "cap_dl_biomass"
)

# 5. PowerPoint: Internship Presentation Deck
def render_ppsx_slides():
    src = os.path.join(downloads_dir, "การฝึกงาน นศ 16 กย 69 (1).ppsx")
    if not os.path.exists(src):
        src = os.path.join(downloads_dir, "การฝึกงาน นศ 16 กย 69.ppsx")
    if not os.path.exists(src):
        print("[-] Not found internship ppsx")
        return []
    
    ppt = win32com.client.Dispatch("PowerPoint.Application")
    pres = ppt.Presentations.Open(os.path.abspath(src), ReadOnly=True, Untitled=False, WithWindow=False)
    total = pres.Slides.Count
    print(f"PowerPoint Internship total slides: {total}")
    slide_picks = [1, 2, 4, 8, total]
    results = []

    for i, s_idx in enumerate(slide_picks):
        out_name = f"cap_dl_intern_{i+1:02d}.png"
        out_png = os.path.join(out_dir, out_name)
        slide = pres.Slides(min(s_idx, total))
        slide.Export(os.path.abspath(out_png), "PNG", 1920, 1080)

        # Redact student name on title slide
        if i == 0:
            doc = pymupdf.open(out_png)
            p = doc[0]
            w, h = p.rect.width, p.rect.height
            p.add_redact_annot(pymupdf.Rect(w*0.2, h*0.62, w*0.95, h*0.95), fill=(0.08, 0.12, 0.22))
            p.apply_redactions()
            pix = p.get_pixmap(alpha=False)
            pix.save(out_png)
            doc.close()

        results.append(f"/uploads/portfolio/{out_name}")
        print(f"[+] Exported slide {s_idx} -> {out_name}")

    pres.Close()
    ppt.Quit()
    return results

try:
    intern_imgs = render_ppsx_slides()
except Exception as e:
    print("PowerPoint error:", e)
    intern_imgs = []

print("=== Downloads Captures Summary ===")
print("CS121 Guide:", len(cs121_imgs))
print("Sequential Logic:", len(seq_imgs))
print("Logic Gate:", len(logic_imgs))
print("Biomass HW:", len(bio_imgs))
print("Internship Deck:", len(intern_imgs))
