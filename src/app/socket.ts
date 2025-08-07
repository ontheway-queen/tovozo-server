import { Application } from "express";
import http from "http";
import { Server } from "socket.io";
import { origin } from "../utils/miscellaneous/constants";
import { TypeUser } from "../utils/modelTypes/user/userModelTypes";
import { client } from "./redis";
export let io: Server;

export const SocketServer = (app: Application) => {
	const server = http.createServer(app);
	io = new Server(server, {
		cors: { origin: origin },
	});

	return server;
};

export async function addOnlineUser(
	userId: number,
	socketId: string,
	type: `${TypeUser}`
) {
	await client.sAdd(`socket:user:${userId}`, socketId);
	await client.set(`socket:user-type:${userId}`, type);
}

export async function removeOnlineUser(userId: number, socketId: string) {
	await client.sRem(`socket:user:${userId}`, socketId);

	const remaining = await client.sCard(`socket:user:${userId}`);
	console.log({ remaining });
	if (remaining === 0) {
		await client.del(`socket:user:${userId}`);
		await client.del(`socket:user-type:${userId}`);
		console.log(`User ${userId} is now offline`);
	}
}

export async function getAllOnlineSocketIds({
	user_id,
	type,
}: {
	user_id?: number;
	type?: `${TypeUser}`;
}): Promise<{ user_id: number; socketId: string }[]> {
	const results: { user_id: number; socketId: string }[] = [];
	const keys = await client.keys("socket:user:*");

	for (const key of keys) {
		const id = parseInt(key.split(":")[2]);
		if (user_id !== undefined && id !== user_id) continue;

		const userType = await client.get(`socket:user-type:${id}`);
		if (type && userType !== type) continue;

		const socketIds = await client.sMembers(key);
		socketIds.forEach((socketId: string) => {
			results.push({ user_id: id, socketId });
		});
	}

	return results;
}
