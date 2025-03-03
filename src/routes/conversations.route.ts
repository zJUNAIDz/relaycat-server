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

conversationsRoute.post("/", async (c) => {
  const { memberOneId, memberTwoId } = await c.req.json();
  if (!memberOneId || !memberTwoId) {
    return c.json({ error: "memberOneId and memberTwoId are required" }, 400)
  }
  const { conversation, error } = await conversationService.createConversation(memberOneId, memberTwoId);
  if (error) {
    return c.json({ error }, 400)
  }
  return c.json({ conversation }, 200)
});

conversationsRoute.put("/", async (c) => {
  const { memberOneId, memberTwoId } = await c.req.json();
  if (!memberOneId || !memberTwoId) {
    return c.json({ error: "memberOneId and memberTwoId are required" }, 400)
  }
  const { conversation, error } = await conversationService.getOrCreateConversation(memberOneId, memberTwoId);
  if (error) {
    return c.json({ error }, 400)
  }
  return c.json({ conversation }, 200)
})

export default conversationsRoute;