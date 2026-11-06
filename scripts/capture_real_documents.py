import os
import sys
import shutil
import pymupdf
import win32com.client
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

base_dir = r'C:\แฟนฉัน\งานรับจ้าง'
output_dir = r'c:\projectshop\portfolio-system\public\uploads\portfolio'
os.makedirs(output_dir, exist_ok=True)

print("=== Starting Real Document Capture Pipeline ===")

captured_records = []

def find_file(subfolder_keywords, file_keywords, ext):
    for root, dirs, files in os.walk(base_dir):
        root_matches = all(k.lower() in root.lower() for k in subfolder_keywords)
        if root_matches:
            for f in files:
                if f.lower().endswith(ext.lower()) and not f.startswith('~$'):
                    if all(k.lower() in f.lower() for k in file_keywords):
                        return os.path.join(root, f)
    return None

def render_pdf_pages(pdf_path, page_indices, prefix):
    if not pdf_path or not os.path.exists(pdf_path):
        print(f"[-] PDF not found for prefix {prefix}: {pdf_path}")
        return []
    doc = pymupdf.open(pdf_path)
    imgs = []
    total_pages = len(doc)
    print(f"[+] Rendering PDF {os.path.basename(pdf_path)} ({total_pages} pages) -> {prefix}")
    for idx, pno in enumerate(page_indices):
        if pno < total_pages:
            page = doc[pno]
            # 150 DPI gives crisp text without huge file size (~100-300KB)
            pix = page.get_pixmap(dpi=150)
            fname = f"{prefix}_{idx+1:02d}.png"
            dest = os.path.join(output_dir, fname)
            pix.save(dest)
            imgs.append(f"/uploads/portfolio/{fname}")
    doc.close()
    return imgs

def export_pptx_slides(pptx_path, slide_indices, prefix):
    if not pptx_path or not os.path.exists(pptx_path):
        print(f"[-] PPTX not found for prefix {prefix}: {pptx_path}")
        return []
    print(f"[+] Exporting PPTX {os.path.basename(pptx_path)} -> {prefix}")
    ppt_app = win32com.client.Dispatch('PowerPoint.Application')
    pres = ppt_app.Presentations.Open(os.path.abspath(pptx_path), WithWindow=False)
    total_slides = pres.Slides.Count
    imgs = []
    for idx, sno in enumerate(slide_indices):
        if sno <= total_slides:
            fname = f"{prefix}_{idx+1:02d}.png"
            dest = os.path.join(output_dir, fname)
            pres.Slides(sno).Export(dest, 'PNG', 1280, 720)
            imgs.append(f"/uploads/portfolio/{fname}")
    pres.Close()
    ppt_app.Quit()
    return imgs

def convert_docx_and_render(docx_path, page_indices, prefix):
    if not docx_path or not os.path.exists(docx_path):
        print(f"[-] DOCX not found for prefix {prefix}: {docx_path}")
        return []
    print(f"[+] Converting DOCX {os.path.basename(docx_path)} -> PDF -> {prefix}")
    word_app = win32com.client.Dispatch('Word.Application')
    word_app.Visible = False
    doc = word_app.Documents.Open(os.path.abspath(docx_path))
    temp_pdf = os.path.abspath(os.path.join(output_dir, f"temp_{prefix}.pdf"))
    doc.SaveAs2(temp_pdf, FileFormat=17)
    doc.Close()
    word_app.Quit()
    imgs = render_pdf_pages(temp_pdf, page_indices, prefix)
    if os.path.exists(temp_pdf):
        os.remove(temp_pdf)
    return imgs

def export_xlsx_and_render(xlsx_path, page_indices, prefix):
    if not xlsx_path or not os.path.exists(xlsx_path):
        print(f"[-] XLSX not found for prefix {prefix}: {xlsx_path}")
        return []
    print(f"[+] Converting XLSX {os.path.basename(xlsx_path)} -> PDF -> {prefix}")
    excel_app = win32com.client.Dispatch('Excel.Application')
    excel_app.Visible = False
    excel_app.DisplayAlerts = False
    wb = excel_app.Workbooks.Open(os.path.abspath(xlsx_path))
    temp_pdf = os.path.abspath(os.path.join(output_dir, f"temp_{prefix}.pdf"))
    wb.ExportAsFixedFormat(0, temp_pdf)
    wb.Close(False)
    excel_app.Quit()
    imgs = render_pdf_pages(temp_pdf, page_indices, prefix)
    if os.path.exists(temp_pdf):
        os.remove(temp_pdf)
    return imgs

