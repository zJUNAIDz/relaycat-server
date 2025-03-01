import { Channel, MemberRole, Server, User } from "@prisma/client";
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
}

export const channelService = ChannelService.getInstance();