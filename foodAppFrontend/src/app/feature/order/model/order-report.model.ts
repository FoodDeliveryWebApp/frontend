export interface OrderReport {
  id: number;
  orderId: number;
  guestId: number;
  description: string;
  answer?: string;
  status: string;
  createdAt: string;
}

export interface OrderReportCreate {
  orderId: number;
  description: string;
}
