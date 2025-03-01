import { Hono } from "hono";
import { serversService } from "../services/servers.service";
import { parseToken } from "../utils/token";
import { newServerInputValidation } from "../utils/validation";
import { db } from "../lib/db";
import { randomUUIDv7 } from "bun";
import { Server } from "@prisma/client";
const serverRoutes = new Hono();



serverRoutes.get("/", async (c) => {
  const { user: { id: userId } } = c.get("jwtPayload")
  const options = c.req.query("options")?.split(", ") || [];
  const servers = await serversService.getServersByUserId(userId, options);
  if (!servers) {
    return c.json({ error: "No servers found" }, 404)
  }
  return c.json(servers);
})


serverRoutes.get("/:serverId", async (c) => {
  const serverId = c.req.param("serverId") as Server["id"];
  if (!serverId) {
    return c.json({ error: "server id is required" })
  }
  const { user: { id: userId } } = c.get("jwtPayload")
  const options = c.req.query("options")?.split(",") || [];
  const { server } = await serversService.getServer(serverId, userId, options);
  return c.json(server);
})


serverRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const validate = newServerInputValidation(body.name, body.imageUrl);
    if (!validate.success) {
      return c.json({ error: validate.error }, 400);
    }
    const { name, imageUrl } = validate.data;
    // Get profile
    const { user } = c.get("jwtPayload");
    // Create server
    const server = await serversService.createServer({
      profile: user,
      serverName: name,
      serverImageUrl: imageUrl,
    });
    return c.json(server);
  } catch (err) {
    console.error("[SERVER_POST] ", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

serverRoutes.patch("/join/invite", async (c) => {
  try {
    const { inviteCode } = await c.req.json<{ inviteCode: string }>();
    if (!inviteCode) {
      return c.json({ error: "Invite code is required" }, 400);
    }
    const { user: { id } } = c.get("jwtPayload")
    const serverId = await serversService.joinServerFromInviteCode(id, inviteCode)
    if (!serverId) {
      return c.json({ error: "Invalid invite code" }, 400);
    }
    return c.json({ serverId })
  } catch (err) {
    console.error("[SERVER_ADD_INVITE] ", err)
    return c.json({ error: "Internal Server Error" }, 500);
  }
})


serverRoutes.patch("/leave", async (c) => {
  try {
    const serverId = c.req.query("serverId");
    if (!serverId) {
      return c.json({ error: "Server ID is required" }, 400);
    }
    const { user } = await c.get("jwtPayload");
    const server = await serversService.leaveServer({
      serverId,
      userId: user.id,
    });
    return c.json({ server });
  } catch (err) {
    console.error("[SERVER_LEAVE] ", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

serverRoutes.delete("/delete", async (c) => {
  try {
    const serverId = c.req.query("serverId");

    if (!serverId) {
      return c.json({ error: "Server ID is required" }, 400);
    }

    const server = await db.server.findUnique({
      where: {
        id: serverId,
      },
    });
    if (!server) {
      return c.json({ error: "Server not found" }, 404);
    }
    const { user } = c.get("jwtPayload");
    await db.server.delete({
      where: {
        id: serverId,
        userId: user.id,
      },
    });
    return c.json({ message: "server deleted successfully" });
  } catch (err) {
    console.error("[SERVER_DELETE] ", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

serverRoutes.patch("/:id/invite-code", async (c) => {
  const serverId = c.req.param("id");
  const { user: { id: userId } } = c.get("jwtPayload");
  if (!serverId) {
    return c.json({ error: "Server ID is required" }, 400);
  }
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 400)
  }
  const inviteCode = randomUUIDv7("hex");
  const server: Server | null = await serversService.updateServerInviteCode({ serverId, userId, inviteCode });
  if (!server) {
    return c.json({ error: "Server not found" }, 404);
  }
  return c.json({ server });

})

serverRoutes.put("/:id/join", async (c) => {
  const serverId = c.req.param("id");
  const { user: { id: userId } } = c.get("jwtPayload");
  if (!serverId) {
    return c.json({ error: "Server ID is required" }, 400);
  }
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 400)
  }
  const inviteCode = c.req.query("inviteCode");
  if (!inviteCode) {
    return c.json({ error: "Invite code is required" }, 400);
  }
  const id: Server["id"] | null = await serversService.joinServerFromInviteCode(userId, inviteCode);
  if (!id) {
    return c.json({ error: "Server not found" }, 404);
  }
  return c.json({ serverId });
})

export default serverRoutes;
