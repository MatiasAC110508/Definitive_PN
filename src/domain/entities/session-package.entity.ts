import type { ISODateString } from "@/types/common";

export interface SessionPackage {
  id: string;
  userId: string;
  serviceId: string;
  totalSessions: number;
  usedSessions: number;
  pricePerPackage: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
