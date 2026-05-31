import { ISaleRepository } from "../../../domain/repositories/sale.repository";

export class DeleteSaleUseCase {
  constructor(private readonly saleRepository: ISaleRepository) {}

  async execute(id: string) {
    return this.saleRepository.delete(id);
  }
}
