import { ChannelType, MemberRole } from "@prisma/client";
import { Hono } from "hono";
import { db } from "../lib/db";

const channelsRoute = new Hono();

channelsRoute.get("/", (c) => {
  return c.text("get all channels");
});
channelsRoute.post("/create", async (c) => {
  const { name, type } = await c.req.json();
  const serverId = c.req.query("serverId");
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
  const { user } = c.get("jwtPayload");
  console.log(user.id);
  const server = await db.server.update({
    where: {
      id: serverId,
      members: {
        some: {
          userId: user.id,
          role: {
            in: [MemberRole.ADMIN, MemberRole.MODERATOR],
          },
        },
      },
    },
    data: {
      channels: {
        create: {
          userId: user.id,
          name,
          type,
        },
      },
    },
  });

  return c.json({ server });
});

export default channelsRoute;
