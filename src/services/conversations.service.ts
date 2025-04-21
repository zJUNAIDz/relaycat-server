import { DirectMessage, Member } from "@/generated/prisma/client";
import { db } from "../lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

class ConversationService {
  private MESSAGE_BATCH = 10;
  async getMessagesByConversationId(
    conversationId: DirectMessage["conversationId"],
    cursor: DirectMessage["id"],
  ) {
    try {
      const messages = await db.directMessage.findMany({
        take: 10,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          conversationId,
        },
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      if (!messages) {
        return { messages: null, nextCursor: null, error: "Conversation Messages not found" }
      }
      let nextCursor = null;
      if (messages.length === this.MESSAGE_BATCH) {
        nextCursor = messages[this.MESSAGE_BATCH - 1].id

      }
      console.log({ messages, nextCursor })
      return { messages, nextCursor, error: null }
    } catch (error) {
      console.error("[getConversationMessages] ", error)
      if (error instanceof PrismaClientKnownRequestError)
        return { messages: null, nextCursor: null, error: error.message }
      return { messages: null, nextCursor: null, error: "Failed to get conversation messages" }
    }
  }

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
  async createConversation(memberOneId: Member["id"], memberTwoId: Member["id"]) {
    try {
      const conversation = await db.conversation.create({
        data: {
          memberOneId,
          memberTwoId
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
      return { conversation, error: null }
    }
    catch (err) {
      console.error("[createConversation] ", err)
      return { conversation: null, error: "Failed to create conversation" }
    }
  }
  async getOrCreateConversation(memberOneId: Member["id"], memberTwoId: Member["id"]) {
    try {
      let conversation = await this.findConversation(memberOneId, memberTwoId);
      if (conversation.error) {
        conversation = await this.createConversation(memberOneId, memberTwoId);
      }
      return { conversation, error: null }
    }
    catch (err) {
      console.error("[getOrCreateConversation] ", err)
      return { conversation: null, error: "Failed to get or create conversation" }
    }
  }
}
export const conversationService = new ConversationService();