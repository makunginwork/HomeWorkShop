// ประเภทสถานะงานทั้งหมดในระบบ (ซิงค์กับ Prisma Schema enum Status)
export type OrderStatus = "PENDING_DEPOSIT" | "IN_PROGRESS" | "DELIVERED";

// ข้อมูลลูกค้า
export type Customer = {
  id: string;
  lineUid: string;
  displayName: string;
  createdAt: string;
};

// ข้อมูลออเดอร์ (สำหรับฝั่ง Client ที่ไม่มี customer nested)
export type Order = {
  id: string;
  title: string;
  totalPrice: number;
  status: OrderStatus;
  startDate: string;
  dueDate?: string | null;
  fileLink?: string | null;
  createdAt: string;
  updatedAt: string;
};

// ข้อมูลออเดอร์พร้อมข้อมูลลูกค้า (สำหรับฝั่ง Admin ที่ include customer)
export type OrderWithCustomer = Order & {
  customer: Customer;
};

// ข้อมูลที่ส่งมาจากฟอร์มสร้างออเดอร์ใหม่ (Admin Dashboard)
export type CreateOrderPayload = {
  lineUid: string;
  displayName: string;
  title: string;
  totalPrice: number;
  dueDate: string | null;
};

// ข้อมูลที่ส่งมาจากฟอร์มอัปเดตสถานะออเดอร์ (Admin Popup)
export type UpdateOrderPayload = {
  status: OrderStatus;
  fileLink: string;
  dueDate?: string | null;
};

// ============================================================
// Blog Types
// ============================================================

// ข้อมูลบทความ Blog (ซิงค์กับ Prisma Model Post)
export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  coverImage?: string | null;
  createdAt: string;
  updatedAt: string;
};

// ข้อมูลที่ส่งมาจากฟอร์มสร้าง/แก้ไขบทความ (Admin)
export type CreatePostPayload = {
  title: string;
  slug: string;
  content: string;
  published: boolean;
  coverImage?: string;
};

export type UpdatePostPayload = Partial<CreatePostPayload>;

// ============================================================
// Portfolio / Category Types
// ============================================================

// ประเภทงาน
export type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  sortOrder: number;
  createdAt: string;
};

// ประเภทงานพร้อมจำนวนผลงาน
export type CategoryWithCount = Category & {
  _count: { portfolios: number };
};

// รูปภาพเพิ่มเติมของผลงาน
export type PortfolioImage = {
  id: string;
  portfolioId: string;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
};

// ผลงาน
export type PortfolioItem = {
  id: string;
  categoryId: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  images?: PortfolioImage[];
};

// ผลงานพร้อมข้อมูลประเภทงาน
export type PortfolioWithCategory = PortfolioItem & {
  category: Category;
  images?: PortfolioImage[];
};

// Payload สำหรับสร้างผลงาน
export type CreatePortfolioPayload = {
  categoryId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  published?: boolean;
  images?: string[];
};

export type UpdatePortfolioPayload = Partial<CreatePortfolioPayload>;

// Payload สำหรับสร้างประเภทงาน
export type CreateCategoryPayload = {
  name: string;
  slug: string;
  icon?: string;
  sortOrder?: number;
};

// รีวิวจากลูกค้า
export type Review = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  lineUid?: string | null;
  visible: boolean;
  createdAt: string;
};

export type CreateReviewPayload = {
  authorName: string;
  rating: number;
  comment: string;
  lineUid?: string;
};
