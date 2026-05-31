import { ISaleRepository } from "../../../domain/repositories/sale.repository";

export class GetSalesUseCase {
  constructor(private readonly saleRepository: ISaleRepository) {}

  async execute() {
    return this.saleRepository.findAll();
  }
}
