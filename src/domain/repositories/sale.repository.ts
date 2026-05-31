import { Sale } from "../entities/sale.entity";

export interface CreateSaleDto {
  customerName?: string | null;
  amount: number;
  description: string;
  saleType: "SERVICE" | "PRODUCT" | "PACKAGE" | "OTHER";
}

export interface ISaleRepository {
  create(data: CreateSaleDto): Promise<Sale>;
  findAll(): Promise<Sale[]>;
  findById(id: string): Promise<Sale | null>;
  delete(id: string): Promise<void>;
}
