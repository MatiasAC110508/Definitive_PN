import { ISaleRepository, CreateSaleDto } from "../../../domain/repositories/sale.repository";

export class CreateSaleUseCase {
  constructor(private readonly saleRepository: ISaleRepository) {}

  async execute(data: CreateSaleDto) {
    return this.saleRepository.create(data);
  }
}
