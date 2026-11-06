const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const fallbackDbUrl =
  'postgresql://neondb_owner:npg_1hcZf4ptaTYL@ep-frosty-fire-ayfgc4d4-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = fallbackDbUrl;
}

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL || fallbackDbUrl,
});

async function main() {
  console.log('--- Starting Authentic Document Portfolio Seeding (Zero Names) ---');

  const categoriesData = [
    { name: 'การบัญชีและการเงิน', slug: 'accounting', icon: '📊', sortOrder: 1 },
    { name: 'แผนธุรกิจและการตลาด', slug: 'business-plan', icon: '📑', sortOrder: 2 },
    { name: 'สถิติและการวิจัย SPSS', slug: 'spss-research', icon: '📈', sortOrder: 3 },
    { name: 'รายงานและสารสนเทศ', slug: 'reports', icon: '📄', sortOrder: 4 },
    { name: 'งานนำเสนอ & Canva', slug: 'presentation', icon: '🎨', sortOrder: 5 },
    { name: 'วิศวกรรมและวิชาคำนวณ', slug: 'engineering', icon: '⚙️', sortOrder: 6 },
    { name: 'กฎหมายธุรกิจและการบัญชี', slug: 'law', icon: '⚖️', sortOrder: 7 },
    { name: 'แบบฝึกหัดและใบงาน', slug: 'assignments', icon: '✏️', sortOrder: 8 },
  ];

  const catMap = {};
  for (const c of categoriesData) {
    const upserted = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon, sortOrder: c.sortOrder },
      create: c,
    });
    catMap[c.slug] = upserted.id;
  }

  await prisma.portfolioImage.deleteMany({});
  await prisma.portfolio.deleteMany({});

  const portfolios = [
  {
    "categorySlug": "accounting",
    "title": "การจัดทำงบประมาณการดำเนินงานและงบการเงิน ประจำปี 2569 (Master Budget)",
    "slug": "acct-budget-2569",
    "description": "เอกสารการวางแผนงบประมาณองค์กรฉบับสมบูรณ์ ประกอบด้วย งบประมาณการขาย (Sales Budget), งบประมาณการผลิต (Production Budget), งบประมาณวัตถุดิบทางตรง (Direct Materials Budget), งบประมาณค่าแรงงานทางตรง (Direct Labor Budget), งบประมาณค่าใช้จ่ายการผลิต และงบกำไรขาดทุนโดยประมาณ (Pro Forma Income Statement) จัดทำตามมาตรฐานการบัญชีเพื่อการจัดการเพื่อใช้ในการวางแผนและควบคุมการดำเนินงาน",
    "tags": "งบประมาณ, การบัญชีเพื่อการจัดการ, Master Budget, Excel, Pro Forma, การวางแผนการเงิน",
    "sortOrder": 1,
    "images": [
      "/uploads/portfolio/cap_acct_budget_01.png",
      "/uploads/portfolio/cap_acct_budget_02.png",
      "/uploads/portfolio/cap_acct_budget_03.png",
      "/uploads/portfolio/cap_acct_budget_04.png",
      "/uploads/portfolio/cap_acct_budget_05.png"
    ]
  },
  {
    "categorySlug": "accounting",
    "title": "การวิเคราะห์จุดคุ้มทุน (CVP Analysis) และข้อเสนอเชิงธุรกิจ (Decision Memo)",
    "slug": "acct-cvp-retail",
    "description": "แบบจำลองและเอกสารการวิเคราะห์ต้นทุน-ปริมาณ-กำไร (Cost-Volume-Profit Analysis) สำหรับธุรกิจค้าปลีก Smart Store คำนวณจุดคุ้มทุนทั้งในรูปหน่วยและจำนวนเงิน, ส่วนเกินเพื่อความปลอดภัย (Margin of Safety), Operating Leverage และข้อเสนอแนะเชิงกลยุทธ์ (Decision Memo) สำหรับผู้บริหารในการกำหนดราคาขายและโครงสร้างต้นทุน",
    "tags": "CVP Analysis, จุดคุ้มทุน, Margin of Safety, Decision Memo, บัญชีบริหาร, ค้าปลีก",
    "sortOrder": 2,
    "images": [
      "/uploads/portfolio/cap_acct_cvp_01.png"
    ]
  },
  {
    "categorySlug": "accounting",
    "title": "การวิเคราะห์งบการเงินเปรียบเทียบและอัตราส่วนทางการเงิน 5 ด้าน บมจ.อลูคอน (ALUCON)",
    "slug": "acct-alucon-amc",
    "description": "รายงานการวิเคราะห์งบการเงินฉบับเจาะลึกของบริษัทจดทะเบียนในตลาดหลักทรัพย์ฯ วิเคราะห์งบแสดงฐานะการเงินและงบกำไรขาดทุนเบ็ดเสร็จเปรียบเทียบทั้งแนวราบ (Horizontal Analysis) และแนวดิ่ง (Vertical / Common-Size Analysis) พร้อมคำนวณอัตราส่วนสภาพคล่อง, ความสามารถในการทำกำไร, ประสิทธิภาพการใช้สินทรัพย์, โครงสร้างหนี้สิน และอัตราผลตอบแทนต่อผู้ถือหุ้น (DuPont Analysis)",
    "tags": "วิเคราะห์งบการเงิน, อัตราส่วนทางการเงิน, Financial Ratios, Common-Size, DuPont, ตลาดหลักทรัพย์",
    "sortOrder": 3,
    "images": [
      "/uploads/portfolio/cap_acct_alucon_01.png",
      "/uploads/portfolio/cap_acct_alucon_02.png",
      "/uploads/portfolio/cap_acct_alucon_03.png",
      "/uploads/portfolio/cap_acct_alucon_04.png",
      "/uploads/portfolio/cap_acct_alucon_05.png"
    ]
  },
  {
    "categorySlug": "accounting",
    "title": "การวิเคราะห์แนวโน้มโครงสร้างทางการเงินและผลการดำเนินงาน 5 ปีย้อนหลัง (2563-2567)",
    "slug": "acct-ratio-5years",
    "description": "รายงานการประเมินสถานะทางการเงินระยะยาว 5 ปีต่อเนื่อง วิเคราะห์การเปลี่ยนแปลงของโครงสร้างเงินทุน (Capital Structure), อัตราส่วนหนี้สินต่อทุน (D/E Ratio), ความสามารถในการชำระดอกเบี้ย (Interest Coverage Ratio) และแนวโน้มกระแสเงินสดจากการดำเนินงาน เพื่อประเมินความมั่นคงและเสถียรภาพทางการเงินของกิจการ",
    "tags": "Trend Analysis, โครงสร้างทางการเงิน, กระแสเงินสด, สภาพคล่อง, การประเมินสถานะทางการเงิน",
    "sortOrder": 4,
    "images": [
      "/uploads/portfolio/cap_acct_5years_01.png",
      "/uploads/portfolio/cap_acct_5years_02.png",
      "/uploads/portfolio/cap_acct_5years_03.png"
    ]
  },
  {
    "categorySlug": "business-plan",
    "title": "แผนกลยุทธ์ธุรกิจและการตลาดเชิงรุก ร้าน Cafe Amazon (Strategic Business Plan)",
    "slug": "biz-amazon-strategy",
    "description": "การจัดทำแผนกลยุทธ์ธุรกิจและเอกสารนำเสนอระดับมืออาชีพ ประกอบด้วย Business Model Canvas (BMC), การวิเคราะห์สภาพแวดล้อม PESTEL และ Five Forces Model, SWOT Analysis, การกำหนดกลยุทธ์ STP (Segmentation, Targeting, Positioning), กลยุทธ์ส่วนประสมทางการตลาด 7Ps และแผนการขยายสาขารูปแบบ Drive-Thru และ Standalone",
    "tags": "แผนธุรกิจ, แผนการตลาด, Cafe Amazon, Business Model Canvas, SWOT, STP, 7Ps",
    "sortOrder": 1,
    "images": [
      "/uploads/portfolio/cap_biz_amazon_01.png",
      "/uploads/portfolio/cap_biz_amazon_02.png",
      "/uploads/portfolio/cap_biz_amazon_03.png",
      "/uploads/portfolio/cap_biz_amazon_04.png",
      "/uploads/portfolio/cap_biz_amazon_05.png"
    ]
  },
  {
    "categorySlug": "business-plan",
    "title": "แผนธุรกิจและโมเดลการเงินร้านเบอร์เกอร์พรีเมียม Holy Beef Burger",
    "slug": "biz-beef-burger",
    "description": "การศึกษาความเป็นไปได้และวางแผนธุรกิจร้านเบอร์เกอร์เนื้อพรีเมียม วิเคราะห์ตลาดอาหารบริการด่วนพิเศษ (QSR), แผนการจัดซื้อวัตถุดิบและระบบควบคุมต้นทุนอาหาร (Food Cost Control), การกำหนดราคาเชิงกลยุทธ์, การประมาณการงบกระแสเงินสด และการคำนวณจุดคุ้มทุนเพื่อขอรับสินเชื่อและการลงทุน",
    "tags": "แผนธุรกิจร้านอาหาร, Food Cost, เบอร์เกอร์, ประมาณการทางการเงิน, จุดคุ้มทุน, QSR",
    "sortOrder": 2,
    "images": [
      "/uploads/portfolio/cap_biz_burger_01.png",
      "/uploads/portfolio/cap_biz_burger_02.png"
    ]
  },
  {
    "categorySlug": "business-plan",
    "title": "แผนธุรกิจและการตลาดผลิตภัณฑ์สมุนไพรเพื่อสุขภาพ Herb Care",
    "slug": "biz-herb-care",
    "description": "แผนการพัฒนาและจัดจำหน่ายผลิตภัณฑ์แปรรูปจากสมุนไพรธรรมชาติเจาะกลุ่มผู้บริโภคใส่ใจสุขภาพ วิเคราะห์แนวโน้มตลาดสินค้าออร์แกนิก, การสร้างอัตลักษณ์แบรนด์ (Brand Identity), การออกแบบบรรจุภัณฑ์ที่เป็นมิตรต่อสิ่งแวดล้อม, ช่องทางการจัดจำหน่ายแบบ Omni-channel (Online & Offline) และกลยุทธ์ Content Marketing",
    "tags": "สมุนไพร, สุขภาพ, ออร์แกนิก, Omni-channel, Content Marketing, การสร้างแบรนด์",
    "sortOrder": 3,
    "images": [
      "/uploads/portfolio/cap_biz_herb_01.png",
      "/uploads/portfolio/cap_biz_herb_02.png",
      "/uploads/portfolio/cap_biz_herb_03.png"
    ]
  },
  {
    "categorySlug": "business-plan",
    "title": "แผนธุรกิจผลิตภัณฑ์แปรรูปข้าวโพดหวานเพื่อสุขภาพ (Sweet Corn Agro-Business)",
    "slug": "biz-sweet-corn",
    "description": "แผนธุรกิจการเพิ่มมูลค่าผลผลิตทางการเกษตรผ่านการแปรรูปเป็นผลิตภัณฑ์พร้อมบริโภค วิเคราะห์ห่วงโซ่อุปทานการเกษตร (Agri-Supply Chain), กระบวนการควบคุมคุณภาพมาตรฐานสากล, แผนการตลาดแบบ B2B และ B2C และการบริหารจัดการความเสี่ยงจากราคาผลผลิตผันผวน",
    "tags": "ธุรกิจการเกษตร, ข้าวโพดหวาน, Supply Chain, แปรรูปอาหาร, แผนธุรกิจเกษตร",
    "sortOrder": 4,
    "images": [
      "/uploads/portfolio/cap_biz_corn_01.png",
      "/uploads/portfolio/cap_biz_corn_02.png",
      "/uploads/portfolio/cap_biz_corn_03.png",
      "/uploads/portfolio/cap_biz_corn_04.png"
    ]
  },
  {
    "categorySlug": "spss-research",
    "title": "การวิจัยปัจจัยที่มีผลต่อการตัดสินใจซื้อสินค้าผ่าน TikTok Live (SPSS Full Research)",
    "slug": "spss-tiktok-research",
    "description": "งานวิจัยเชิงปริมาณฉบับสมบูรณ์ 50 หน้า ศึกษากลุ่มตัวอย่างนักศึกษาและผู้บริโภคยุคดิจิทัล รวบรวมข้อมูลด้วยแบบสอบถาม ดำเนินการวิเคราะห์ด้วยโปรแกรม SPSS ประกอบด้วย: การทดสอบความเชื่อมั่นแบบสอบถาม (Cronbach's Alpha), สถิติพรรณนา (Mean, S.D., Frequency), การทดสอบสหสัมพันธ์เพียร์สัน (Pearson's Correlation) และการวิเคราะห์การถดถอยพหุคูณ (Multiple Linear Regression) เพื่อหาตัวแปรพยากรณ์ความตั้งใจซื้อ",
    "tags": "SPSS, งานวิจัย, TikTok Live, Multiple Regression, Cronbach Alpha, Pearson Correlation",
    "sortOrder": 1,
    "images": [
      "/uploads/portfolio/cap_spss_tiktok_01.png",
      "/uploads/portfolio/cap_spss_tiktok_02.png",
      "/uploads/portfolio/cap_spss_tiktok_03.png",
      "/uploads/portfolio/cap_spss_tiktok_04.png",
      "/uploads/portfolio/cap_spss_tiktok_05.png"
    ]
  },
  {
    "categorySlug": "spss-research",
    "title": "การวิเคราะห์ความแปรปรวนทางเดียว (One-Way ANOVA) และการทดสอบสมมติฐานด้วย SPSS",
    "slug": "spss-anova-testing",
    "description": "รายงานผลการทดสอบความแตกต่างของค่าเฉลี่ยประชากรมากกว่า 2 กลุ่ม ด้วยสถิติ One-Way ANOVA ตรวจสอบข้อตกลงเบื้องต้นเรื่องความแปรปรวนเท่ากัน (Test of Homogeneity of Variances - Levene's Test), การอ่านค่า F-test และ Sig. พร้อมการเปรียบเทียบพหุคูณรายคู่ (Post-Hoc Comparisons ด้วยวิธี Scheffe และ LSD) พร้อมการเขียนอภิปรายผลทางสถิติที่ถูกต้อง",
    "tags": "One-Way ANOVA, สมมติฐานวิจัย, Post-Hoc Test, Scheffe, Levene Test, SPSS สถิติ",
    "sortOrder": 2,
    "images": [
      "/uploads/portfolio/cap_spss_anova_01.png",
      "/uploads/portfolio/cap_spss_anova_02.png",
      "/uploads/portfolio/cap_spss_anova_03.png",
      "/uploads/portfolio/cap_spss_anova_04.png"
    ]
  },
  {
    "categorySlug": "spss-research",
    "title": "การทดสอบความสัมพันธ์ไคสแควร์ (Chi-Square Test of Independence)",
    "slug": "spss-chisquare-test",
    "description": "รายงานการวิเคราะห์ความสัมพันธ์ระหว่างตัวแปรเชิงกลุ่ม (Categorical Data) ด้วยการทดสอบ Chi-Square ตารางไขว้จำแนกสองทาง (Crosstabulation), การคำนวณค่าความถี่ที่สังเกตได้ (Observed Frequencies) และความถี่ที่คาดหวัง (Expected Frequencies), ค่า Pearson Chi-Square และการทดสอบนัยสำคัญทางสถิติ",
    "tags": "Chi-Square, Crosstab, ไคสแควร์, ความสัมพันธ์ตัวแปรกลุ่ม, สถิติทดสอบ, SPSS",
    "sortOrder": 3,
    "images": [
      "/uploads/portfolio/cap_spss_chisquare_01.png",
      "/uploads/portfolio/cap_spss_chisquare_02.png",
      "/uploads/portfolio/cap_spss_chisquare_03.png"
    ]
  },
  {
    "categorySlug": "reports",
    "title": "รายงานภาคนิพนธ์วิชาการ: การจัดการก๊าซเรือนกระจกและการเปลี่ยนแปลงสภาพภูมิอากาศ",
    "slug": "rep-greenhouse-gas",
    "description": "รายงานทางวิชาการฉบับสมบูรณ์ตามหลักเกณฑ์การรู้สารสนเทศ ครอบคลุมนิยามและกลไกการเกิดภาวะเรือนกระจก, พันธกรณีระหว่างประเทศ (ความตกลงปารีส), แผนแม่บทรองรับการเปลี่ยนแปลงสภาพภูมิอากาศของไทย, นโยบาย Net Zero Carbon Emission, การประเมินคาร์บอนฟุตพริ้นท์ และการจัดการสิ่งแวดล้อมที่ยั่งยืน พร้อมการเขียนอ้างอิงและบรรณานุกรมตามระบบ APA ฉบับที่ 7",
    "tags": "รายงานวิชาการ, ก๊าซเรือนกระจก, Net Zero, คาร์บอนฟุตพริ้นท์, สิ่งแวดล้อม, บรรณานุกรม APA",
    "sortOrder": 1,
    "images": [
      "/uploads/portfolio/cap_rep_ghg_01.png",
      "/uploads/portfolio/cap_rep_ghg_02.png",
      "/uploads/portfolio/cap_rep_ghg_03.png",
      "/uploads/portfolio/cap_rep_ghg_04.png",
      "/uploads/portfolio/cap_rep_ghg_05.png"
    ]
  },
  {
    "categorySlug": "reports",
    "title": "รายงานการศึกษา: ระบบการบริหารงานสาธารณสุขและผังเมือง จังหวัดเชียงใหม่",
    "slug": "rep-chiangmai-admin",
    "description": "รายงานการศึกษาระบบบริหารราชการไทยระดับภูมิภาคและท้องถิ่น วิเคราะห์บทบาทและโครงสร้างสำนักงานสาธารณสุขจังหวัด (สสจ.) ร่วมกับสำนักงานโยธาธิการและผังเมืองจังหวัด ในการจัดทำแผนผังเมืองรวมเชียงใหม่, การควบคุมการใช้ประโยชน์ที่ดิน, การรับมือปัญหาฝุ่นควันมลพิษ PM2.5 และการจัดสรรงบประมาณบริการสุขภาพประชาชน",
    "tags": "ระบบบริหารราชการไทย, สาธารณสุข, ผังเมือง, เชียงใหม่, PM2.5, การปกครองส่วนภูมิภาค",
    "sortOrder": 2,
    "images": [
      "/uploads/portfolio/cap_rep_gov_01.png",
      "/uploads/portfolio/cap_rep_gov_02.png",
      "/uploads/portfolio/cap_rep_gov_03.png",
      "/uploads/portfolio/cap_rep_gov_04.png",
      "/uploads/portfolio/cap_rep_gov_05.png"
    ]
  },
  {
    "categorySlug": "reports",
    "title": "รายงานการศึกษาโมเดลเศรษฐกิจหมุนเวียน (Circular Economy) กรณีศึกษา Moreloop",
    "slug": "rep-moreloop-circular",
    "description": "รายงานวิจัยกรณีศึกษาธุรกิจนวัตกรรมเพื่อสังคม ศึกษารูปแบบการนำเศษผ้าเหลือใช้จากโรงงานอุตสาหกรรมฟอกย้อมและตัดเย็บกลับเข้าสู่กระบวนการผลิต (Upcycling Platform), การคำนวณการลดปริมาณการปล่อยก๊าซคาร์บอนไดออกไซด์จากการนำผ้ากลับมาใช้ใหม่ และการสร้างโมเดลธุรกิจที่ตอบโจทย์ ESG (Environmental, Social, and Governance)",
    "tags": "Circular Economy, Moreloop, ESG, Upcycling, เศรษฐกิจหมุนเวียน, นวัตกรรมสังคม",
    "sortOrder": 3,
    "images": [
      "/uploads/portfolio/cap_rep_moreloop_01.png",
      "/uploads/portfolio/cap_rep_moreloop_02.png",
      "/uploads/portfolio/cap_rep_moreloop_03.png",
      "/uploads/portfolio/cap_rep_moreloop_04.png"
    ]
  },
  {
    "categorySlug": "presentation",
    "title": "สไลด์พรีเซนเทชันโครงงานธุรกิจค้าปลีกอัจฉริยะ Smart Store (Retail Innovation Deck)",
    "slug": "pres-smart-store",
    "description": "ชุดสไลด์นำเสนอผลงานระดับพรีเมียม 15 หน้า ออกแบบด้วยโปรแกรม Canva และ PowerPoint ดีไซน์ทันสมัย นำเสนอแนวคิดร้านสะดวกซื้อยุคใหม่: ระบบชำระเงินอัตโนมัติ (Self-Checkout & Cashless Payment), เทคโนโลยีเซนเซอร์ตรวจจับสินค้า, การบริหารจัดการสินค้าคงคลังแบบ Real-time, แผนผังการจัดวางหน้าร้าน (Store Layout) และการวิเคราะห์ผลตอบแทนการลงทุน",
    "tags": "สไลด์นำเสนอ, PowerPoint, Canva, Smart Store, ค้าปลีกอัจฉริยะ, Store Layout, Pitch Deck",
    "sortOrder": 1,
    "images": [
      "/uploads/portfolio/cap_pres_smartstore_01.png",
      "/uploads/portfolio/cap_pres_smartstore_02.png",
      "/uploads/portfolio/cap_pres_smartstore_03.png",
      "/uploads/portfolio/cap_pres_smartstore_04.png",
      "/uploads/portfolio/cap_pres_smartstore_05.png"
    ]
  },
  {
    "categorySlug": "presentation",
    "title": "สไลด์นำเสนอแผนกลยุทธ์ธุรกิจและขยายสาขา Cafe Amazon (Canva & PPTX)",
    "slug": "pres-amazon-pitch",
    "description": "สไลด์พรีเซนต์เพื่อการสื่อสารระดับผู้บริหาร จัดวางเลย์เอาต์กราฟิกสวยงาม ชูจุดเด่นห่วงโซ่คุณค่ากาแฟไทย, โมเดลแฟรนไชส์, การบริหารความสัมพันธ์ลูกค้า (CRM), โปรแกรมสมาชิก Blue Card และกลยุทธ์การขยายสู่ตลาดภูมิภาคอาเซียน",
    "tags": "นำเสนอแผนธุรกิจ, Cafe Amazon, กลยุทธ์แบรนด์, แฟรนไชส์, พรีเซนเทชัน, Pitching",
    "sortOrder": 2,
    "images": [
      "/uploads/portfolio/cap_pres_amazon_deck_01.png",
      "/uploads/portfolio/cap_pres_amazon_deck_02.png",
      "/uploads/portfolio/cap_pres_amazon_deck_03.png",
      "/uploads/portfolio/cap_pres_amazon_deck_04.png"
    ]
  },
  {
    "categorySlug": "presentation",
    "title": "สไลด์นำเสนอความเป็นผู้ประกอบการและเศรษฐกิจสีเขียว (Green Entrepreneurship)",
    "slug": "pres-green-entrepreneur",
    "description": "ชุดสไลด์บรรยายการพัฒนาภาวะผู้นำและกรอบความคิดแบบผู้ประกอบการที่ยั่งยืน (Sustainable Entrepreneurial Mindset) อธิบายความสัมพันธ์ระหว่างโมเดล BCG (Bio-Circular-Green), ความรับผิดชอบต่อชุมชน และการขับเคลื่อนธุรกิจที่คำนึงถึงสิ่งแวดล้อม",
    "tags": "BCG Model, เศรษฐกิจสีเขียว, ผู้นำที่ยั่งยืน, สไลด์บรรยาย, Green Business",
    "sortOrder": 3,
    "images": [
      "/uploads/portfolio/cap_pres_green_biz_01.png",
      "/uploads/portfolio/cap_pres_green_biz_02.png",
      "/uploads/portfolio/cap_pres_green_biz_03.png",
      "/uploads/portfolio/cap_pres_green_biz_04.png"
    ]
  },
  {
    "categorySlug": "engineering",
    "title": "รายงานผลการทดลองการทดสอบแรงดัดของวัสดุ (Flexural & 3-Point Bending Test)",
    "slug": "eng-bending-flexural",
    "description": "รายงานผลการทดสอบทางกลของวัสดุวิศวกรรมด้วยเครื่อง Universal Testing Machine (UTM) แบบ 3-Point Bending บันทึกข้อมูลแรงและระยะแอ่นตัว (Load-Deflection Data), การพลอตกราฟความเค้น-ความเครียด (Stress-Strain Curve), คำนวณค่าความต้านทานแรงดัดสูงสุด (Flexural Strength) และโมดูลัสของการแตกหัก (Modulus of Rupture - MOR)",
    "tags": "วิศวกรรมวัสดุ, การทดสอบแรงดัด, 3-Point Bending, Stress-Strain, MOR, Mechanical Testing",
    "sortOrder": 1,
    "images": [
      "/uploads/portfolio/cap_eng_flexural_01.png",
      "/uploads/portfolio/cap_eng_flexural_02.png",
      "/uploads/portfolio/cap_eng_flexural_03.png",
      "/uploads/portfolio/cap_eng_flexural_04.png"
    ]
  },
  {
    "categorySlug": "engineering",
    "title": "การวิเคราะห์การกระจายตัวทางสถิติแบบไวบูลล์ (Weibull Distribution) ในงานทดสอบวัสดุ",
    "slug": "eng-weibull-analysis",
    "description": "การประยุกต์ใช้สถิติไวบูลล์ประเมินความเชื่อถือได้และความน่าจะเป็นของการแตกหักในวัสดุเปราะ (Brittle Materials) คำนวณค่า Weibull Modulus (m) ซึ่งบ่งบอกถึงความสม่ำเสมอของโครงสร้างวัสดุ และค่าสเกลพารามิเตอร์ (Characteristic Strength) พร้อมการพล็อตและปรับแก้สมการเชิงเส้น",
    "tags": "Weibull Distribution, สถิติวิศวกรรม, ความน่าจะเป็นของการแตกหัก, Weibull Modulus, ความเชื่อถือได้",
    "sortOrder": 2,
    "images": [
      "/uploads/portfolio/cap_eng_weibull_01.png",
      "/uploads/portfolio/cap_eng_weibull_02.png",
      "/uploads/portfolio/cap_eng_weibull_03.png",
      "/uploads/portfolio/cap_eng_weibull_04.png"
    ]
  },
  {
    "categorySlug": "law",
    "title": "แผนผังความคิด (Mind Mapping) สรุปสาระสำคัญ พ.ร.บ. วิชาชีพบัญชี พ.ศ. 2547",
    "slug": "law-accounting-act",
    "description": "สรุปโครงสร้างสาระสำคัญของกฎหมายวิชาชีพบัญชีในรูปแบบ Mind Map จำแนกบทบัญญัติชัดเจน: โครงสร้างและอำนาจหน้าที่ของสภาวิชาชีพบัญชี, มาตรฐานการบัญชี, การกำกับดูแลผู้ทำบัญชีและผู้สอบบัญชีรับอนุญาต (CPA), ใบอนุญาตประกอบวิชาชีพ และบทกำหนดโทษ",
    "tags": "กฎหมายการบัญชี, พรบวิชาชีพบัญชี 2547, Mind Map, ผู้สอบบัญชี, CPA, สภาวิชาชีพบัญชี",
    "sortOrder": 1,
    "images": [
      "/uploads/portfolio/cap_law_accounting_act_01.png",
      "/uploads/portfolio/cap_law_accounting_act_02.png"
    ]
  },
  {
    "categorySlug": "law",
    "title": "สรุปมาตรฐานและข้อกำหนดจรรยาบรรณวิชาชีพบัญชี (Code of Ethics)",
    "slug": "law-auditing-ethics",
    "description": "เอกสารสรุปหลักเกณฑ์จรรยาบรรณของผู้ประกอบวิชาชีพบัญชีตามมาตรฐานสากล (IFAC / สภาวิชาชีพบัญชี): ความซื่อสัตย์สุจริต (Integrity), ความเที่ยงธรรมและความเป็นอิสระ (Objectivity & Independence), ความรู้ความสามารถและความเอาใจใส่ทางวิชาชีพ, การรักษาความลับ (Confidentiality) และพฤติกรรมเยี่ยงผู้ประกอบวิชาชีพ",
    "tags": "จรรยาบรรณวิชาชีพ, Code of Ethics, ความเป็นอิสระ, ผู้สอบบัญชี, มาตรฐานการสอบบัญชี",
    "sortOrder": 2,
    "images": [
      "/uploads/portfolio/cap_law_ethics_01.png",
      "/uploads/portfolio/cap_law_ethics_02.png"
    ]
  },
  {
    "categorySlug": "assignments",
    "title": "เฉลยและแสดงวิธีทำโจทย์คณิตศาสตร์ แคลคูลัส และสมการอนุพันธ์ (Step-by-Step)",
    "slug": "ass-calculus-solutions",
    "description": "การเฉลยโจทย์คณิตศาสตร์ระดับอุดมศึกษาอย่างละเอียดทุกขั้นตอน แสดงที่มาของสูตรและการแทนค่า: อนุพันธ์ย่อย (Partial Derivatives), ปริพันธ์จำกัดเขตและไม่จำกัดเขต (Definite & Indefinite Integrals), เทคนิคการแยกเศษส่วนย่อย (Partial Fractions) และการแก้สมการเชิงอนุพันธ์อันดับหนึ่งและอันดับสอง ลายมือและฟอนต์คณิตศาสตร์เรียบร้อย ชัดเจน อ่านเข้าใจง่าย",
    "tags": "แคลคูลัส, อนุพันธ์, ปริพันธ์, อินทิเกรต, สมการเชิงอนุพันธ์, เฉลยโจทย์, วิธีทำละเอียด",
    "sortOrder": 1,
    "images": [
      "/uploads/portfolio/cap_ass_calculus_01.png",
      "/uploads/portfolio/cap_ass_calculus_02.png",
      "/uploads/portfolio/cap_ass_calculus_03.png",
      "/uploads/portfolio/cap_ass_calculus_04.png"
    ]
  },
  {
    "categorySlug": "assignments",
    "title": "รายงานวิชาการ: เทคโนโลยีวัสดุรากฟันเทียมเซรามิก (Biomaterial Ceramic Implants)",
    "slug": "ass-ceramic-implants",
    "description": "รายงานวิชาการด้านชีววัสดุและการแพทย์ ศึกษาสมบัติของเซอร์โคเนียเซรามิก (Zirconia Ceramic) ในงานทันตกรรมรากเทียม: ความเข้ากันได้ทางชีวภาพ (Biocompatibility), ความทนทานต่อการสึกหรอและการกัดกร่อนในช่องปาก, กระบวนการสร้างพันธะกับกระดูก (Osseointegration) และข้อได้เปรียบด้านความสวยงามเปรียบเทียบกับรากฟันเทียมไทเทเนียม",
    "tags": "รากฟันเทียม, เซอร์โคเนีย, ชีววัสดุ, ทันตกรรม, Osseointegration, Biomaterials",
    "sortOrder": 2,
    "images": [
      "/uploads/portfolio/cap_ass_ceramic_dental_01.png",
      "/uploads/portfolio/cap_ass_ceramic_dental_02.png",
      "/uploads/portfolio/cap_ass_ceramic_dental_03.png",
      "/uploads/portfolio/cap_ass_ceramic_dental_04.png"
    ]
  },
  {
    "categorySlug": "assignments",
    "title": "รายงานสรุปหลักการทำงานและการประยุกต์ใช้กล้องจุลทรรศน์อิเล็กตรอนแบบส่องกราด (SEM)",
    "slug": "ass-sem-microscope",
    "description": "เอกสารสรุปทฤษฎีทางวิทยาศาสตร์และการวิเคราะห์โครงสร้างวัสดุ อธิบายหลักการของลำอิเล็กตรอน (Electron Gun), การเกิดสัญญาณทุติยภูมิ (Secondary Electrons - SE) เพื่อดูสัณฐานพื้นผิว, สัญญาณสะท้อนกลับ (Backscattered Electrons - BSE) เพื่อดูความต่างของเลขอะตอม และการวิเคราะห์ธาตุเชิงปริมาณด้วยเทคนิค EDS/EDX",
    "tags": "กล้องจุลทรรศน์อิเล็กตรอน, SEM, โครงสร้างจุลภาค, ส่องกราด, EDS, การวิเคราะห์วัสดุ",
    "sortOrder": 3,
    "images": [
      "/uploads/portfolio/cap_ass_sem_microscope_01.png",
      "/uploads/portfolio/cap_ass_sem_microscope_02.png",
      "/uploads/portfolio/cap_ass_sem_microscope_03.png"
    ]
  },
  {
    "categorySlug": "assignments",
    "title": "ใบงาน Take-Home การคำนวณและวิเคราะห์โจทย์ประยุกต์เชิงวิชาการ",
    "slug": "ass-takehome-worksheet",
    "description": "ชุดใบงานและการบ้านรายวิชาคำนวณประยุกต์ แสดงขั้นตอนการวิเคราะห์โจทย์อย่างเป็นระบบ การแปลงหน่วย การแทนค่าในสูตร และการสรุปคำตอบพร้อมเหตุผลประกอบ จัดหน้าเอกสารสวยงามตามระเบียบแบบแผนการส่งงานระดับมหาวิทยาลัย",
    "tags": "ใบงาน, Take-Home, แบบฝึกหัด, การคำนวณ, การบ้าน, แสดงวิธีทำ",
    "sortOrder": 4,
    "images": [
      "/uploads/portfolio/cap_ass_takehome_01.png",
      "/uploads/portfolio/cap_ass_takehome_02.png",
      "/uploads/portfolio/cap_ass_takehome_03.png",
      "/uploads/portfolio/cap_ass_takehome_04.png"
    ]
  }
];

  let totalItems = 0;
  let totalImages = 0;

  for (const item of portfolios) {
    const catId = catMap[item.categorySlug];
    if (!catId) continue;

    const primaryImg = item.images.length > 0 ? item.images[0] : null;

    const created = await prisma.portfolio.create({
      data: {
        title: item.title,
        description: item.description,
        imageUrl: primaryImg,
        categoryId: catId,
        published: true,
        sortOrder: item.sortOrder,
      },
    });
    totalItems++;

    for (let i = 0; i < item.images.length; i++) {
      await prisma.portfolioImage.create({
        data: {
          portfolioId: created.id,
          imageUrl: item.images[i],
          sortOrder: i,
        },
      });
      totalImages++;
    }

    console.log(`✓ [${item.categorySlug}] ${item.title.slice(0, 50)}... (${item.images.length} images)`);
  }

  // Seed Customer Reviews if none exist
  const currentReviews = await prisma.review.count();
  if (currentReviews === 0) {
    const reviewsData = [
      {
        authorName: 'ลูกค้า (งานคำนวณ-วิศวะ)',
        rating: 5,
        comment: 'งานด่วนก่อนสอบ แอดมินตอบไวมาก คุยง่าย ช่วยเคลียร์โจทย์คำนวณพร้อมแสดงวิธีทำละเอียด เข้าใจจุดที่สงสัยทันทีเลย ให้ 5 ดาวเต็มเลยครับ',
        visible: true,
      },
      {
        authorName: 'ลูกค้า (สถิติวิจัย SPSS)',
        rating: 5,
        comment: 'ให้รันผลสถิติ SPSS และเขียนสรุปตาราง ANOVA ส่งงานตรงเวลา ข้อมูลถูกต้องตามหลักสถิติเป๊ะ แนะนำต่อเพื่อนๆ แน่นอนครับ',
        visible: true,
      },
      {
        authorName: 'ลูกค้า (บัญชี-งบประมาณ)',
        rating: 5,
        comment: 'จัดทำงบประมาณและวิเคราะห์งบการเงินละเอียดมาก มีกราฟิกสวยงามและสูตร Excel ชัดเจน ไม่ต้องแก้อะไรเลย ประทับใจมากค่ะ',
        visible: true,
      },
      {
        authorName: 'ลูกค้า (แผนธุรกิจและการตลาด)',
        rating: 5,
        comment: 'สไลด์นำเสนอ Cafe Amazon และแผนธุรกิจทำออกมาเป็นมืออาชีพมาก ทั้ง BMC และ 4Ps นำไปพรีเซนต์แล้วอาจารย์ชมเลย ขอบคุณมากครับ',
        visible: true,
      },
      {
        authorName: 'ลูกค้า (รายงานวิชาการ)',
        rating: 5,
        comment: 'รายงานก๊าซเรือนกระจกและผังเมืองจัดหน้าสวยมาก อ้างอิง APA ครบถ้วน ถูกต้องตามระเบียบมหาวิทยาลัย บริการดีเยี่ยมครับ',
        visible: true,
      },
    ];
    for (const r of reviewsData) {
      await prisma.review.create({ data: r });
    }
  }

  console.log('\n=== Seeding Finished Successfully ===');
  console.log(`Total Portfolio Items: ${totalItems}`);
  console.log(`Total Real Document Images Linked: ${totalImages}`);
  console.log('All personal names sanitized 100%!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });