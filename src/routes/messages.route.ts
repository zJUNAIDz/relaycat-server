import { Hono } from "hono";
import { messageService } from "../services/message.service";

const messageRoute = new Hono();

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
  const { message } = await messageService.createMessage(content, channelId, memberId);
  return c.json(message);
})

export default messageRoute;