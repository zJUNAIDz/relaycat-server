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
  async getMessagesByChannelId(channelId: Channel["id"], cursor?: string): Promise<{
    messages: Message[], nextCursor: Message["id"] | null; error: null
  } | {
    messages: null, nextCursor: null, error: string
  }> {
    try {
      const messages = await db.message.findMany({
        take: 10,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          channelId,
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
        return { messages: null, nextCursor: null, error: "Messages not found" }
      }
      let nextCursor = null;
      if (messages.length === this.MESSAGE_BATCH) {
        nextCursor = messages[this.MESSAGE_BATCH - 1].id

      }
      console.log({ messages, nextCursor })
      return { messages, nextCursor, error: null }
    } catch (error) {
      console.error("[getMessages] ", error)
      if (error instanceof PrismaClientKnownRequestError)
        return { messages: null, nextCursor: null, error: error.message }
      return { messages: null, nextCursor: null, error: "Failed to get messages" }
    }
  }
  async updateMessage(id: Message["id"], channelId: Channel["id"], content: Message["content"]) {
    try {
      const message = await db.message.update({
        where: {
          id,
        },
        data: {
          content,
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
        return { error: "Message not updated" }
      }
      socketManager.io.emit(`chat:${channelId}:messages:update`, message)
      return { message }
    } catch (error) {
      console.error("[updateMessage] ", error)
      return { error }
    }
  }
}
export const messageService = new MessageService();