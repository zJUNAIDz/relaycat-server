import { Member } from "@prisma/client";
import { db } from "../lib/db";

class ConversationService {
  async findConversation(memberOneId: Member["id"], memberTwoId: Member["id"]) {
    try {
      const conversation = await db.conversation.findFirst({
        where: {
          OR: [
            {
              memberOneId,
              memberTwoId
            },
            {
              memberOneId: memberTwoId,
              memberTwoId: memberOneId
            }
          ]
        },
        include: {
          memberOne: {
            include: {
              user: true
            }
          },
          memberTwo: {
            include: {
              user: true
            }
          }
        }
      })
      if (!conversation) {
        return { conversation: null, error: "conversation not found" }
      }
      return { conversation, error: null }
    }
    catch (err) {
      console.error("[findConversation] ", err)
      return { conversation: null, error: "Failed to find conversation" }
    }
  }
}
export const conversationService = new ConversationService();