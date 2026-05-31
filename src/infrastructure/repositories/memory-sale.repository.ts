import { Sale, SaleType } from "@/domain/entities/sale.entity";
import { CreateSaleDto, ISaleRepository } from "@/domain/repositories/sale.repository";

const sales: Sale[] = [];

export class MemorySaleRepository implements ISaleRepository {
  async create(data: CreateSaleDto): Promise<Sale> {
    const sale: Sale = {
      id: `sale-${Math.random().toString(36).substring(2, 9)}`,
      customerName: data.customerName ?? null,
      amount: data.amount,
      description: data.description,
      saleType: data.saleType as SaleType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    sales.unshift(sale);
    return sale;
  }

  async findAll(): Promise<Sale[]> {
    return [...sales].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findById(id: string): Promise<Sale | null> {
    return sales.find((s) => s.id === id) ?? null;
  }

  async delete(id: string): Promise<void> {
    const index = sales.findIndex((s) => s.id === id);
    if (index !== -1) {
      sales.splice(index, 1);
    }
  }
}
