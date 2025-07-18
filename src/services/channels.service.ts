import { Channel, MemberRole, Server, User } from "@/generated/prisma/client";
import { db } from "../lib/db";
import { ServerWithChannels } from "../../types";

interface CreateChannelPayload {
  name: Channel["name"];
  type: Channel["type"];
  serverId: Channel["serverId"];
  userId: Channel["userId"];
}

class ChannelService {
  private static instance: ChannelService;
  private constructor() {
    // do something construct...
  }
  static getInstance() {
    if (!ChannelService.instance) {
      ChannelService.instance = new ChannelService();
    }
    return ChannelService.instance;
  }
  // public async getChannelList();
  // public async getChannelById(id: number);
  // public async createChannel(channel: Channel);
  // public async updateChannel(channel: Channel);
  // public async deleteChannel(id: number);
  async createChannel({ name, type, serverId, userId }: CreateChannelPayload): Promise<{ server: any | null, error: string | null }> {
    if (!userId) return { server: null, error: "userId cannot be null" };
    try {

      const server = await db.server.update({
        where: {
          id: serverId,
          members: {
            some: {
              userId: userId,
              role: {
                in: [MemberRole.ADMIN, MemberRole.MODERATOR],
              },
            },
          },
        },
        data: {
          channels: {
            create: {
              name,
              type,
              userId,
            }
          },
        },
      });
      if (!server) {
        return { server: null, error: "Server not found" };
      }

      return { server, error: null };
    } catch (err) {
      return { server: null, error: "Something went wrong" };
    }
    // const cnl = await db.channel.create({
    //   data: {
    //     name,
    //     type,
    //     serverId,
    //     userId,
    //   },
    // });
  }

  async getChannelById(channelId: Channel["id"], userId: User["id"]) {
    try {
      const channel = await db.channel.findUnique({
        where: {
          id: channelId,
          server: {
            members: {
              some: {
                userId
              }
            }
          }
        },
      })
      if (!channel) {
        return { channel: null, error: "Channel not found" }
      }
      return { channel, error: null }
    } catch (err) {
      console.error("[getChannelById]", err)
      return { channel: null, error: "Internal Server Error" }
    }
  }


  async getChannelsByServerId(serverId: Server["id"], userId: User["id"]): Promise<{ channels: Channel[], error: null } | { channels: null, error: string }> {
    try {
      const channels: Channel[] = await db.channel.findMany({
        where: {
          server: {
            id: serverId,
            members: {
              some: {
                user: {
                  id: userId
                }
              }
            }
          },
        },
        orderBy: {
          createdAt: "asc"
        },
      })
      if (!channels) {
        return { channels: null, error: "no Channel found" }
      }
      return { channels, error: null }
    } catch (err) {
      console.error("[getChannelsByServerId] ", err)
      return { channels: null, error: "Failed to get channels by server id" }
    }
  }

  async editChannel({ name, type, channelId, userId }:
    { name: Channel["name"], type: Channel["type"], channelId: Channel["id"], userId: Channel["userId"] }):
    Promise<{ server: any | null, error: string | null }> {
    if (!userId) return { server: null, error: "userId cannot be null" };
    try {

      const server = await db.channel.update({
        where: {
          id: channelId,
          server: {
            members: {
              some: {
                userId: userId,
                role: {
                  in: [MemberRole.ADMIN, MemberRole.MODERATOR],
                },
              },
            },
          }
        },
        data: {
          name,
          type,
        }
      });
      if (!server) {
        return { server: null, error: "Server not found" };
      }

      return { server, error: null };
    } catch (err) {
      return { server: null, error: "Something went wrong" };
    }
    // const cnl = await db.channel.create({
    //   data: {
    //     name,
    //     type,
    //     serverId,
    //     userId,
    //   },
    // });
  }
  async deleteChannel(channelId: Channel["id"], userId: User["id"]) {
    try {
      const server = await db.channel.delete({
        where: {
          id: channelId,
          server: {
            members: {
              some: {
                userId: userId,
                role: {
                  in: [MemberRole.ADMIN, MemberRole.MODERATOR],
                },
              },
            },
          }
        },
      });
      if (!server) {
        return { server: null, error: "Server not found" };
      }
      return { server, error: null };
    } catch (err) {
      console.error("[channelDelete] ", err)
      return { server: null, error: "Something went wrong" };
    }
  }
}

export const channelService = ChannelService.getInstance();