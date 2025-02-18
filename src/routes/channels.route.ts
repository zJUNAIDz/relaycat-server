import { ChannelType, MemberRole } from "@prisma/client";
import { Hono } from "hono";
import { db } from "../lib/db";
import { channelService } from "../services/channels.service";

const channelsRoute = new Hono();

channelsRoute.get("/", (c) => {
  return c.text("get all channels");
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


export default channelsRoute;