# ============================================================
# 1. การบัญชีและการเงิน (accounting)
# ============================================================
# 1.1 งบประมาณการดำเนินงานประจำปี 2569 (เลือกหน้าตารางงบขาย งบผลิต งบต้นทุนขาย)
f1 = find_file(['10203215', 'แผนงบประมาณ2569'], ['งบประมาณ'], '.pdf')
if not f1:
    f1 = find_file(['10203215', 'แผนงบประมาณ2569'], [], '.pdf')
imgs_acct_budget = render_pdf_pages(f1, [0, 1, 2, 3, 4], "real_acct_budget")

# 1.2 CVP Analysis & การบริหารเงินทุนหมุนเวียน (Excel Model)
f2 = find_file(['10207102', 'CVP'], ['CVP'], '.xlsx')
imgs_acct_cvp = export_xlsx_and_render(f2, [0, 1, 2, 3], "real_acct_cvp")

# 1.3 วิเคราะห์งบการเงิน อลูคอน ALUCON (PDF รายงานการเงินและอัตราส่วน)
f3 = find_file(['10203105', 'ALUCON'], ['อลูคอน'], '.pdf')
if not f3:
    f3 = find_file(['10203105', 'ALUCON'], [], '.pdf')
imgs_acct_alucon = render_pdf_pages(f3, [1, 2, 3, 4, 5], "real_acct_alucon")

# 1.4 การศึกษาโครงสร้างทางการเงิน 5 ปีย้อนหลัง (2563-2567)
f4 = find_file(['10203215', '2563_2567'], ['บทที่ 11'], '.pdf')
if not f4:
    f4 = find_file(['10203215', '2563_2567'], [], '.pdf')
imgs_acct_5years = render_pdf_pages(f4, [0, 1, 2, 3], "real_acct_5years")


# ============================================================
# 2. แผนธุรกิจและการตลาด (business-plan)
# ============================================================
# 2.1 แผนกลยุทธ์ธุรกิจ Cafe Amazon (PowerPoint Slides 2, 3, 4, 5, 6, 7)
f_biz_amazon = find_file(['วิชาแผนธุรกิจ', 'Amazon'], [], '.pptx')
imgs_biz_amazon = export_pptx_slides(f_biz_amazon, [2, 3, 4, 5, 6, 7], "real_biz_amazon")

# 2.2 แผนธุรกิจและโมเดลการเงินร้านเบอร์เกอร์ Holy Beef Burger
f_biz_burger = find_file(['วิชาแผนธุรกิจ', 'Holy_Beef'], ['holy beef burger'], '.pdf')
if not f_biz_burger:
    f_biz_burger = find_file(['วิชาแผนธุรกิจ', 'Holy_Beef'], [], '.pdf')
imgs_biz_burger = render_pdf_pages(f_biz_burger, [1, 2, 3, 4, 5], "real_biz_burger")

# 2.3 แผนธุรกิจและผลิตภัณฑ์สมุนไพร เฮิร์บแคร์ (Herb Care)
f_biz_herb = find_file(['วิชาแผนธุรกิจ', 'ธุรกิจและสินค้า'], ['เฮิร์บแคร์'], '.pdf')
imgs_biz_herb = render_pdf_pages(f_biz_herb, [0, 1, 2, 3], "real_biz_herb")

# 2.4 แผนธุรกิจร้านอาหารเพื่อสุขภาพและข้าวโพดหวาน (Corn Business Plan)
f_biz_corn = find_file(['วิชาแผนธุรกิจ', 'Corn'], ['Business_Plan'], '.pdf')
imgs_biz_corn = render_pdf_pages(f_biz_corn, [0, 1, 2, 3], "real_biz_corn")

# 2.5 รายงานศึกษาโครงสร้างธุรกิจและ 5 Forces บริษัท อาฟเตอร์ยู (After You One Report)
f_biz_afteryou = find_file(['วิชาแผนธุรกิจ', 'อาฟเตอร์ยู'], ['One_Report'], '.pdf')
imgs_biz_afteryou = render_pdf_pages(f_biz_afteryou, [1, 2, 3, 4], "real_biz_afteryou")


