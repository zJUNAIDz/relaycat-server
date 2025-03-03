import { Member } from "@prisma/client";
import { db } from "../lib/db";

class MembersService {
  async getMemberById(memberId: Member["id"]) {
    try {

      const member = await db.member.findUnique({
        where: {
          id: memberId,
        },
      });
      if (!member) {
        return { error: "Member not found" };
      }
      return { member };
    } catch (err) {
      console.error("[getMemberById] ", err)
      return { error: "Failed to find member" };
    }
  }

  async getMemberByUserId(userId: Member["userId"]) {
    try {
      const member = await db.member.findFirst({
        where: {
          userId
        },
      });
      return { member };
    } catch (err) {
      console.error("[getMembersByProfileId] ", err)
      return { error: "Failed to find members" };
    }
  }
  
  

}
export const membersService = new MembersService();