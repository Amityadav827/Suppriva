import type { User } from "@/lib/database/types";
import type { BaseRepository } from "./base.repository";

export interface UsersRepository extends BaseRepository<User> {
  getByEmail(email: string): Promise<User | null>;
}
