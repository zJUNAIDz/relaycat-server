import { Hono } from "hono";
import { conversationService } from "../services/conversations.service";

const conversationsRoute = new Hono();

conversationsRoute.get("/", async (c) => {
  const memberOneId = c.req.query("memberOneId");
  const memberTwoId = c.req.query("memberTwoId");
  if (!memberOneId || !memberTwoId) {
    return c.json({ error: "memberOneId and memberTwoId are required" }, 400)
  }
  const { conversation, error } = await conversationService.findConversation(memberOneId, memberTwoId);
  if (error) {
    return c.json({ error }, 400)
  }
  return c.json({ conversation }, 200)
});

export default conversationsRoute;