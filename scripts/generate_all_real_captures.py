import os
import sys
import shutil
import pymupdf

sys.stdout.reconfigure(encoding='utf-8')

base_dir = r'C:\แฟนฉัน\งานรับจ้าง'
output_dir = r'c:\projectshop\portfolio-system\public\uploads\portfolio'
os.makedirs(output_dir, exist_ok=True)

print("=== Starting Pure Real Document Capture Pipeline (PyMuPDF) ===")

def find_file(keywords):
    for root, dirs, files in os.walk(base_dir):
        for f in files:
            if not f.startswith('~$'):
                full = os.path.join(root, f)
                if all(k.lower() in full.lower() for k in keywords):
                    return full
    return None

def render_pages(pdf_path, page_indices, prefix):
    if not pdf_path or not os.path.exists(pdf_path):
        print(f"[-] NOT FOUND: {prefix} ({pdf_path})")
        return []
    doc = pymupdf.open(pdf_path)
    total = len(doc)
    captured = []
    print(f"[+] Rendering {prefix} from {os.path.basename(pdf_path)} (total: {total} pages)")
    for i, p_num in enumerate(page_indices):
        if p_num < total:
            page = doc[p_num]
            # Redact/censor any personal student names or student IDs if present
            for term in ["นาย", "นางสาว", "รหัสนักศึกษา", "จัดทำโดย", "ผู้จัดทำ", "รหัสประจำตัว", "เสนออาจารย์"]:
                quads = page.search_for(term)
                for q in quads:
                    # expand rect to cover the entire line of the name
                    rect = pymupdf.Rect(q.x0 - 20, q.y0 - 2, page.rect.width - 40, q.y1 + 4)
                    page.add_redact_annot(rect, fill=(1, 1, 1))
            page.apply_redactions()

            pix = page.get_pixmap(dpi=150)
            fname = f"{prefix}_{i+1:02d}.png"
            dest = os.path.join(output_dir, fname)
            pix.save(dest)
            captured.append(f"/uploads/portfolio/{fname}")
    doc.close()
    return captured

def copy_images(src_files, prefix):
    captured = []
    for i, src in enumerate(src_files):
        if os.path.exists(src):
            fname = f"{prefix}_{i+1:02d}.png"
            dest = os.path.join(output_dir, fname)
            shutil.copyfile(src, dest)
            captured.append(f"/uploads/portfolio/{fname}")
    return captured

portfolio_items = []

# 1.1 งบประมาณการดำเนินงานประจำปี 2569
pdf = find_file(['งานงบประมาณ2569', 'รายงานงบประมาณ 2569.pdf'])
if not pdf: pdf = find_file(['งานงบประมาณ2569', 'งบประมาณการขาย.pdf'])
imgs = render_pages(pdf, [0, 1, 2, 3, 4], "cap_acct_budget")
portfolio_items.append({"slug": "acct-budget-2569", "images": imgs})

# 1.2 CVP Analysis & Decision Memo
pdf = find_file(['Decision_Memo', '.pdf'])
imgs = render_pages(pdf, [0, 1, 2, 3], "cap_acct_cvp")
portfolio_items.append({"slug": "acct-cvp-retail", "images": imgs})

# 1.3 วิเคราะห์งบการเงิน อลูคอน ALUCON & AMC
pdf = find_file(['ALUCON', 'วิเคราะห์งบการเงินบริษัท อลูคอน จํากัด(มหาชน.pdf'])
imgs = render_pages(pdf, [1, 2, 3, 4, 5], "cap_acct_alucon")
portfolio_items.append({"slug": "acct-alucon-amc", "images": imgs})

# 1.4 โครงสร้างทางการเงิน 5 ปีย้อนหลัง
pdf = find_file(['2563_2567', 'บทที่ 11', '.pdf'])
imgs = render_pages(pdf, [0, 1, 2], "cap_acct_5years")
portfolio_items.append({"slug": "acct-ratio-5years", "images": imgs})

