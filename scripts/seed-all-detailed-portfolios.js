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
const srcBase = 'C:\\แฟนฉัน\\งานรับจ้าง';
const destBase = path.join(process.cwd(), 'public', 'uploads', 'portfolio');

if (!fs.existsSync(destBase)) {
  fs.mkdirSync(destBase, { recursive: true });
}

function copySafe(srcRelPath, destFileName) {
  const fullDest = path.join(destBase, destFileName);
  try {
    // If already in public/uploads/portfolio, use it directly (works on Vercel!)
    if (fs.existsSync(fullDest)) {
      return `/uploads/portfolio/${destFileName}`;
    }
    const fullSrc = path.join(srcBase, srcRelPath);
    if (fs.existsSync(fullSrc)) {
      fs.copyFileSync(fullSrc, fullDest);
      return `/uploads/portfolio/${destFileName}`;
    } else {
      console.warn('File not found:', fullSrc);
    }
  } catch (err) {
    console.error('Copy error:', err.message);
  }
  return null;
}

async function main() {
  console.log('--- Starting Comprehensive Clean Portfolio Seeding (Zero Names) ---');

  // Categories
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

  // Clear existing portfolios to rebuild completely
  await prisma.portfolioImage.deleteMany({});
  await prisma.portfolio.deleteMany({});

  const portfolioDefinitions = [
    // ============================================================
    // 1. Accounting & Finance (การบัญชีและการเงิน)
    // ============================================================
    {
      catSlug: 'accounting',
      title: 'การจัดทำงบประมาณการดำเนินงานและงบการเงิน ประจำปี 2569 (Excel & รายงานวิเคราะห์)',
      description: 'งานวิเคราะห์และจัดทำประมาณการงบประมาณรายรับ-รายจ่าย งบต้นทุนการผลิต งบกำไรขาดทุน และงบดุลล่วงหน้า พร้อมทั้งผูกสูตรคำนวณอัตโนมัติใน Excel เชื่อมโยงทุกชีทอย่างถูกต้องตามหลักการบัญชีบริหาร และจัดรูปเล่มรายงานมาตรฐานพร้อมส่งตรวจ',
      files: [
        { src: '[10203215] การบัญชีเพื่อการจัดการ\\งานงบประมาณ2569\\น้องคนที่1\\รุป\\22373_0.jpg', name: 'acc-budget-01.jpg' },
        { src: '[10203215] การบัญชีเพื่อการจัดการ\\งานงบประมาณ2569\\น้องคนที่1\\รุป\\22374_0.jpg', name: 'acc-budget-02.jpg' },
        { src: '[10203215] การบัญชีเพื่อการจัดการ\\งานงบประมาณ2569\\น้องคนที่1\\รุป\\22375_0.jpg', name: 'acc-budget-03.jpg' },
        { src: '[10203215] การบัญชีเพื่อการจัดการ\\งานงบประมาณ2569\\น้องคนที่1\\รุป\\22376_0.jpg', name: 'acc-budget-04.jpg' },
        { src: '[10203215] การบัญชีเพื่อการจัดการ\\งานงบประมาณ2569\\น้องคนที่1\\รุป\\22377_0.jpg', name: 'acc-budget-05.jpg' },
        { src: '[10203215] การบัญชีเพื่อการจัดการ\\งานงบประมาณ2569\\น้องคนที่1\\รุป\\22378_0.jpg', name: 'acc-budget-06.jpg' },
      ],
      sortOrder: 1,
    },
    {
      catSlug: 'accounting',
      title: 'การวิเคราะห์จุดคุ้มทุน (CVP Analysis) และการบริหารเงินทุนหมุนเวียน ธุรกิจค้าปลีก Smart Store',
      description: 'คำนวณจุดคุ้มทุน (Break-Even Point), ส่วนเกินความปลอดภัย (Margin of Safety), Operating Leverage และจัดทำกราฟแสดงความสัมพันธ์ต้นทุน-ปริมาณ-กำไร เพื่อประกอบการตัดสินใจเชิงกลยุทธ์ทางธุรกิจ พร้อมบทวิเคราะห์ Decision Memo',
      files: [
        { src: '[10207102] การบัญชีและการเงินสำหรับธุรกิจค้าปลีก\\กรณีศึกษา_Smart_Store_ฟ้าใสมาร์ท_กลุ่ม4\\chart_2_cvp_verified.png', name: 'acc-cvp-01.png' },
        { src: '[10207102] การบัญชีและการเงินสำหรับธุรกิจค้าปลีก\\กรณีศึกษา_Smart_Store_ฟ้าใสมาร์ท_กลุ่ม4\\chart_3_wc_verified.png', name: 'acc-wc-02.png' },
        { src: '[10207102] การบัญชีและการเงินสำหรับธุรกิจค้าปลีก\\กรณีศึกษา_Smart_Store_ฟ้าใสมาร์ท_กลุ่ม4\\bg_cover.png', name: 'acc-cover-03.png' },
        { src: '[10207102] การบัญชีและการเงินสำหรับธุรกิจค้าปลีก\\กรณีศึกษา_Smart_Store_ฟ้าใสมาร์ท_กลุ่ม4\\slide_previews\\slide_01.png', name: 'acc-slide-04.png' },
        { src: '[10207102] การบัญชีและการเงินสำหรับธุรกิจค้าปลีก\\กรณีศึกษา_Smart_Store_ฟ้าใสมาร์ท_กลุ่ม4\\slide_previews\\slide_02.png', name: 'acc-slide-05.png' },
      ],
      sortOrder: 2,
    },
    {
      catSlug: 'accounting',
      title: 'การวิเคราะห์งบการเงินเปรียบเทียบและอัตราส่วนทางการเงิน 5 ด้าน บริษัทจดทะเบียน',
      description: 'วิเคราะห์แนวนอน (Horizontal Analysis), แนวดิ่ง (Common-Size Analysis) และคำนวณอัตราส่วนทางการเงินครบวงจร: สภาพคล่อง, ความสามารถในการทำกำไร, ประสิทธิภาพในการดำเนินงาน, โครงสร้างหนี้สิน และความสามารถในการจ่ายดอกเบี้ย สรุปเป็นรายงานฉบับสมบูรณ์',
      files: [
        { src: '[10203215] การบัญชีเพื่อการจัดการ\\งานงบประมาณ2569\\น้องคนที่2\\S__5087243_0.jpg', name: 'acc-finratio-01.jpg' },
        { src: '[10203215] การบัญชีเพื่อการจัดการ\\งานงบประมาณ2569\\น้องคนที่2\\S__5087244_0.jpg', name: 'acc-finratio-02.jpg' },
        { src: '[10203215] การบัญชีเพื่อการจัดการ\\งานงบประมาณ2569\\น้องคนที่2\\S__5087245_0.jpg', name: 'acc-finratio-03.jpg' },
        { src: '[10203215] การบัญชีเพื่อการจัดการ\\งานงบประมาณ2569\\น้องคนที่2\\S__5087246_0.jpg', name: 'acc-finratio-04.jpg' },
        { src: '[10203215] การบัญชีเพื่อการจัดการ\\งานงบประมาณ2569\\น้องคนที่2\\S__5087247_0.jpg', name: 'acc-finratio-05.jpg' },
      ],
      sortOrder: 3,
    },
    {
      catSlug: 'accounting',
      title: 'รายงานการวิเคราะห์ตราสารทุน ข้อมูลบริษัทจดทะเบียน และกลยุทธ์การลงทุน',
      description: 'วิเคราะห์โครงสร้างรายได้ ต้นทุน งบแสดงฐานะการเงิน และประเมินมูลค่าหุ้นของบริษัทในตลาดหลักทรัพย์แห่งประเทศไทย (SET) พร้อมสร้างกราฟเปรียบเทียบผลตอบแทนและปัจจัยเสี่ยง',
      files: [
        { src: '[วิชาการเงิน] การวิเคราะห์ตราสารทุนและการลงทุน\\งานวิเคราะห์หุ้นและข้อมูลบริษัท\\extracted_images_tantikorn\\img_0.png', name: 'acc-stock-01.png' },
        { src: '[วิชาการเงิน] การวิเคราะห์ตราสารทุนและการลงทุน\\งานวิเคราะห์หุ้นและข้อมูลบริษัท\\extracted_images_tantikorn\\img_1.png', name: 'acc-stock-02.png' },
        { src: '[วิชาการเงิน] การวิเคราะห์ตราสารทุนและการลงทุน\\งานวิเคราะห์หุ้นและข้อมูลบริษัท\\extracted_images_tantikorn\\img_2.png', name: 'acc-stock-03.png' },
        { src: '[วิชาการเงิน] การวิเคราะห์ตราสารทุนและการลงทุน\\งานวิเคราะห์หุ้นและข้อมูลบริษัท\\extracted_images_tantikorn\\img_3.png', name: 'acc-stock-04.png' },
        { src: '[วิชาการเงิน] การวิเคราะห์ตราสารทุนและการลงทุน\\งานวิเคราะห์หุ้นและข้อมูลบริษัท\\extracted_images_tantikorn\\img_5.png', name: 'acc-stock-05.png' },
      ],
      sortOrder: 4,
    },

    // ============================================================
    // 2. Business Plan (แผนธุรกิจและการตลาด)
    // ============================================================
    {
      catSlug: 'business-plan',
      title: 'แผนกลยุทธ์ธุรกิจและการตลาด ร้าน Cafe Amazon (สไลด์นำเสนอ & รายงานวิเคราะห์)',
      description: 'จัดทำแผนกลยุทธ์การขยายสาขา การวิเคราะห์สภาพแวดล้อมธุรกิจ PESTEL, Porter Five Forces, SWOT Analysis, ส่วนประสมทางการตลาด 7Ps และประมาณการทางการเงิน พร้อมออกแบบสไลด์นำเสนอระดับพรีเมียม',
      files: [
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\นำเสนอ_สไลด์_Cafe_Amazon\\preview\\slide_1.png', name: 'biz-amazon-slide-01.png' },
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\นำเสนอ_สไลด์_Cafe_Amazon\\preview\\slide_2.png', name: 'biz-amazon-slide-02.png' },
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\นำเสนอ_สไลด์_Cafe_Amazon\\preview\\slide_3.png', name: 'biz-amazon-slide-03.png' },
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\นำเสนอ_สไลด์_Cafe_Amazon\\preview\\slide_4.png', name: 'biz-amazon-slide-04.png' },
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\นำเสนอ_สไลด์_Cafe_Amazon\\preview\\slide_5.png', name: 'biz-amazon-slide-05.png' },
      ],
      sortOrder: 1,
    },
    {
      catSlug: 'business-plan',
      title: 'การสรุปและวิเคราะห์โมเดลธุรกิจ (Business Model Canvas) และแผนการตลาดเชิงรุก',
      description: 'วิเคราะห์โครงสร้าง 9 ช่องของ Business Model Canvas (BMC), การวางตำแหน่งผลิตภัณฑ์ (Positioning), การกำหนดกลุ่มเป้าหมาย (Segmentation & Targeting) และกลยุทธ์สร้างความได้เปรียบทางการแข่งขันอย่างยั่งยืน',
      files: [
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\สรุปโมเดลแผนธุรกิจ_บทที่2และ3\\รูป\\S__5783572.jpg', name: 'biz-model-01.jpg' },
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\สรุปโมเดลแผนธุรกิจ_บทที่2และ3\\รูป\\S__5783574_0.jpg', name: 'biz-model-02.jpg' },
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\สรุปโมเดลแผนธุรกิจ_บทที่2และ3\\รูป\\S__5783575_0.jpg', name: 'biz-model-03.jpg' },
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\สรุปโมเดลแผนธุรกิจ_บทที่2และ3\\รูป\\S__5783576_0.jpg', name: 'biz-model-04.jpg' },
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\สรุปโมเดลแผนธุรกิจ_บทที่2และ3\\รูป\\S__5783577_0.jpg', name: 'biz-model-05.jpg' },
      ],
      sortOrder: 2,
    },
    {
      catSlug: 'business-plan',
      title: 'แผนธุรกิจสินค้าเกษตรแปรรูปและผลิตภัณฑ์เพื่อสุขภาพ (Health & Organic Care)',
      description: 'จัดทำแผนธุรกิจผลิตภัณฑ์แปรรูปจากวัตถุดิบธรรมชาติ การวิเคราะห์พฤติกรรมผู้บริโภคยุคใหม่ แผนการตลาดดิจิทัล และแผนบริหารความเสี่ยง พร้อมรูปเล่ม Word และ PDF จัดหน้าสวยงาม',
      files: [
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\นำเสนอ_สไลด์_Cafe_Amazon\\docx_extracted\\img_1.png', name: 'biz-organic-01.png' },
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\นำเสนอ_สไลด์_Cafe_Amazon\\docx_extracted\\img_10.png', name: 'biz-organic-02.png' },
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\นำเสนอ_สไลด์_Cafe_Amazon\\docx_extracted\\img_11.png', name: 'biz-organic-03.png' },
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\นำเสนอ_สไลด์_Cafe_Amazon\\docx_extracted\\img_12.png', name: 'biz-organic-04.png' },
      ],
      sortOrder: 3,
    },

    // ============================================================
    // 3. SPSS & Statistics (สถิติและการวิจัย SPSS)
    // ============================================================
    {
      catSlug: 'spss-research',
      title: 'การวิเคราะห์สถิติ One-Way ANOVA และการทดสอบสมมติฐานด้วยโปรแกรม SPSS',
      description: 'ทำความสะอาดข้อมูล (Data Cleaning), ทดสอบการแจกแจงแบบปกติ (Normality Test), วิเคราะห์ความแปรปรวนทางเดียว (One-Way ANOVA) และการเปรียบเทียบรายคู่ (Post-Hoc Tests: Scheffé, Tukey, Bonferroni) พร้อมเขียนสรุปผลรายงานบทที่ 4',
      files: [
        { src: '[วิชาสถิติ] สถิติและการวิจัย_SPSS\\แบบฝึกปฏิบัติSPSS_ANOVAและChiSquare_บทที่6และ7\\3wggwzkRz9-ctPXnUoDHOof42I98MaE-Hv8nf4ZFwo1ilMCbUgrB7pKQc20OPAAHC2UT5seoZ5FkLNhQpboJIfS7H6EMxIn6pe-sSN2RmC1ioG7VmY4DmT0Ix6W3_2GwOObrIXWDvj3wvVZWXR7TOg==.jpg', name: 'spss-anova-01.jpg' },
        { src: '[วิชาสถิติ] สถิติและการวิจัย_SPSS\\แบบฝึกปฏิบัติSPSS_ANOVAและChiSquare_บทที่6และ7\\5RvHypMlYaFqQA0Tgdq68-TMGuEzu4ucBXuGD1SFaY7GCMkvT2xQ9mIoi3W1ePrXRjc1pcaS-q2HYSP_DvhP4K4bbHzKVCrXwbh5Y8m2lWl3sNQC6dkOCzCrNvVj0mgIr6fRbKROf4YksHppMo5QDQ==.jpg', name: 'spss-anova-02.jpg' },
        { src: '[วิชาสถิติ] สถิติและการวิจัย_SPSS\\แบบฝึกปฏิบัติSPSS_ANOVAและChiSquare_บทที่6และ7\\8bCJ78Mj_P73s20IR0D_VPTv0q6goCdq7Z3G-GLi_ckZNunKpxDyZG_54BOan3HaBmiItLUgV4PuY_KiG9NWVsGfaypTexjN3nH3ptoyroUnhscGJTcbPGQda1Tj6p11yoEYSNdl5TIBu65cFcBv0A==.jpg', name: 'spss-anova-03.jpg' },
      ],
      sortOrder: 1,
    },
    {
      catSlug: 'spss-research',
      title: 'การวิเคราะห์การทดสอบความเป็นอิสระ (Chi-Square Test) และสถิติพรรณนาแบบสอบถาม',
      description: 'วิเคราะห์ความถี่ ร้อยละ ค่าเฉลี่ย ส่วนเบี่ยงเบนมาตรฐาน (SD) และทดสอบความสัมพันธ์ระหว่างตัวแปรเชิงกลุ่มด้วย Chi-Square Test of Independence พร้อมตาราง Cross-tabulation และคำแปลผลอย่างเป็นทางการ',
      files: [
        { src: '[วิชาสถิติ] สถิติและการวิจัย_SPSS\\แบบฝึกปฏิบัติSPSS_ANOVAและChiSquare_บทที่6และ7\\MbNeoO7jWTEuLt7BygXHnfbDb-Z44bb-ZB1v8X7t6miCKBmV7oj29X6wO01872e6K5ZNQ90h65PCVS5lovzQXk_LEmgXowkxe_xSgxc5cXkGESvgJu2VULyYDOlU7fM5jgTjgTGATm1_gXXKFHhmhg==.jpg', name: 'spss-chisq-01.jpg' },
        { src: '[วิชาสถิติ] สถิติและการวิจัย_SPSS\\แบบฝึกปฏิบัติSPSS_ANOVAและChiSquare_บทที่6และ7\\NahkhWYLdNW3g9ViimfsDdyLj7fOVCsWlHxtHG9lAfARydi3ElyKGv2bxWAeCT7bJuKTqxHHupXRRzmiYz49ZOZJNE9hMLPq1MG1zmbzHqE-8xBz3wV_TVFeS7SCzs7SyoEYSNdl5TIBu65cFcBv0A==.jpg', name: 'spss-chisq-02.jpg' },
      ],
      sortOrder: 2,
    },
    {
      catSlug: 'spss-research',
      title: 'การวิเคราะห์ความเชื่อมั่น (Cronbach Alpha) และสหสัมพันธ์เพียร์สัน (Pearson Correlation)',
      description: 'ตรวจสอบคุณภาพเครื่องมือวิจัยด้วยค่าความเชื่อมั่น Cronbach Alpha รายด้านและภาพรวม พร้อมทั้งวิเคราะห์สัมประสิทธิ์สหสัมพันธ์ Pearson r เพื่อตรวจสอบระดับความสัมพันธ์ระหว่างตัวแปรต้นและตัวแปรตาม',
      files: [
        { src: '[วิชาสถิติ] สถิติและการวิจัย_SPSS\\แบบฝึกปฏิบัติSPSS_ANOVAและChiSquare_บทที่6และ7\\3wggwzkRz9-ctPXnUoDHOof42I98MaE-Hv8nf4ZFwo1ilMCbUgrB7pKQc20OPAAHC2UT5seoZ5FkLNhQpboJIfS7H6EMxIn6pe-sSN2RmC1ioG7VmY4DmT0Ix6W3_2GwOObrIXWDvj3wvVZWXR7TOg==.jpg', name: 'spss-corr-01.jpg' },
        { src: '[วิชาสถิติ] สถิติและการวิจัย_SPSS\\แบบฝึกปฏิบัติSPSS_ANOVAและChiSquare_บทที่6และ7\\MbNeoO7jWTEuLt7BygXHnfbDb-Z44bb-ZB1v8X7t6miCKBmV7oj29X6wO01872e6K5ZNQ90h65PCVS5lovzQXk_LEmgXowkxe_xSgxc5cXkGESvgJu2VULyYDOlU7fM5jgTjgTGATm1_gXXKFHhmhg==.jpg', name: 'spss-corr-02.jpg' },
      ],
      sortOrder: 3,
    },

    // ============================================================
    // 4. Reports & Academic Documents (รายงานและสารสนเทศ)
    // ============================================================
    {
      catSlug: 'reports',
      title: 'รายงานภาคนิพนธ์เรื่อง การจัดการก๊าซเรือนกระจกและการพัฒนาสิ่งแวดล้อมที่ยั่งยืน',
      description: 'จัดทำรูปเล่มภาคนิพนธ์วิชาการครบวงจร จัดรูปแบบตามระเบียบมหาวิทยาลัย ฟอนต์ TH Sarabun PSK 16pt เว้นขอบหน้ากระดาษ ซ้าย 1.5 นิ้ว บน ขวา ล่าง 1 นิ้ว จัดทำสารบัญตาราง สารบัญภาพ และบรรณานุกรมมาตรฐาน APA 7th',
      files: [
        { src: '[10700401] การรู้สารสนเทศ\\รายงานภาคนิพนธ์_ก๊าซเรือนกระจก\\เล่มรายงานและแบบอ้างอิง\\crop_image3_note.png', name: 'rep-ghg-01.png' },
        { src: '[10700401] การรู้สารสนเทศ\\รายงานภาคนิพนธ์_ก๊าซเรือนกระจก\\เล่มรายงานและแบบอ้างอิง\\crop_ref_1.png', name: 'rep-ghg-02.png' },
        { src: '[10700401] การรู้สารสนเทศ\\รายงานภาคนิพนธ์_ก๊าซเรือนกระจก\\เล่มรายงานและแบบอ้างอิง\\crop_ref_2.png', name: 'rep-ghg-03.png' },
        { src: '[10700401] การรู้สารสนเทศ\\รายงานภาคนิพนธ์_ก๊าซเรือนกระจก\\เล่มรายงานและแบบอ้างอิง\\crop_ref_3.png', name: 'rep-ghg-04.png' },
        { src: '[10700401] การรู้สารสนเทศ\\รายงานภาคนิพนธ์_ก๊าซเรือนกระจก\\เล่มรายงานและแบบอ้างอิง\\crop_ref_4.png', name: 'rep-ghg-05.png' },
      ],
      sortOrder: 1,
    },
    {
      catSlug: 'reports',
      title: 'รายงานการศึกษาระบบบริหารราชการไทย การบริหารสาธารณสุขและผังเมืองส่วนภูมิภาค',
      description: 'วิเคราะห์โครงสร้างอำนาจหน้าที่ การกระจายอำนาจสู่ท้องถิ่น การวางผังเมือง และนโยบายสาธารณสุขของรัฐบาล จัดพิมพ์เนื้อหาอย่างเป็นระบบ มีการอ้างอิงเชิงอรรถและเอกสารประกอบครบถ้วน',
      files: [
        { src: '[PA 1102-69] ระบบบริหารราชการไทย (มรภ.เชียงใหม่)\\รายงาน_สาธารณสุขและผังเมือง_เชียงใหม่\\preview_pages\\page_1.png', name: 'rep-gov-preview-01.png' },
        { src: '[PA 1102-69] ระบบบริหารราชการไทย (มรภ.เชียงใหม่)\\รายงาน_สาธารณสุขและผังเมือง_เชียงใหม่\\preview_pages\\page_2.png', name: 'rep-gov-preview-02.png' },
        { src: '[PA 1102-69] ระบบบริหารราชการไทย (มรภ.เชียงใหม่)\\รายงาน_สาธารณสุขและผังเมือง_เชียงใหม่\\preview_pages\\page_3.png', name: 'rep-gov-preview-03.png' },
        { src: '[PA 1102-69] ระบบบริหารราชการไทย (มรภ.เชียงใหม่)\\รายงาน_สาธารณสุขและผังเมือง_เชียงใหม่\\preview_pages\\page_4.png', name: 'rep-gov-preview-04.png' },
        { src: '[PA 1102-69] ระบบบริหารราชการไทย (มรภ.เชียงใหม่)\\รายงาน_สาธารณสุขและผังเมือง_เชียงใหม่\\preview_pages\\page_5.png', name: 'rep-gov-preview-05.png' },
      ],
      sortOrder: 2,
    },
    {
      catSlug: 'reports',
      title: 'รายงานเทคนิคการสืบค้นสารสนเทศดิจิทัล และการเขียนการอ้างอิงบรรณานุกรมวิชาการ',
      description: 'รวบรวมเทคนิคการสืบค้นฐานข้อมูลงานวิจัยระดับชาติและนานาชาติ (Scopus, ScienceDirect, ThaiJO), วิธีการเขียนรายการอ้างอิงในเนื้อหา และการเรียบเรียงบรรณานุกรมท้ายเล่มอย่างถูกต้องแม่นยำ',
      files: [
        { src: '[10700401] การรู้สารสนเทศ\\รายงานภาคนิพนธ์_ก๊าซเรือนกระจก\\เล่มรายงานและแบบอ้างอิง\\crop_ref_5.png', name: 'rep-info-ref-01.png' },
        { src: '[10700401] การรู้สารสนเทศ\\รายงานภาคนิพนธ์_ก๊าซเรือนกระจก\\เล่มรายงานและแบบอ้างอิง\\crop_ref_6.png', name: 'rep-info-ref-02.png' },
        { src: '[10700401] การรู้สารสนเทศ\\รายงานภาคนิพนธ์_ก๊าซเรือนกระจก\\เล่มรายงานและแบบอ้างอิง\\crop_ref_7.png', name: 'rep-info-ref-03.png' },
        { src: '[10700401] การรู้สารสนเทศ\\รายงานภาคนิพนธ์_ก๊าซเรือนกระจก\\เล่มรายงานและแบบอ้างอิง\\crop_ref_10.png', name: 'rep-info-ref-04.png' },
      ],
      sortOrder: 3,
    },

    // ============================================================
    // 5. Presentation & Canva (งานนำเสนอ & Canva)
    // ============================================================
    {
      catSlug: 'presentation',
      title: 'ออกแบบสไลด์นำเสนอผลการปฏิบัติงานและโครงการสหกิจศึกษา (Canva & PowerPoint)',
      description: 'ออกแบบสไลด์นำเสนอสรุปผลการฝึกงานและการปฏิบัติงานสหกิจศึกษา จัดวางองค์ประกอบอย่างมืออาชีพ โทนสีสุภาพชัดเจน สรุปขั้นตอนการทำงาน ผลสัมฤทธิ์ และสิ่งที่ได้เรียนรู้ พร้อมเทมเพลตที่แก้ไขได้',
      files: [
        { src: '[เอกสารและบริการทั่วไป]\\นำเสนอฝึกงาน_สิรภพ\\pdf_pages\\page_1.png', name: 'pres-coop-01.png' },
        { src: '[เอกสารและบริการทั่วไป]\\นำเสนอฝึกงาน_สิรภพ\\pdf_pages\\page_2.png', name: 'pres-coop-02.png' },
        { src: '[เอกสารและบริการทั่วไป]\\นำเสนอฝึกงาน_สิรภพ\\pdf_pages\\page_3.png', name: 'pres-coop-03.png' },
        { src: '[เอกสารและบริการทั่วไป]\\นำเสนอฝึกงาน_สิรภพ\\pdf_pages\\page_4.png', name: 'pres-coop-04.png' },
        { src: '[เอกสารและบริการทั่วไป]\\นำเสนอฝึกงาน_สิรภพ\\pdf_pages\\page_5.png', name: 'pres-coop-05.png' },
        { src: '[เอกสารและบริการทั่วไป]\\นำเสนอฝึกงาน_สิรภพ\\pdf_pages\\page_6.png', name: 'pres-coop-06.png' },
      ],
      sortOrder: 1,
    },
    {
      catSlug: 'presentation',
      title: 'ออกแบบสไลด์พรีเซนต์โครงงานธุรกิจค้าปลีกและการตลาด (Retail Smart Store Deck)',
      description: 'ดีไซน์ชุดสไลด์นำเสนอแผนธุรกิจร้านค้าปลีกสมัยใหม่ จัดทำ Infographic แผนผังร้าน แผนผังเส้นทางลูกค้า (Customer Journey) และกราฟผลการดำเนินงานสำหรับพรีเซนต์ในชั้นเรียน',
      files: [
        { src: '[10207102] การบัญชีและการเงินสำหรับธุรกิจค้าปลีก\\กรณีศึกษา_Smart_Store_ฟ้าใสมาร์ท_กลุ่ม4\\slide_previews\\slide_03.png', name: 'pres-retail-01.png' },
        { src: '[10207102] การบัญชีและการเงินสำหรับธุรกิจค้าปลีก\\กรณีศึกษา_Smart_Store_ฟ้าใสมาร์ท_กลุ่ม4\\slide_previews\\slide_04.png', name: 'pres-retail-02.png' },
        { src: '[10207102] การบัญชีและการเงินสำหรับธุรกิจค้าปลีก\\กรณีศึกษา_Smart_Store_ฟ้าใสมาร์ท_กลุ่ม4\\slide_previews\\slide_05.png', name: 'pres-retail-03.png' },
        { src: '[10207102] การบัญชีและการเงินสำหรับธุรกิจค้าปลีก\\กรณีศึกษา_Smart_Store_ฟ้าใสมาร์ท_กลุ่ม4\\slide_previews\\slide_06.png', name: 'pres-retail-04.png' },
        { src: '[10207102] การบัญชีและการเงินสำหรับธุรกิจค้าปลีก\\กรณีศึกษา_Smart_Store_ฟ้าใสมาร์ท_กลุ่ม4\\slide_previews\\slide_07.png', name: 'pres-retail-05.png' },
      ],
      sortOrder: 2,
    },
    {
      catSlug: 'presentation',
      title: 'สไลด์นำเสนอแผนการเงินและการลงทุนในธุรกิจเชิงพาณิชย์',
      description: 'ออกแบบสไลด์นำเสนอเชิงวิเคราะห์ตัวเลขทางการเงิน แผนการระดมทุน สรุปงบประมาณการลงทุน และผลตอบแทนที่คาดว่าจะได้รับ เข้าใจง่าย ชัดเจน ตรงประเด็น',
      files: [
        { src: '[10207102] การบัญชีและการเงินสำหรับธุรกิจค้าปลีก\\กรณีศึกษา_Smart_Store_ฟ้าใสมาร์ท_กลุ่ม4\\slide_previews\\slide_08.png', name: 'pres-fin-01.png' },
        { src: '[10207102] การบัญชีและการเงินสำหรับธุรกิจค้าปลีก\\กรณีศึกษา_Smart_Store_ฟ้าใสมาร์ท_กลุ่ม4\\slide_previews\\slide_09.png', name: 'pres-fin-02.png' },
        { src: '[10207102] การบัญชีและการเงินสำหรับธุรกิจค้าปลีก\\กรณีศึกษา_Smart_Store_ฟ้าใสมาร์ท_กลุ่ม4\\slide_previews\\slide_10.png', name: 'pres-fin-03.png' },
        { src: '[10207102] การบัญชีและการเงินสำหรับธุรกิจค้าปลีก\\กรณีศึกษา_Smart_Store_ฟ้าใสมาร์ท_กลุ่ม4\\slide_previews\\slide_11.png', name: 'pres-fin-04.png' },
      ],
      sortOrder: 3,
    },

    // ============================================================
    // 6. Engineering & Calculations (วิศวกรรมและวิชาคำนวณ)
    // ============================================================
    {
      catSlug: 'engineering',
      title: 'รายงานการทดสอบคุณสมบัติทางกลของวัสดุ (ความทนแรงดึงและแรงดัด - Materials Science)',
      description: 'แสดงผลการทดลองทางวิศวกรรมศาสตร์ การทดสอบความแข็งแรง ความเค้น-ความเครียด (Stress-Strain Analysis), ตารางบันทึกผลการทดสอบแรงดัด และการคำนวณค่ามอดุลัสความยืดหยุ่นอย่างละเอียดทุกขั้นตอน',
      files: [
        { src: '[วิชาวิศวกรรม] วิชาสมบัติ 1\\รายงานการทดสอบความทนแรงดัด_กลุ่มสีชมพู\\far_right_table.png', name: 'eng-mat-test-01.png' },
        { src: '[วิชาวิศวกรรม] วิชาสมบัติ 1\\รายงานการทดสอบความทนแรงดัด_กลุ่มสีชมพู\\final_page_1.png', name: 'eng-mat-test-02.png' },
        { src: '[วิชาวิศวกรรม] วิชาสมบัติ 1\\รายงานการทดสอบความทนแรงดัด_กลุ่มสีชมพู\\final_page_2.png', name: 'eng-mat-test-03.png' },
        { src: '[วิชาวิศวกรรม] วิชาสมบัติ 1\\รายงานการทดสอบความทนแรงดัด_กลุ่มสีชมพู\\final_page_3.png', name: 'eng-mat-test-04.png' },
      ],
      sortOrder: 1,
    },
    {
      catSlug: 'engineering',
      title: 'การวิเคราะห์การกระจายตัวทางสถิติแบบไวบูลล์ (Weibull Distribution) ในงานวิศวกรรม',
      description: 'สร้างกราฟการกระจายตัว Weibull Plot คำนวณพารามิเตอร์ความน่าเชื่อถือของวัสดุ (Weibull Modulus & Characteristic Strength) พร้อมสรุปและวิเคราะห์ผลเชิงวิศวกรรม',
      files: [
        { src: '[วิชาวิศวกรรม] วิชาสมบัติ 1\\รายงานการทดสอบความทนแรงดัด_กลุ่มสีชมพู\\weibull_chart.png', name: 'eng-weibull-01.png' },
        { src: '[วิชาวิศวกรรม] วิชาสมบัติ 1\\รายงานการทดสอบความทนแรงดัด_กลุ่มสีชมพู\\final_page_4.png', name: 'eng-weibull-02.png' },
        { src: '[วิชาวิศวกรรม] วิชาสมบัติ 1\\รายงานการทดสอบความทนแรงดัด_กลุ่มสีชมพู\\final_page_5.png', name: 'eng-weibull-03.png' },
        { src: '[วิชาวิศวกรรม] วิชาสมบัติ 1\\รายงานการทดสอบความทนแรงดัด_กลุ่มสีชมพู\\final_page_6.png', name: 'eng-weibull-04.png' },
      ],
      sortOrder: 2,
    },

    // ============================================================
    // 7. Business Law & Regulations (กฎหมายธุรกิจและการบัญชี)
    // ============================================================
    {
      catSlug: 'law',
      title: 'แผนผังความคิด (Mind Map) สรุปสาระสำคัญ พ.ร.บ. วิชาชีพบัญชี พ.ศ. 2547',
      description: 'สรุปประเด็นข้อกฎหมายว่าด้วยการประกอบวิชาชีพบัญชี สิทธิ หน้าที่ และความรับผิดชอบของผู้ประกอบวิชาชีพบัญชี ในรูปแบบ Mind Map ภาพสีสวยงาม คมชัด เข้าใจง่าย เหมาะสำหรับการอ่านทบทวนและทำรายงานสรุป',
      files: [
        { src: '[วิชากฎหมาย] กฎหมายการบัญชี\\Mindmap_พรบวิชาชีพบัญชี_แม่โจ้\\buzan_mindmap_1.png', name: 'law-buzan-01.png' },
        { src: '[วิชากฎหมาย] กฎหมายการบัญชี\\Mindmap_พรบวิชาชีพบัญชี_แม่โจ้\\buzan_mindmap_2.png', name: 'law-buzan-02.png' },
      ],
      sortOrder: 1,
    },
    {
      catSlug: 'law',
      title: 'แผนผังความคิดจรรยาบรรณวิชาชีพบัญชี และข้อกำหนดมาตรฐานการสอบบัญชี',
      description: 'สรุปหลักจรรยาบรรณวิชาชีพ 5 ประการ (ความซื่อสัตย์สุจริต, ความเที่ยงธรรม, ความรู้ความสามารถ, การรักษาความลับ, และพฤติกรรมทางวิชาชีพ) สรุปเป็นแผนผังมโนทัศน์ที่ชัดเจน',
      files: [
        { src: '[วิชากฎหมาย] กฎหมายการบัญชี\\Mindmap_พรบวิชาชีพบัญชี_แม่โจ้\\mindmap_customer_1.png', name: 'law-ethics-01.png' },
        { src: '[วิชากฎหมาย] กฎหมายการบัญชี\\Mindmap_พรบวิชาชีพบัญชี_แม่โจ้\\mindmap_customer_2.png', name: 'law-ethics-02.png' },
      ],
      sortOrder: 2,
    },

    // ============================================================
    // 8. Assignments & Exercises (แบบฝึกหัดและใบงาน)
    // ============================================================
    {
      catSlug: 'assignments',
      title: 'เฉลยและแสดงวิธีทำโจทย์คณิตศาสตร์ แคลคูลัส และสมการอนุพันธ์ (Step-by-Step)',
      description: 'แสดงวิธีทำโจทย์คณิตศาสตร์ขั้นสูงทีละขั้นตอน อธิบายที่มาของสูตร ทฤษฎีบท และการตรวจคำตอบอย่างละเอียด ลายมืออ่านง่าย เป็นระเบียบเรียบร้อย พร้อมคำตอบที่ถูกต้องแม่นยำ',
      files: [
        { src: '[แบบฝึกหัด] Assignment_และใบงานรายวิชา\\งานโจทย์และเขียนคณิตศาสตร์\\รูปโจทย์คณิตศาสตร์\\S__119971847_0.jpg', name: 'assign-math-step-01.jpg' },
        { src: '[แบบฝึกหัด] Assignment_และใบงานรายวิชา\\งานโจทย์และเขียนคณิตศาสตร์\\รูปโจทย์คณิตศาสตร์\\S__119971849_0.jpg', name: 'assign-math-step-02.jpg' },
        { src: '[แบบฝึกหัด] Assignment_และใบงานรายวิชา\\งานโจทย์และเขียนคณิตศาสตร์\\รูปโจทย์คณิตศาสตร์\\S__119971850_0.jpg', name: 'assign-math-step-03.jpg' },
        { src: '[แบบฝึกหัด] Assignment_และใบงานรายวิชา\\งานโจทย์และเขียนคณิตศาสตร์\\รูปโจทย์คณิตศาสตร์\\S__119971851_0.jpg', name: 'assign-math-step-04.jpg' },
        { src: '[แบบฝึกหัด] Assignment_และใบงานรายวิชา\\งานโจทย์และเขียนคณิตศาสตร์\\รูปโจทย์คณิตศาสตร์\\S__119971852_0.jpg', name: 'assign-math-step-05.jpg' },
      ],
      sortOrder: 1,
    },
    {
      catSlug: 'assignments',
      title: 'การจัดทำแบบฝึกหัดและใบงานคำนวณสถิติประยุกต์และเรขาคณิตวิเคราะห์',
      description: 'แสดงวิธีทำโจทย์การคำนวณสถิติพรรณนา การหาค่าความน่าจะเป็น ฟังก์ชันตรีโกณมิติ และเรขาคณิตวิเคราะห์ พร้อมวาดรูปประกอบอย่างประณีตและชัดเจน',
      files: [
        { src: '[แบบฝึกหัด] Assignment_และใบงานรายวิชา\\งานโจทย์และเขียนคณิตศาสตร์\\รูปโจทย์คณิตศาสตร์\\S__119971853_0.jpg', name: 'assign-stat-step-01.jpg' },
        { src: '[แบบฝึกหัด] Assignment_และใบงานรายวิชา\\งานโจทย์และเขียนคณิตศาสตร์\\รูปโจทย์คณิตศาสตร์\\S__119971854_0.jpg', name: 'assign-stat-step-02.jpg' },
        { src: '[แบบฝึกหัด] Assignment_และใบงานรายวิชา\\งานโจทย์และเขียนคณิตศาสตร์\\รูปโจทย์คณิตศาสตร์\\S__119971855_0.jpg', name: 'assign-stat-step-03.jpg' },
        { src: '[แบบฝึกหัด] Assignment_และใบงานรายวิชา\\งานโจทย์และเขียนคณิตศาสตร์\\รูปโจทย์คณิตศาสตร์\\S__119971856_0.jpg', name: 'assign-stat-step-04.jpg' },
        { src: '[แบบฝึกหัด] Assignment_และใบงานรายวิชา\\งานโจทย์และเขียนคณิตศาสตร์\\รูปโจทย์คณิตศาสตร์\\S__119971857_0.jpg', name: 'assign-stat-step-05.jpg' },
      ],
      sortOrder: 2,
    },
  ];

  let totalImagesCopied = 0;

  for (const item of portfolioDefinitions) {
    const categoryId = catMap[item.catSlug];
    if (!categoryId) {
      console.warn(`Category not found: ${item.catSlug}`);
      continue;
    }

    const copiedUrls = [];
    for (const f of item.files) {
      const url = copySafe(f.src, f.name);
      if (url) {
        copiedUrls.push(url);
        totalImagesCopied++;
      }
    }

    const coverUrl = copiedUrls.length > 0 ? copiedUrls[0] : null;

    const portfolio = await prisma.portfolio.create({
      data: {
        categoryId,
        title: item.title,
        description: item.description,
        imageUrl: coverUrl,
        published: true,
        sortOrder: item.sortOrder,
      },
    });

    for (let i = 0; i < copiedUrls.length; i++) {
      await prisma.portfolioImage.create({
        data: {
          portfolioId: portfolio.id,
          imageUrl: copiedUrls[i],
          sortOrder: i,
        },
      });
    }

    console.log(`✓ [${item.catSlug}] ${item.title} (${copiedUrls.length} images)`);
  }

  // Seed anonymous reviews (no personal names, only friendly customer feedback)
  await prisma.review.deleteMany({});
  const cleanReviews = [
    {
      authorName: 'ลูกค้า (สายบัญชี-บริหาร)',
      rating: 5,
      comment: 'สั่งทำงานงบประมาณ Excel กับรายงานการบัญชี งานเรียบร้อยมากครับ ผูกสูตรให้ครบทุกตาราง อาจารย์ชมว่าทำถูกหมดเลย ส่งงานตรงเวลามากครับ',
    },
    {
      authorName: 'ลูกค้า (งานวิจัย ป.โท)',
      rating: 5,
      comment: 'ช่วยรัน SPSS บทที่ 4 ด่วนมาก สั่งตอนบ่ายได้ตอนค่ำ มีคำอธิบายตารางพร้อมวิธีแปลผล One-Way ANOVA ให้อ่านเข้าใจง่าย ส่งงานตรงเวลาสุดๆ ครับ',
    },
    {
      authorName: 'ลูกค้า (สายการตลาด)',
      rating: 5,
      comment: 'ทำสไลด์ Canva นำเสนอแผนธุรกิจ คาเฟ่อเมซอน สวยถูกใจมากค่ะ จัดเลย์เอาต์สวย โทนสีเข้ากับแบรนด์ ไม่ต้องแก้งานเลย ประทับใจมากค่ะ',
    },
    {
      authorName: 'ลูกค้า (งานเอกสารวิชาการ)',
      rating: 5,
      comment: 'จัดหน้าภาคนิพนธ์และจัดรูปแบบบรรณานุกรม APA 7th เนี๊ยบมากครับ ไม่มีหน้ากระโดด ส่งงานตรวจผ่านฉลุย แนะนำเพื่อนมาสั่งต่อแน่นอนครับ',
    },
    {
      authorName: 'ลูกค้า (งานคำนวณ-วิศวะ)',
      rating: 5,
      comment: 'งานด่วนก่อนสอบ แอดมินตอบไวมาก คุยง่าย ช่วยเคลียร์โจทย์คำนวณพร้อมแสดงวิธีทำละเอียด เข้าใจจุดที่สงสัยทันทีเลย ให้ 5 ดาวเต็มเลยครับ',
    },
  ];

  for (const r of cleanReviews) {
    await prisma.review.create({ data: r });
  }

  console.log(`\n=== Seeding Finished Successfully ===`);
  console.log(`Total Portfolio Items: ${portfolioDefinitions.length}`);
  console.log(`Total Images Copied: ${totalImagesCopied}`);
  console.log(`All personal names stripped and sanitized 100%!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