# ============================================================
# 3. สถิติและการวิจัย SPSS (spss-research)
# ============================================================
# 3.1 งานวิจัยปัจจัยซื้อผ่าน TikTok Live ฉบับสมบูรณ์ (ตาราง SPSS, ผลการวิเคราะห์)
f_spss_tiktok = find_file(['วิชาสถิติ', 'SPSS'], ['full_doc'], '.pdf')
imgs_spss_tiktok = render_pdf_pages(f_spss_tiktok, [5, 6, 7, 8, 9], "real_spss_tiktok")

# 3.2 รายงานการวิเคราะห์สถิติทดสอบ One-Way ANOVA (DOCX -> PDF -> PNG)
f_spss_anova = find_file(['วิชาสถิติ', 'ANOVA'], ['ANOVA'], '.docx')
imgs_spss_anova = convert_docx_and_render(f_spss_anova, [0, 1, 2], "real_spss_anova")

# 3.3 รายงานการวิเคราะห์การทดสอบ Chi-Square (DOCX -> PDF -> PNG)
f_spss_chisq = find_file(['วิชาสถิติ', 'ANOVA'], ['ChiSquare'], '.docx')
imgs_spss_chisq = convert_docx_and_render(f_spss_chisq, [0, 1, 2], "real_spss_chisq")


# ============================================================
# 4. รายงานและสารสนเทศ (reports)
# ============================================================
# 4.1 รายงานภาคนิพนธ์วิชาการ ก๊าซเรือนกระจก (หน้าเนื้อหา กราฟ สถิติ และการจัดการสิ่งแวดล้อม)
f_rep_ghg = find_file(['10700401', 'ก๊าซเรือนกระจก'], ['ก๊าซเรือนกระจก'], '.pdf')
imgs_rep_ghg = render_pdf_pages(f_rep_ghg, [1, 2, 3, 4, 5], "real_rep_ghg")

# 4.2 รายงานการบริหารงานสาธารณสุขและผังเมือง จังหวัดเชียงใหม่
f_rep_gov = find_file(['PA 1102-69', 'สาธารณสุข'], ['สาธารณสุข'], '.pdf')
imgs_rep_gov = render_pdf_pages(f_rep_gov, [1, 2, 3, 4, 5], "real_rep_gov")

# 4.3 รายงานศึกษาโมเดลเศรษฐกิจหมุนเวียน Moreloop
f_rep_moreloop = find_file(['10203215', 'Moreloop'], ['Moreloop'], '.pdf')
imgs_rep_moreloop = render_pdf_pages(f_rep_moreloop, [0, 1, 2], "real_rep_moreloop")


# ============================================================
# 5. งานนำเสนอ & Canva (presentation)
# ============================================================
# 5.1 สไลด์พรีเซนเทชัน Smart Store (PPTX Slides)
f_pres_smart = find_file(['10207102', 'Smart_Store'], ['Smart_Store'], '.pptx')
imgs_pres_smart = export_pptx_slides(f_pres_smart, [2, 3, 4, 5, 6, 7], "real_pres_smart")

# 5.2 สไลด์นำเสนอแผนธุรกิจและกลยุทธ์การขยายสาขา Cafe Amazon
imgs_pres_amazon = export_pptx_slides(f_biz_amazon, [8, 9, 10, 11, 12, 13], "real_pres_amazon")

# 5.3 สไลด์สรุปโครงสร้างธุรกิจและแบบจำลองการเงิน
f_pres_summary = find_file(['วิชาแผนธุรกิจ', 'สรุปแผนธุรกิจ'], [], '.pptx')
imgs_pres_summary = export_pptx_slides(f_pres_summary, [1, 2, 3, 4, 5], "real_pres_summary")


# ============================================================
# 6. วิศวกรรมและวิชาคำนวณ (engineering)
# ============================================================
# 6.1 รายงานผลการทดลองการทดสอบแรงดัดของวัสดุ (Flexural & Bending Mechanical Test)
f_eng_flex = find_file(['วิชาวิศวกรรม', 'แรงดัด'], ['report_exact'], '.pdf')
if not f_eng_flex:
    f_eng_flex = find_file(['วิชาวิศวกรรม', 'แรงดัด'], [], '.pdf')
