import { Hono } from "hono";
import { messageService } from "../services/message.service";

const messageRoute = new Hono();

messageRoute.get("/", async (c) => {
  const channelId = c.req.query("channelId");
  const conversationId = c.req.query("conversationId");
  if ((!channelId || channelId.trim() === "") && (!conversationId || conversationId.trim() === "")) {
    return c.json({ error: "Channel Id or conversation Id is required" }, 400);
  }
  const cursor = c.req.query("cursor");
  if (channelId) {
    const { messages, nextCursor, error } = await messageService.getMessagesByChannelId(channelId, cursor);
    return c.json({ messages, nextCursor });
  }
  return c.json({ messages:[] }, 201)
  // if (conversationId) {
  //   const { messages } = await messageService.getMessagesByConversationId(conversationId);
  //   return c.json(messages);
  // }
})

messageRoute.post("/", async (c) => {
  const { content } = await c.req.json();
  const { channelId, memberId } = c.req.query();
  const { user: { id: userId } } = c.get("jwtPayload");
  if (!userId) {
    return c.json({ error: "User not found" }, 400);
  }
  if (!content || content.trim() === "") {
    return c.json({ error: "Content is required" }, 400);
  }
  if (!channelId || channelId.trim() === "") {
    return c.json({ error: "Channel ID is required" }, 400);
  }
  if (!memberId || memberId.trim() === "") {
    return c.json({ error: "Member ID is required" }, 400);
  }
  console.log({ content, channelId, memberId });
  const { message, error } = await messageService.createMessage(content, channelId, memberId);
  if (error) {
    return c.json({ error }, 400);
  }
  return c.json(message);
})

export default messageRoute;