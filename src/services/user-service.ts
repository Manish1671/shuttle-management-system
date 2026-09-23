import type { User } from "@/types/user";

import { userRepository } from "./repository";

export const userService = {
  getAll(): User[] {
    return userRepository.getAll();
  },
  getById(id: string): User | null {
    return userRepository.getById(id);
  },
  create(user: User): User {
    return userRepository.create(user);
  },
  update(id: string, patch: Partial<Omit<User, "id">>): User | null {
    return userRepository.update(id, patch);
  },
  delete(id: string): boolean {
    return userRepository.delete(id);
  },
};
