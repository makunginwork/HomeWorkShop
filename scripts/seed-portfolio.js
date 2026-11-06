const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const srcBase = 'C:\\แฟนฉัน\\งานรับจ้าง';
const destBase = path.join(process.cwd(), 'public', 'uploads', 'portfolio');

if (!fs.existsSync(destBase)) {
  fs.mkdirSync(destBase, { recursive: true });
}

function copySafe(srcRelPath, destFileName) {
  const fullSrc = path.join(srcBase, srcRelPath);
  const fullDest = path.join(destBase, destFileName);
  try {
    if (fs.existsSync(fullSrc)) {
      fs.copyFileSync(fullSrc, fullDest);
      return `/uploads/portfolio/${destFileName}`;
    } else {
      console.warn('Source file not found:', fullSrc);
    }
  } catch (err) {
    console.error('Error copying file:', err.message);
  }
  return null;
}

async function main() {
  console.log('Seeding portfolio categories and real project items...');

  // 1. Categories
  const categoriesData = [
    {
      name: 'การบัญชีและการเงิน',
      slug: 'accounting',
      icon: '📊',
      sortOrder: 1,
    },
    {
      name: 'แผนธุรกิจและการตลาด',
      slug: 'business-plan',
      icon: '📑',
      sortOrder: 2,
    },
    {
      name: 'สถิติและการวิจัย SPSS',
      slug: 'spss-research',
      icon: '📈',
      sortOrder: 3,
    },
    {
      name: 'รายงานและสารสนเทศ',
      slug: 'reports',
      icon: '📄',
      sortOrder: 4,
    },
    {
      name: 'งานนำเสนอ & Canva',
      slug: 'presentation',
      icon: '🎨',
      sortOrder: 5,
    },
    {
      name: 'วิศวกรรมและวิชาคำนวณ',
      slug: 'engineering',
      icon: '⚙️',
      sortOrder: 6,
    },
    {
      name: 'กฎหมายธุรกิจและการบัญชี',
      slug: 'law',
      icon: '⚖️',
      sortOrder: 7,
    },
    {
      name: 'แบบฝึกหัดและใบงาน',
      slug: 'assignments',
      icon: '✏️',
      sortOrder: 8,
    },
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

  // 2. Clear old portfolios to re-populate cleanly
  await prisma.portfolioImage.deleteMany({});
  await prisma.portfolio.deleteMany({});

  // 3. Define Portfolio Items with real files from C:\แฟนฉัน\งานรับจ้าง
  const portfolioItems = [
    // === 1. Accounting ===
    {
      catSlug: 'accounting',
      title: 'การจัดทำงบประมาณการดำเนินงานและงบการเงิน ประจำปี 2569 (Excel & รายงาน)',
      description: 'งานวิเคราะห์และจัดทำประมาณการงบประมาณรายรับ-รายจ่าย งบกำไรขาดทุนเบ็ดเสร็จ งบต้นทุนการผลิต พร้อมทั้งผูกสูตรอัตโนมัติใน Excel และจัดรูปเล่มรายงานมาตรฐานสรุปตัวเลขทางการเงินอย่างละเอียด',
      files: [
        { src: '[10203215] การบัญชีเพื่อการจัดการ\\งานงบประมาณ2569\\น้องคนที่1\\รุป\\22373_0.jpg', name: 'acc-budget-1.jpg' },
        { src: '[10203215] การบัญชีเพื่อการจัดการ\\งานงบประมาณ2569\\น้องคนที่1\\รุป\\22374_0.jpg', name: 'acc-budget-2.jpg' },
        { src: '[10203215] การบัญชีเพื่อการจัดการ\\งานงบประมาณ2569\\น้องคนที่1\\รุป\\22375_0.jpg', name: 'acc-budget-3.jpg' },
      ],
      sortOrder: 1,
    },
    {
      catSlug: 'accounting',
      title: 'วิเคราะห์โครงสร้างต้นทุนและจุดคุ้มทุน (CVP Analysis) กรณีศึกษา Smart Store',
      description: 'คำนวณจุดคุ้มทุน (Break-Even Point), Margin of Safety, และวิเคราะห์อัตรากำไรผันแปร พร้อมจัดทำกราฟแสดงความสัมพันธ์ต้นทุน-ปริมาณ-กำไรประกอบรายงานการบริหารการเงินร้านค้าปลีก',
      files: [
        { src: '[10207102] การบัญชีและการเงินสำหรับธุรกิจค้าปลีก\\กรณีศึกษา_Smart_Store_ฟ้าใสมาร์ท_กลุ่ม4\\chart_2_cvp_verified.png', name: 'acc-cvp-1.png' },
        { src: '[10207102] การบัญชีและการเงินสำหรับธุรกิจค้าปลีก\\กรณีศึกษา_Smart_Store_ฟ้าใสมาร์ท_กลุ่ม4\\chart_3_wc_verified.png', name: 'acc-wc-2.png' },
        { src: '[10207102] การบัญชีและการเงินสำหรับธุรกิจค้าปลีก\\กรณีศึกษา_Smart_Store_ฟ้าใสมาร์ท_กลุ่ม4\\bg_cover.png', name: 'acc-cover-3.png' },
      ],
      sortOrder: 2,
    },
    {
      catSlug: 'accounting',
      title: 'วิเคราะห์งบการเงินบริษัทจดทะเบียน (ALUCON & AMC) และอัตราส่วนทางการเงิน 5 ด้าน',
      description: 'การวิเคราะห์แนวนอน (Horizontal Analysis), แนวดิ่ง (Vertical Analysis) และคำนวณอัตราส่วนทางการเงิน: สภาพคล่อง, ประสิทธิภาพการบริหารสินทรัพย์, ภาระหนี้สิน และความสามารถในการทำกำไร',
      files: [
        { src: '[10203215] การบัญชีเพื่อการจัดการ\\งานงบประมาณ2569\\น้องคนที่2\\S__5087243_0.jpg', name: 'acc-alucon-1.jpg' },
        { src: '[10203215] การบัญชีเพื่อการจัดการ\\งานงบประมาณ2569\\น้องคนที่2\\S__5087244_0.jpg', name: 'acc-alucon-2.jpg' },
        { src: '[10203215] การบัญชีเพื่อการจัดการ\\งานงบประมาณ2569\\น้องคนที่2\\S__5087245_0.jpg', name: 'acc-alucon-3.jpg' },
      ],
      sortOrder: 3,
    },

    // === 2. Business Plan ===
    {
      catSlug: 'business-plan',
      title: 'แผนกลยุทธ์ธุรกิจและการตลาด ร้าน Cafe Amazon (สไลด์นำเสนอ & รายงาน)',
      description: 'การวิเคราะห์สภาพแวดล้อมธุรกิจ PESTEL, Porter Five Forces, SWOT Analysis, กลยุทธ์ 7Ps และแผนการเงินเพื่อการขยายสาขา พร้อมออกแบบสไลด์พรีเซนต์ระดับพรีเมียม',
      files: [
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\นำเสนอ_สไลด์_Cafe_Amazon\\docx_extracted\\img_1.png', name: 'biz-amazon-1.png' },
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\นำเสนอ_สไลด์_Cafe_Amazon\\docx_extracted\\img_10.png', name: 'biz-amazon-2.png' },
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\นำเสนอ_สไลด์_Cafe_Amazon\\docx_extracted\\img_11.png', name: 'biz-amazon-3.png' },
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\นำเสนอ_สไลด์_Cafe_Amazon\\docx_extracted\\img_12.png', name: 'biz-amazon-4.png' },
      ],
      sortOrder: 1,
    },
    {
      catSlug: 'business-plan',
      title: 'แผนธุรกิจสินค้าเกษตรแปรรูปและสมุนไพร "Herb Care"',
      description: 'การจัดทำ Business Model Canvas (BMC), วางตำแหน่งผลิตภัณฑ์ (Positioning), แผนการตลาดดิจิทัล และการประเมินความเสี่ยงทางธุรกิจ พร้อมไฟล์ Word และ PDF จัดหน้าสวยงาม',
      files: [
        { src: '[วิชาแผนธุรกิจ] แผนธุรกิจและการตลาด\\นำเสนอ_สไลด์_Cafe_Amazon\\cafe_amazon_bg.jpg', name: 'biz-herb-1.jpg' },
      ],
      sortOrder: 2,
    },

    // === 3. SPSS & Statistics ===
    {
      catSlug: 'spss-research',
      title: 'วิเคราะห์ข้อมูลทางสถิติ One-Way ANOVA และ Chi-Square ด้วย SPSS',
      description: 'ทำความสะอาดข้อมูล (Data Cleaning), ทดสอบสมมติฐาน, รันคำสั่งสถิติพรรณนาและอนุมาน (One-Way ANOVA, Post-Hoc Tests, Chi-Square Test) พร้อมแปลผลตารางผลลัพธ์เป็นภาษาไทยตามหลักวิชาการ',
      files: [
        { src: '[วิชาสถิติ] สถิติและการวิจัย_SPSS\\แบบฝึกปฏิบัติSPSS_ANOVAและChiSquare_บทที่6และ7\\3wggwzkRz9-ctPXnUoDHOof42I98MaE-Hv8nf4ZFwo1ilMCbUgrB7pKQc20OPAAHC2UT5seoZ5FkLNhQpboJIfS7H6EMxIn6pe-sSN2RmC1ioG7VmY4DmT0Ix6W3_2GwOObrIXWDvj3wvVZWXR7TOg==.jpg', name: 'spss-anova-1.jpg' },
        { src: '[วิชาสถิติ] สถิติและการวิจัย_SPSS\\แบบฝึกปฏิบัติSPSS_ANOVAและChiSquare_บทที่6และ7\\5RvHypMlYaFqQA0Tgdq68-TMGuEzu4ucBXuGD1SFaY7GCMkvT2xQ9mIoi3W1ePrXRjc1pcaS-q2HYSP_DvhP4K4bbHzKVCrXwbh5Y8m2lWl3sNQC6dkOCzCrNvVj0mgIr6fRbKROf4YksHppMo5QDQ==.jpg', name: 'spss-anova-2.jpg' },
        { src: '[วิชาสถิติ] สถิติและการวิจัย_SPSS\\แบบฝึกปฏิบัติSPSS_ANOVAและChiSquare_บทที่6และ7\\8bCJ78Mj_P73s20IR0D_VPTv0q6goCdq7Z3G-GLi_ckZNunKpxDyZG_54BOan3HaBmiItLUgV4PuY_KiG9NWVsGfaypTexjN3nH3ptoyroUnhscGJTcbPGQda1Tj6p11yoEYSNdl5TIBu65cFcBv0A==.jpg', name: 'spss-anova-3.jpg' },
      ],
      sortOrder: 1,
    },
    {
      catSlug: 'spss-research',
      title: 'การวิเคราะห์แบบสอบถามความพึงพอใจและสหสัมพันธ์ (Correlation & Multiple Regression)',
      description: 'วิเคราะห์ค่าความเชื่อมั่นแบบสอบถาม (Cronbach Alpha), สัมประสิทธิ์สหสัมพันธ์ Pearson, และการวิเคราะห์การถดถอยพหุคูณ สรุปรายงานบทที่ 4 และ 5 พร้อมส่งมอบทั้งไฟล์ .sav, .spv และรายงาน Word',
      files: [
        { src: '[วิชาสถิติ] สถิติและการวิจัย_SPSS\\แบบฝึกปฏิบัติSPSS_ANOVAและChiSquare_บทที่6และ7\\b3-g7qK3x6V3yvK9y_Hw-pU-h81_B6G3qfN0xHk54Fk1_d3yM7z_qP4wO01872e6K5ZNQ90h65PCVS5lovzQXk_LEmgXowkxe_xSgxc5cXkGESvgJu2VULyYDOlU7fM5jgTjgTGATm1_gXXKFHhmhg==.jpg', name: 'spss-reg-1.jpg' },
        { src: '[วิชาสถิติ] สถิติและการวิจัย_SPSS\\แบบฝึกปฏิบัติSPSS_ANOVAและChiSquare_บทที่6และ7\\MbNeoO7jWTEuLt7BygXHnfbDb-Z44bb-ZB1v8X7t6miCKBmV7oj29X6wO01872e6K5ZNQ90h65PCVS5lovzQXk_LEmgXowkxe_xSgxc5cXkGESvgJu2VULyYDOlU7fM5jgTjgTGATm1_gXXKFHhmhg==.jpg', name: 'spss-reg-2.jpg' },
      ],
      sortOrder: 2,
    },

    // === 4. Reports ===
    {
      catSlug: 'reports',
      title: 'รายงานการศึกษาระบบบริหารราชการไทยและธรรมาภิบาลภาครัฐ',
      description: 'รายงานวิชาการครอบคลุมประวัติการปฏิรูประบบราชการไทย โครงสร้างกระทรวง ทบวง กรม กฎหมายระเบียบบริหารราชการแผ่นดิน พร้อมจัดรูปเล่ม สารบัญ บรรณานุกรมตามรูปแบบ APA 7th',
      files: [
        { src: '[PA 1102-69] ระบบบริหารราชการไทย (มรภ.เชียงใหม่)\\รายงาน_สาธารณสุขและผังเมือง_เชียงใหม่\\7OCnMXfPy0YJ3AXbjIOivbdrDy2IOTZfJJv7_cGShzq6S2WvDtMlIAZOqTCl1jh1NPWyHFdfXeha-R66lXdeU6lBMrNcQ4uFjWuFDwSjpVw2gx6vAFs1p8qx4Ur8rfQZ-Y6RmCFYWj9R9NUu3GhWkQ==.jpg', name: 'rep-gov-1.jpg' },
        { src: '[PA 1102-69] ระบบบริหารราชการไทย (มรภ.เชียงใหม่)\\รายงาน_สาธารณสุขและผังเมือง_เชียงใหม่\\9Cg39eJqHBgcz_fDO4jA_hUQl0sx3JGMQwuhYtXPpnA3OuTGzDtkVidUvIXzBEoyifIHtz4G3DVudUwOu59wxfkszjtHAoCewFkX7g9sO-I08HVgAKEl-SK-68uunUl2dWH1GW1Hzzc1ZjJIrpDCnQ==.jpg', name: 'rep-gov-2.jpg' },
      ],
      sortOrder: 1,
    },
    {
      catSlug: 'reports',
      title: 'รายงานการรู้สารสนเทศและการสืบค้นฐานข้อมูลวิชาการดิจิทัล',
      description: 'เทคนิคการสืบค้นสารสนเทศขั้นสูง การประเมินความน่าเชื่อถือของแหล่งข้อมูล และการเขียนอ้างอิงเอกสารวิชาการ จัดพิมพ์ด้วยฟอนต์ราชการ TH Sarabun PSK เว้นระยะขอบถูกต้องตามเกณฑ์',
      files: [
        { src: '[10700401] การรู้สารสนเทศ\\รายงานภาคนิพนธ์_ก๊าซเรือนกระจก\\งานแก้ไขส่งลูกค้า\\S__5718047.jpg', name: 'rep-info-1.jpg' },
        { src: '[10700401] การรู้สารสนเทศ\\รายงานภาคนิพนธ์_ก๊าซเรือนกระจก\\งานแก้ไขส่งลูกค้า\\S__5718048.jpg', name: 'rep-info-2.jpg' },
        { src: '[10700401] การรู้สารสนเทศ\\รายงานภาคนิพนธ์_ก๊าซเรือนกระจก\\งานแก้ไขส่งลูกค้า\\S__5718049.jpg', name: 'rep-info-3.jpg' },
      ],
      sortOrder: 2,
    },

    // === 5. Presentation & Canva ===
    {
      catSlug: 'presentation',
      title: 'สไลด์นำเสนอผลการฝึกงานและการปฏิบัติงานสหกิจศึกษา',
      description: 'ออกแบบสไลด์ PowerPoint / Canva สำหรับพรีเซนต์จบการฝึกงาน จัดวาง Layout เรียบหรู ชัดเจน สรุปผลงาน แผนผังการทำงาน และสิ่งที่ได้เรียนรู้ พร้อมเทมเพลตที่แก้ไขได้',
      files: [
        { src: '[เอกสารและบริการทั่วไป]\\นำเสนอฝึกงาน_สิรภพ\\line_oa_chat_260926_221801.jpg', name: 'pres-intern-1.jpg' },
        { src: '[เอกสารและบริการทั่วไป]\\นำเสนอฝึกงาน_สิรภพ\\line_oa_chat_260926_221804.jpg', name: 'pres-intern-2.jpg' },
        { src: '[เอกสารและบริการทั่วไป]\\นำเสนอฝึกงาน_สิรภพ\\line_oa_chat_260926_221807.jpg', name: 'pres-intern-3.jpg' },
      ],
      sortOrder: 1,
    },

    // === 6. Engineering ===
    {
      catSlug: 'engineering',
      title: 'แบบฝึกหัดคำนวณคุณสมบัติของวัสดุและวิศวกรรมศาสตร์ (Materials Science)',
      description: 'แสดงวิธีทำคำนวณอย่างละเอียดทีละขั้นตอน เขียนสมการ สูตรคณิตศาสตร์ ตารางผลการทดสอบแรงดึง แรงเฉือน และคุณสมบัติทางความร้อนของโลหะและโพลิเมอร์',
      files: [
        { src: '[วิชาวิศวกรรม] วิชาสมบัติ 1\\รายงานการทดสอบความทนแรงดัด_กลุ่มสีชมพู\\far_right_table.png', name: 'eng-mat-1.png' },
        { src: '[วิชาวิศวกรรม] วิชาสมบัติ 1\\รายงานการทดสอบความทนแรงดัด_กลุ่มสีชมพู\\final_page_1.png', name: 'eng-mat-2.png' },
        { src: '[วิชาวิศวกรรม] วิชาสมบัติ 1\\รายงานการทดสอบความทนแรงดัด_กลุ่มสีชมพู\\final_page_2.png', name: 'eng-mat-3.png' },
      ],
      sortOrder: 1,
    },

    // === 7. Law ===
    {
      catSlug: 'law',
      title: 'แผนผังความคิด (Mind Map) กฎหมายการบัญชีและพระราชบัญญัติวิชาชีพบัญชี',
      description: 'สรุปประเด็นข้อกฎหมายสำคัญ พ.ร.บ.การบัญชี พ.ศ. 2543 และจรรยาบรรณวิชาชีพบัญชีในรูปแบบ Mind Map ภาพสีสวยงาม เข้าใจง่าย เหมาะสำหรับการอ่านทบทวนและทำรายงานสรุป',
      files: [
        { src: '[วิชากฎหมาย] กฎหมายการบัญชี\\Mindmap_พรบวิชาชีพบัญชี_แม่โจ้\\buzan_mindmap_1.png', name: 'law-mindmap-1.png' },
        { src: '[วิชากฎหมาย] กฎหมายการบัญชี\\Mindmap_พรบวิชาชีพบัญชี_แม่โจ้\\buzan_mindmap_2.png', name: 'law-mindmap-2.png' },
        { src: '[วิชากฎหมาย] กฎหมายการบัญชี\\Mindmap_พรบวิชาชีพบัญชี_แม่โจ้\\mindmap_customer_1.png', name: 'law-mindmap-3.png' },
      ],
      sortOrder: 1,
    },

    // === 8. Assignments ===
    {
      catSlug: 'assignments',
      title: 'เฉลยและวิธีทำแบบฝึกหัดคณิตศาสตร์และสถิติรายวิชา (Step-by-Step)',
      description: 'แสดงวิธีทำโจทย์แบบละเอียดทุกขั้นตอน พร้อมคำอธิบายเหตุผลและการตรวจคำตอบ ลายมือเป็นระเบียบหรือพิมพ์ลง Word/PDF ชัดเจนตามที่อาจารย์กำหนด',
      files: [
        { src: '[แบบฝึกหัด] Assignment_และใบงานรายวิชา\\งานโจทย์และเขียนคณิตศาสตร์\\รูปโจทย์_ชุดที่1\\1-1.jpg', name: 'assign-math-1.jpg' },
        { src: '[แบบฝึกหัด] Assignment_และใบงานรายวิชา\\งานโจทย์และเขียนคณิตศาสตร์\\รูปโจทย์_ชุดที่1\\1-2.jpg', name: 'assign-math-2.jpg' },
        { src: '[แบบฝึกหัด] Assignment_และใบงานรายวิชา\\งานโจทย์และเขียนคณิตศาสตร์\\รูปโจทย์_ชุดที่1\\1-3.jpg', name: 'assign-math-3.jpg' },
      ],
      sortOrder: 1,
    },
  ];

  // Insert Portfolios & Copy Images
  for (const item of portfolioItems) {
    const categoryId = catMap[item.catSlug];
    if (!categoryId) continue;

    const copiedUrls = [];
    for (const f of item.files) {
      const url = copySafe(f.src, f.name);
      if (url) copiedUrls.push(url);
    }

    const coverUrl = copiedUrls[0] || null;

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

    // Add portfolio images
    for (let i = 0; i < copiedUrls.length; i++) {
      await prisma.portfolioImage.create({
        data: {
          portfolioId: portfolio.id,
          imageUrl: copiedUrls[i],
          sortOrder: i,
        },
      });
    }

    console.log(`✓ Created portfolio: ${item.title} (${copiedUrls.length} images)`);
  }

  // 4. Seed Reviews
  await prisma.review.deleteMany({});
  const initialReviews = [
    {
      authorName: 'คุณพลอย (ม.เชียงใหม่)',
      rating: 5,
      comment: 'สั่งทำงานงบประมาณ Excel กับรายงานการบัญชี งานเรียบร้อยมากค่ะ ผูกสูตรให้ครบทุกตาราง อาจารย์ชมว่าทำถูกหมดเลย ขอบคุณมากนะคะ ไว้วางใจสั่งต่อแน่นอน',
    },
    {
      authorName: 'คุณแบงค์ (ม.รามคำแหง)',
      rating: 5,
      comment: 'ช่วยรัน SPSS บทที่ 4 ด่วนมาก สั่งตอนบ่ายได้ตอนค่ำ มีคำอธิบายตารางพร้อมวิธีแปลผล One-Way ANOVA ให้อ่านเข้าใจง่าย ส่งงานตรงเวลาสุดๆ ครับ',
    },
    {
      authorName: 'น้องมิ้นท์ (จุฬาลงกรณ์)',
      rating: 5,
      comment: 'ทำสไลด์ Canva นำเสนอแผนธุรกิจ Cafe Amazon สวยถูกใจมากค่ะ จัดเลย์เอาต์สวย โทนสีเข้ากับแบรนด์ ไม่ต้องแก้งานเลย ประทับใจมากค่ะ',
    },
    {
      authorName: 'คุณเก่ง (ม.เกษตรศาสตร์)',
      rating: 5,
      comment: 'จัดหน้าวิทยานิพนธ์และแปลงไฟล์สารบัญ APA 7th เนี๊ยบมากครับ ไม่มีหน้ากระโดด ส่งงานตรวจผ่านฉลุย แนะนำเพื่อนมาสั่งทุกคนครับ',
    },
    {
      authorName: 'คุณน้ำฝน (มศว)',
      rating: 5,
      comment: 'งานด่วนสั่งก่อนสอบ 1 วัน แอดมินตอบไวมาก คุยง่าย ช่วยเคลียร์โจทย์คำนวณพร้อมวิธีทำละเอียด เข้าใจจุดที่สงสัยทันทีเลยค่ะ ให้ 5 ดาวเต็มเลย',
    },
  ];

  for (const r of initialReviews) {
    await prisma.review.create({ data: r });
  }
  console.log(`✓ Seeded ${initialReviews.length} customer reviews`);

  console.log('Seed completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
