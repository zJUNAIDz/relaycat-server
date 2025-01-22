import { Hono } from "hono";
import { serversService } from "../services/servers.service";
import { parseToken } from "../utils/token";
import { newServerInputValidation } from "../utils/validation";
import { db } from "../lib/db";
const serverRoutes = new Hono();

serverRoutes.post("/addNewServer", async (c) => {
  try {
    const body = await c.req.json();
    const validate = newServerInputValidation(body.name, body.imageUrl);
    if (!validate.success) {
      return c.json({ error: validate.error }, 400);
    }
    const { name, imageUrl } = validate.data;
    // Get profile
    const userToken = c.req.header("Authorization")?.replace("Bearer ", "");
    if (!userToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const profile = (await parseToken(userToken)) as {
      user: {
        id: string;
        name: string;
        email: string;
        imageUrl: string;
      };
    };
    // Create server
    const server = await serversService.createServer({
      profile: profile.user,
      serverName: name,
      serverImageUrl: imageUrl,
    });
    return c.json(server);
  } catch (err) {
    console.error("[SERVER_POST] ", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

serverRoutes.patch("/leave", async (c) => {
  try {
    const serverId = c.req.query("serverId");
    if (!serverId) {
      return c.json({ error: "Server ID is required" }, 400);
    }
    const { user } = await c.get("jwtPayload");
    const server = await db.server.update({
      where: {
        id: serverId,
        userId: {
          not: user.id,
        },
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            userId: user.id,
          },
        },
      },
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

export default serverRoutes;
