import { User } from "./user.entity";
import { BeautyService } from "./service.entity";
import { Product } from "./product.entity";

export interface Review {
  id: string;
  rating: number;
  comment: string;
  imageUrl: string;
  isFeatured: boolean;
  userId: string | null;
  serviceId: string | null;
  productId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: Partial<User>;
  service?: Partial<BeautyService>;
  product?: Partial<Product>;
}
