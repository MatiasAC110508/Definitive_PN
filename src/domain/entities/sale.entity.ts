export enum SaleType {
  SERVICE = "SERVICE",
  PRODUCT = "PRODUCT",
  PACKAGE = "PACKAGE",
  OTHER = "OTHER",
}

export interface Sale {
  id: string;
  customerName: string | null;
  amount: number;
  description: string;
  saleType: SaleType;
  createdAt: Date;
  updatedAt: Date;
}
