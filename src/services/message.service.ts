import { Channel, Member, Message } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { db } from "../lib/db";
import { socketManager } from "../lib/socket-manager";

class MessageService {
  private MESSAGE_BATCH = 10;
  async createMessage(content: Message["content"], channelId: Channel["id"], memberId: Member["id"]) {
    try {
      const message = await db.message.create({
        data: {
          content,
          channelId,
          memberId,
        },
        include: {
          member: {
            include: {
              user: true
            }
          },
        },
      });
      if (!message) {
        return { error: "Message not created" }
      }
      socketManager.io.emit(`chat:${channelId}:messages`, message)
      return { message }
    } catch (error) {
      console.error("[createMessage] ", error)
      return { error }
    }
  }
  
}
export const messageService = new MessageService();