import { ChannelType, MemberRole } from "@prisma/client";
import { Hono } from "hono";
import { db } from "../lib/db";
import { channelService } from "../services/channels.service";

const channelsRoute = new Hono();

channelsRoute.get("/", async (c) => {
  try {
    const { serverId } = c.req.query();
    const { user: { id: userId } } = c.get("jwtPayload")
    const { channels, error } = await channelService.getChannelsByServerId(serverId, userId)
    if (error) {
      return c.json({ error }, 400)
    }
    return c.json({ channels });
  } catch (err) {
    return c.json({ error: "Internal Server Error" }, 500)
  }

});
channelsRoute.post("/create", async (c) => {
  const { name, type, serverId } = await c.req.json();
  if (!name) {
    return c.json({ error: "name is required" }, 400);
  }
  if (!type) {
    return c.json({ error: "type is required" }, 400);
  }
  if (!(type in ChannelType)) {
    return c.json({ error: "type must be of ChannelType" }, 400);
  }
  if (!serverId) {
    return c.json({ error: "serverId is required" }, 400);
  }
  const { user: { id: userId } } = c.get("jwtPayload");

  const channel = {
    name,
    type,
    serverId,
    userId,
  }

  const { server } = await channelService.createChannel(channel)
  return c.json({ server });
});

channelsRoute.patch("/:channelId", async (c) => {
  const { name, type } = await c.req.json();
  if (!name || !type) {
    return c.json({ error: "name and type are required" }, 400);
  }
  const { channelId } = c.req.param();
  if (!channelId) {
    return c.json({ error: "id is required" }, 400);
  }
  const { user: { id: userId } } = c.get("jwtPayload");
  const { server } = await channelService.editChannel({ name, type, channelId, userId });
  if (!server) {
    return c.json({ error: "server not found" }, 404);
  }
  return c.json({ server });
});
export default channelsRoute;
