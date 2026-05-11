import { MemoryAppointmentRepository } from "@/infrastructure/repositories/memory-appointment.repository";
import { MemoryProductRepository } from "@/infrastructure/repositories/memory-product.repository";
import { MemoryScheduleRepository } from "@/infrastructure/repositories/memory-schedule.repository";
import { MemoryServiceRepository } from "@/infrastructure/repositories/memory-service.repository";
import { MemoryUserRepository } from "@/infrastructure/repositories/memory-user.repository";
import { PrismaAppointmentRepository } from "@/infrastructure/repositories/prisma-appointment.repository";
import { PrismaProductRepository } from "@/infrastructure/repositories/prisma-product.repository";
import { PrismaScheduleRepository } from "@/infrastructure/repositories/prisma-schedule.repository";
import { PrismaServiceRepository } from "@/infrastructure/repositories/prisma-service.repository";
import { PrismaUserRepository } from "@/infrastructure/repositories/prisma-user.repository";
import { hasDatabaseConnectionString } from "@/infrastructure/database/prisma";

const hasDatabase = hasDatabaseConnectionString();

const memoryServices = new MemoryServiceRepository();
const memoryProducts = new MemoryProductRepository();
const memoryAppointments = new MemoryAppointmentRepository();
const memoryUsers = new MemoryUserRepository();
const memorySchedules = new MemoryScheduleRepository();

export function getServiceRepository() {
  return hasDatabase ? new PrismaServiceRepository() : memoryServices;
}

export function getProductRepository() {
  return hasDatabase ? new PrismaProductRepository() : memoryProducts;
}

export function getAppointmentRepository() {
  return hasDatabase ? new PrismaAppointmentRepository() : memoryAppointments;
}

export function getUserRepository() {
  return hasDatabase ? new PrismaUserRepository() : memoryUsers;
}

export function getScheduleRepository() {
  return hasDatabase ? new PrismaScheduleRepository() : memorySchedules;
}
