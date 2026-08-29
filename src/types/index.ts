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
};
