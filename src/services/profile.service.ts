import { User } from "@prisma/client";
import { db } from "../lib/db";

class ProfileService {
  async getProfile(id: string): Promise<User | null> {
    const profile = await db.user.findUnique({
      where: {
        id
      }
    });
    if (!profile) return null
    return profile
  }
}
export const profileService = new ProfileService();