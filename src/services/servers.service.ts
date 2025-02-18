import { MemberRole, Prisma, Server, User } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { ServerWithMembersAndUser, ServerWithMembersOnly, ServerWithMembersUserAndChannels } from "../../types";
import { db } from "../lib/db";
interface CreateServerPayload {
  profile: {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
  };
  serverName: string;
  serverImageUrl: string;
}

class ServersService {
  async createServer({
    profile,
    serverName,
    serverImageUrl,
  }: CreateServerPayload) {
    try {
      if (!serverName || !serverImageUrl) {
        throw new Error("Name and image URL are required");
      }
      // Create server
      const server: Server | null = await db.server.create({
        data: {
          name: serverName,
          userId: profile.id,
          image: serverImageUrl,
          inviteCode: uuidv4(),
          channels: {
            create: [{ name: "general", userId: profile.id }],
          },
          members: {
            create: [{ userId: profile.id, role: MemberRole.ADMIN }],
          },
        },
      });
      if (!server) {
        throw new Error("Failed to create server");
      }
      return server;
    } catch (err) {
      throw new Error("Internal Server Error: " + err);
    }
  }

  async leaveServer({
    serverId,
    userId,
  }: {
    serverId: string;
    userId: string;
  }): Promise<Server> {
    try {
      const server: Server | null = await db.server.update({
        where: {
          id: serverId,
          userId: {
            not: userId,
          },
          members: {
            some: {
              userId: userId,
            },
          },
        },
        data: {
          members: {
            deleteMany: {
              userId: userId,
            },
          },
        },
      });
      return server;
    } catch (err) {
      throw new Error("[ERR_SERVER_SERVICE:leaveServer]: " + err);
    }
  }

  async getServer(serverId: Server["id"], userId: User["id"], options: ["members"]): Promise<{ server: ServerWithMembersOnly | null, error: string | null }>;
  async getServer(serverId: Server["id"], userId: User["id"], options: ["user", "members"] | ["user"]): Promise<{ server: ServerWithMembersAndUser | null, error: string | null }>;
  async getServer(serverId: Server["id"], userId: User["id"], options: ["user", "members", "channels"] | ["user", "channels"]): Promise<{ server: ServerWithMembersUserAndChannels | null, error: string | null }>
  async getServer(serverId: Server["id"], userId: User["id"], options: string[]): Promise<{ server: Server | null, error: string | null }>;

  async getServer(serverId: Server["id"], userId: User["id"], options: string[]): Promise<{
    server: ServerWithMembersAndUser | ServerWithMembersOnly | Server | null,
    error: string | null
  }> {
    try {
      const server: ServerWithMembersAndUser | Server | null = await db.server.findUnique({
        where: {
          id: serverId,
          members: {
            some: {
              userId
            }
          }
        },
        include: {
          members: (options.includes("members") || options.includes("user")) ? {
            include: {
              user: options.includes("user") ? true : false,
            },
            orderBy: {
              role: "asc",
            }
          } : false,
          channels: (options.includes("channels")) ? true : false
        }
      })
      if (!server) {
        return { server: null, error: `server with id: ${serverId} not found` }
      }
      return { server, error: null }
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        return { server: null, error: err.message }
      }
      throw new Error("[ERR_SERVER_SERVICE:getServerById] " + err)
    }
  }

  async getServersByUserId(userId: string, options: string[]) {
    try {
      const servers = await db.server.findMany({
        where: {
          members: {
            some: {
              userId
            }
          },
        },
      })
      if (!servers) return null
      return servers
    } catch (err) {
      throw new Error("[ERR_SERVER_SERVICE:getServerByUserId] " + err)
    }
  }

  async updateServerInviteCode({ serverId, userId, inviteCode }: { serverId: string, userId: string, inviteCode: string }) {
    try {
      const server: Server = await db.server.update({
        where: {
          id: serverId,
          userId,
        },
        data: {
          inviteCode,
        },
      });
      if (!server) return null
      return server
    } catch (err) {
      throw new Error("[ERR_SERVER_SERVICE:updateServerInviteCode] " + err)
    }
  }

  async joinServerFromInviteCode(userId: string, inviteCode: string) {
    try {
      const { id } = await db.server.update({
        where: {
          inviteCode,
          members: {
            none: {
              userId
            }
          }
        },
        data: {
          members: {
            create: {
              userId
            }
          }
        },
        select: {
          id: true
        }
      })
      return id
    } catch (err) {
      return null
    }
  }
}

export const serversService = new ServersService();
