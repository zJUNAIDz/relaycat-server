import { Member } from "@/generated/prisma/client";
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

  async getMembersByServerId(serverId: Member["serverId"]) {
    try {
      const members = await db.member.findMany({
        where: {
          serverId,
        },
        include: {
          user: true,
        },
        orderBy: {
          role: "asc",
        },
      });
      return { members };
    } catch (err) {
      console.error("[getMembersByServerId] ", err)
      return { error: "Failed to find members" };
    }
  }

}
export const membersService = new MembersService();