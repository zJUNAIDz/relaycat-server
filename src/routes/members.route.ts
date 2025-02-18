import { Hono } from "hono";
import { db } from "../lib/db";

const membersRoutes = new Hono();

membersRoutes.patch("/changeRole", async (c) => {
  try {
    const { role, serverId, memberId } = await c.req.json();
    if (!serverId) {
      return c.json({ error: "Server ID is required" }, 400);
    }
    if (!memberId) {
      return c.json({ error: "Member ID is required" }, 400);
    }
    if (!role) {
      return c.json({ error: "Role is required" }, 400);
    }
    const { user: { id: userId } } = c.get("jwtPayload")
    const server = await db.server.update({
      where: {
        id: serverId,
        userId: userId,
      },
      data: {
        members: {
          update: {
            where: {
              id: memberId,
              userId: {
                not: userId,
              },
            },
            data: {
              role,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });
    return c.json({ server });
  } catch (err) {
    console.error("[MEMBERS_ID_PATCH] ", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

membersRoutes.delete("/kick", async (c) => {
  try {
    const memberId = c.req.query("memberId");
    if (!memberId) {
      return c.json({ error: "Member ID is required" }, 400);
    }
    const serverId = c.req.query("serverId");
    const server = await db.server.update({
      where: {
        id: serverId,
        userId: c.get("jwtPayload").id,
      },
      data: {
        members: {
          deleteMany: {
            id: memberId,
            userId: {
              not: c.get("jwtPayload").id,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
    return c.json({ server });
  } catch (err) {
    console.error("[MEMBERS_ID_PATCH] ", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default membersRoutes;
