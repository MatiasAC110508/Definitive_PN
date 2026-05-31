import { PrismaClient, SaleType as PrismaSaleType } from "@prisma/client";
import { CreateSaleDto, ISaleRepository } from "../../domain/repositories/sale.repository";
import { Sale, SaleType } from "../../domain/entities/sale.entity";
import { getPrismaClient } from "@/infrastructure/database/prisma";

export class PrismaSaleRepository implements ISaleRepository {
  async create(data: CreateSaleDto): Promise<Sale> {
    const prisma = getPrismaClient();
    const sale = await prisma.sale.create({
      data: {
        customerName: data.customerName,
        amount: data.amount,
        description: data.description,
        saleType: data.saleType as PrismaSaleType,
      },
    });

    return this.mapToDomain(sale);
  }

  async findAll(): Promise<Sale[]> {
    const prisma = getPrismaClient();
    const sales = await prisma.sale.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return sales.map(this.mapToDomain);
  }

  async findById(id: string): Promise<Sale | null> {
    const prisma = getPrismaClient();
    const sale = await prisma.sale.findUnique({
      where: { id },
    });
    return sale ? this.mapToDomain(sale) : null;
  }

  async delete(id: string): Promise<void> {
    const prisma = getPrismaClient();
    await prisma.sale.delete({
      where: { id },
    });
  }

  private mapToDomain(sale: any): Sale {
    return {
      id: sale.id,
      customerName: sale.customerName,
      amount: sale.amount,
      description: sale.description,
      saleType: sale.saleType as SaleType,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
    };
  }
}
