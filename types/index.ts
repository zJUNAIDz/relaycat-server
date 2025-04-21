import { Channel, Member, Server, User } from "@/generated/prisma/client";

export type ServerWithMembersAndUser = Server & {
  members: (Member & { user: User })[];
};

export type ServerWithMembersUserAndChannels = Server & {
  members: (Member & { user: User })[];
  channels: Channel[];
}

export type ServerWithMembersOnly = Server & {
  members: Member[];
};

export type ServerWithChannels = Server & {
  channels: Channel[];
};