"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketServer = exports.io = void 0;
exports.addOnlineUser = addOnlineUser;
exports.removeOnlineUser = removeOnlineUser;
exports.getAllOnlineSocketIds = getAllOnlineSocketIds;
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const constants_1 = require("../utils/miscellaneous/constants");
const SocketServer = (app) => {
    const server = http_1.default.createServer(app);
    exports.io = new socket_io_1.Server(server, {
        cors: { origin: constants_1.origin },
    });
    return server;
};
exports.SocketServer = SocketServer;
const onlineUsers = new Map();
function addOnlineUser(userId, socketId, type) {
    var _a;
    if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, { sockets: new Set(), type });
    }
    (_a = onlineUsers.get(userId)) === null || _a === void 0 ? void 0 : _a.sockets.add(socketId);
}
function removeOnlineUser(userId, socketId) {
    const user = onlineUsers.get(userId);
    if (!user)
        return;
    user.sockets.delete(socketId);
    if (user.sockets.size === 0) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} (${user.type}) is now offline`);
    }
}
function getAllOnlineSocketIds({ user_id, type, }) {
    const results = [];
    for (const [id, { sockets, type: userType }] of onlineUsers.entries()) {
        if (user_id !== undefined && id !== user_id)
            continue;
        if (type && userType !== type)
            continue;
        results.push(...[...sockets].map((socketId) => ({ user_id: id, socketId })));
    }
    return results;
}