# 2.1 แผนกลยุทธ์ Cafe Amazon (คัดลอกจาก preview slides)
amazon_previews = [
    os.path.join(base_dir, r'[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\นำเสนอ_สไลด์_Cafe_Amazon\preview', f"slide_{i}.png")
    for i in range(1, 6)
]
imgs = copy_images(amazon_previews, "cap_biz_amazon")
portfolio_items.append({"slug": "biz-amazon-strategy", "images": imgs})

# 2.2 แผนธุรกิจเบอร์เกอร์ Holy Beef Burger
pdf = find_file(['Holy_Beef', 'Business&AccountDesign', '.pdf'])
imgs = render_pages(pdf, [0, 1], "cap_biz_burger")
portfolio_items.append({"slug": "biz-beef-burger", "images": imgs})

# 2.3 แผนธุรกิจ Herb Care
pdf = find_file(['ธุรกิจและสินค้า', 'รายละเอียดเฮิร์บแคร์.pdf'])
if not pdf: pdf = find_file(['ธุรกิจและสินค้า', 'เฮิร์บแคร์.pdf'])
imgs = render_pages(pdf, [0, 1, 2], "cap_biz_herb")
portfolio_items.append({"slug": "biz-herb-care", "images": imgs})

# 2.4 แผนธุรกิจข้าวโพดหวาน Corn
pdf = find_file(['Corn', 'Business_Plan_Corn 01.pdf'])
imgs = render_pages(pdf, [0, 1, 2, 3], "cap_biz_corn")
portfolio_items.append({"slug": "biz-sweet-corn", "images": imgs})

# 3.1 วิจัย TikTok Live
pdf = find_file(['วิชาสถิติ', 'full_doc.pdf'])
imgs = render_pages(pdf, [5, 6, 7, 8, 9], "cap_spss_tiktok")
portfolio_items.append({"slug": "spss-tiktok-research", "images": imgs})

# 3.2 ANOVA Report
pdf = find_file(['วิชาสถิติ', 'วิจัยฉบับสมบูรณ์.pdf'])
imgs = render_pages(pdf, [12, 13, 14, 15], "cap_spss_anova")
portfolio_items.append({"slug": "spss-anova-testing", "images": imgs})

# 3.3 Chi-Square Report
pdf = find_file(['วิชาสถิติ', 'orig_doc.pdf'])
imgs = render_pages(pdf, [10, 11, 12], "cap_spss_chisquare")
portfolio_items.append({"slug": "spss-chisquare-test", "images": imgs})

# 4.1 รายงาน ก๊าซเรือนกระจก
pdf = find_file(['ก๊าซเรือนกระจก', 'รายงาน_ก๊าซเรือนกระจก_v2.1.pdf'])
imgs = render_pages(pdf, [1, 2, 3, 4, 5], "cap_rep_ghg")
portfolio_items.append({"slug": "rep-greenhouse-gas", "images": imgs})

# 4.2 รายงาน สาธารณสุขและผังเมือง เชียงใหม่
pdf = find_file(['PA 1102-69', 'รายงาน สาธารณสุขจังหวัดเชียงใหม่.pdf'])
imgs = render_pages(pdf, [1, 2, 3, 4, 5], "cap_rep_gov")
portfolio_items.append({"slug": "rep-chiangmai-admin", "images": imgs})

# 4.3 รายงาน Moreloop
pdf = find_file(['Moreloop', 'Moreloop.pdf'])
imgs = render_pages(pdf, [1, 2, 3, 4], "cap_rep_moreloop")
portfolio_items.append({"slug": "rep-moreloop-circular", "images": imgs})

# 5.1 Smart Store Presentation Deck
pdf = find_file(['Smart_Store', 'นำเสนอ_Smart_Store_ฟ้าใสมาร์ท.pdf'])
if not pdf: pdf = find_file(['Smart_Store', 'นำเสนอ_Smart_Store_ฟ้าใสมาร์ท3.pdf'])
imgs = render_pages(pdf, [0, 1, 2, 3, 4], "cap_pres_smartstore")
portfolio_items.append({"slug": "pres-smart-store", "images": imgs})