imgs_eng_flex = render_pdf_pages(f_eng_flex, [1, 2, 3, 4], "real_eng_flex")

# 6.2 การวิเคราะห์การกระจายตัวทางสถิติแบบไวบูลล์ (Weibull Distribution) ในงานทดสอบวัสดุ
f_eng_weibull = find_file(['วิชาวิศวกรรม', 'แรงดัด'], ['pink'], '.pdf')
imgs_eng_weibull = render_pdf_pages(f_eng_weibull, [1, 2, 3, 4], "real_eng_weibull")


# ============================================================
# 7. กฎหมายธุรกิจและการบัญชี (law)
# ============================================================
# 7.1 แผนผังความคิด Mind Mapping พ.ร.บ. วิชาชีพบัญชี พ.ศ. 2547
f_law_mindmap = find_file(['วิชากฎหมาย', 'Mindmap'], ['กฎหมายการบัญชี'], '.pdf')
if not f_law_mindmap:
    f_law_mindmap = find_file(['วิชากฎหมาย'], [], '.pdf')
imgs_law_mindmap = render_pdf_pages(f_law_mindmap, [0], "real_law_mindmap")


# ============================================================
# 8. แบบฝึกหัดและใบงาน (assignments)
# ============================================================
# 8.1 การเฉลยและแสดงวิธีทำโจทย์คณิตศาสตร์ แคลคูลัส และสมการอนุพันธ์
f_ass_math = find_file(['แบบฝึกหัด', 'โจทย์และเขียนคณิตศาสตร์'], ['โจทย์'], '.pdf')
imgs_ass_math = render_pdf_pages(f_ass_math, [0, 1, 2, 3], "real_ass_math")

# 8.2 รายงานเทคโนโลยีวัสดุรากฟันเทียมเซรามิก (Ceramic Dental Implants)
f_ass_dental = find_file(['แบบฝึกหัด', 'รากฟันเซรามิก'], ['รากฟันเซรามิก'], '.pdf')
imgs_ass_dental = render_pdf_pages(f_ass_dental, [1, 2, 3, 4], "real_ass_dental")

# 8.3 รายงานสรุปกล้องจุลทรรศน์อิเล็กตรอนแบบส่องกราด (SEM)
f_ass_sem = find_file(['แบบฝึกหัด', 'SEM'], ['กล้องจุลทรรศน์อิเล็กตรอน'], '.pdf')
imgs_ass_sem = render_pdf_pages(f_ass_sem, [0, 1, 2], "real_ass_sem")

# 8.4 ใบงาน Take-Home การคำนวณและวิเคราะห์โจทย์ประยุกต์
f_ass_takehome = find_file(['แบบฝึกหัด', 'TakeHome'], ['takehome'], '.pdf')
imgs_ass_takehome = render_pdf_pages(f_ass_takehome, [0, 1, 2, 3], "real_ass_takehome")

print("\n=== Real Document Capture Completed ===")
summary = {
    "acct_budget": len(imgs_acct_budget),
    "acct_cvp": len(imgs_acct_cvp),
    "acct_alucon": len(imgs_acct_alucon),
    "acct_5years": len(imgs_acct_5years),
    "biz_amazon": len(imgs_biz_amazon),
    "biz_burger": len(imgs_biz_burger),
    "biz_herb": len(imgs_biz_herb),
    "biz_corn": len(imgs_biz_corn),
    "biz_afteryou": len(imgs_biz_afteryou),
    "spss_tiktok": len(imgs_spss_tiktok),
    "spss_anova": len(imgs_spss_anova),
    "spss_chisq": len(imgs_spss_chisq),
    "rep_ghg": len(imgs_rep_ghg),
    "rep_gov": len(imgs_rep_gov),
    "rep_moreloop": len(imgs_rep_moreloop),
    "pres_smart": len(imgs_pres_smart),
    "pres_amazon": len(imgs_pres_amazon),
    "pres_summary": len(imgs_pres_summary),
    "eng_flex": len(imgs_eng_flex),
    "eng_weibull": len(imgs_eng_weibull),
    "law_mindmap": len(imgs_law_mindmap),
    "ass_math": len(imgs_ass_math),
    "ass_dental": len(imgs_ass_dental),
    "ass_sem": len(imgs_ass_sem),
    "ass_takehome": len(imgs_ass_takehome),
}
print(summary)
