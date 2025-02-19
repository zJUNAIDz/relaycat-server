import { Channel, MemberRole, Server } from "@prisma/client";
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

      console.log("server from create channel: ", server)
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

      console.log("server from create channel: ", server)
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