# 5.2 Amazon Deck Part 2
amazon_deck_part2 = [
    os.path.join(base_dir, r'[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\นำเสนอ_สไลด์_Cafe_Amazon\preview', f"slide_{i}.png")
    for i in range(2, 6)
]
imgs = copy_images(amazon_deck_part2, "cap_pres_amazon_deck")
portfolio_items.append({"slug": "pres-amazon-pitch", "images": imgs})

# 5.3 Green Entrepreneurship Presentation
pdf = find_file(['เศรษฐกิจสีเขียว', 'รายงาน เศรษฐกิจสีเขียว.pdf'])
imgs = render_pages(pdf, [1, 2, 3, 4], "cap_pres_green_biz")
portfolio_items.append({"slug": "pres-green-entrepreneur", "images": imgs})

# 6.1 Bending Flexural Test Report
pdf = find_file(['วิชาวิศวกรรม', 'report_exact_6p.pdf'])
imgs = render_pages(pdf, [1, 2, 3, 4], "cap_eng_flexural")
portfolio_items.append({"slug": "eng-bending-flexural", "images": imgs})

# 6.2 Weibull Distribution
pdf = find_file(['วิชาวิศวกรรม', 'report_pink.pdf'])
imgs = render_pages(pdf, [1, 2, 3, 4], "cap_eng_weibull")
portfolio_items.append({"slug": "eng-weibull-analysis", "images": imgs})

# 7.1 Mindmap พรบวิชาชีพบัญชี
pdf = find_file(['วิชากฎหมาย', 'กฎหมายการบัญชี  ม แม่โจ้.pdf'])
imgs = render_pages(pdf, [0, 1], "cap_law_accounting_act")
portfolio_items.append({"slug": "law-accounting-act", "images": imgs})

# 7.2 จรรยาบรรณวิชาชีพบัญชี
imgs = render_pages(pdf, [2, 3], "cap_law_ethics")
portfolio_items.append({"slug": "law-auditing-ethics", "images": imgs})

# 8.1 โจทย์ข้อสอบคณิตศาสตร์ แคลคูลัส
pdf = find_file(['คณิตศาสตร์', 'โจทย์ข้อสอบคณิตศาสตร์_ข้อ17.pdf'])
imgs = render_pages(pdf, [0, 1, 2, 3], "cap_ass_calculus")
portfolio_items.append({"slug": "ass-calculus-solutions", "images": imgs})

# 8.2 รากฟันเซรามิก
pdf = find_file(['รากฟันเซรามิก', 'รายงาน_รากฟันเซรามิก_อภิสิทธิ์.pdf'])
imgs = render_pages(pdf, [1, 2, 3, 4], "cap_ass_ceramic_dental")
portfolio_items.append({"slug": "ass-ceramic-implants", "images": imgs})

# 8.3 กล้องจุลทรรศน์ SEM
pdf = find_file(['SEM', 'สรุป กล้องจุลทรรศน์อิเล็กตรอนแบบส่องกราด.pdf'])
imgs = render_pages(pdf, [0, 1, 2], "cap_ass_sem_microscope")
portfolio_items.append({"slug": "ass-sem-microscope", "images": imgs})

# 8.4 TakeHome ใบงาน
pdf = find_file(['takehome', 'ใบงานtakehome.pdf'])
imgs = render_pages(pdf, [0, 1, 2, 3], "cap_ass_takehome")
portfolio_items.append({"slug": "ass-takehome-worksheet", "images": imgs})

print("\n=== All Captures Completed Successfully! ===")
print(f"Total items processed: {len(portfolio_items)}")
for it in portfolio_items:
    print(f"  {it['slug']}: {len(it['images'])} real images captured")

import json
with open(r'c:\projectshop\portfolio-system\scripts\captured_items.json', 'w', encoding='utf-8') as out:
    json.dump(portfolio_items, out, ensure_ascii=False, indent=2)
print("Saved mapping to scripts/captured_items.json")
