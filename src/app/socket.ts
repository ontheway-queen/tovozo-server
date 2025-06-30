import { Application } from "express";
import http from "http";
import { Server } from "socket.io";
import { origin } from "../utils/miscellaneous/constants";
import { TypeUser } from "../utils/modelTypes/user/userModelTypes";
export let io: Server;

export const SocketServer = (app: Application) => {
  const server = http.createServer(app);
  io = new Server(server, {
    cors: { origin: origin },
  });

  return server;
};

const onlineUsers = new Map<
  number,
  { sockets: Set<string>; type: `${TypeUser}` }
>();

export function addOnlineUser(
  userId: number,
  socketId: string,
  type: `${TypeUser}`
) {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, { sockets: new Set(), type });
  }
  onlineUsers.get(userId)?.sockets.add(socketId);
}

export function removeOnlineUser(userId: number, socketId: string) {
  const user = onlineUsers.get(userId);
  if (!user) return;

  user.sockets.delete(socketId);

  if (user.sockets.size === 0) {
    onlineUsers.delete(userId);
    console.log(`User ${userId} (${user.type}) is now offline`);
  }
}

export function getAllOnlineSocketIds({
  user_id,
  type,
}: {
  user_id?: number;
  type?: `${TypeUser}`;
  needUserId?: boolean;
}): { user_id: number; socketId: string }[] {
  const results: { user_id: number; socketId: string }[] = [];

  for (const [id, { sockets, type: userType }] of onlineUsers.entries()) {
    if (user_id !== undefined && id !== user_id) continue;
    if (type && userType !== type) continue;

    (results as { user_id: number; socketId: string }[]).push(
      ...[...sockets].map((socketId) => ({ user_id: id, socketId }))
    );
  }

  return results;
}
