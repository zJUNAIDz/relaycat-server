import { Channel, Member, Message, User } from "@prisma/client";
import { db } from "../lib/db";

class MessageService {
  async createMessage(content: Message["content"], channelId: Channel["id"], memberId: Member["id"]) {
    try {
      const message = await db.message.create({
        data: {
          content,
          channelId,
          memberId,
        },
        include: {
          member: true,
        },
      });
      if (!message) {
        return { error: "Message not created" }
      }
      return { message }
    } catch (error) {
      console.error("[createMessage] ", error)
      return { error }
    }
  }
}
export const messageService = new MessageService();