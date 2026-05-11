import type { ServiceRepository } from "@/domain/repositories/service.repository";

export class ListServicesUseCase {
  constructor(private readonly services: ServiceRepository) {}

  execute() {
    return this.services.findAll();
  }
}
