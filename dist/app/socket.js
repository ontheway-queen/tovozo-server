"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const redis_1 = require("./redis");
const SocketServer = (app) => {
    const server = http_1.default.createServer(app);
    exports.io = new socket_io_1.Server(server, {
        cors: { origin: constants_1.origin },
    });
    return server;
};
exports.SocketServer = SocketServer;
function addOnlineUser(userId, socketId, type) {
    return __awaiter(this, void 0, void 0, function* () {
        yield redis_1.client.sAdd(`socket:user:${userId}`, socketId);
        yield redis_1.client.set(`socket:user-type:${userId}`, type);
    });
}
function removeOnlineUser(userId, socketId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield redis_1.client.sRem(`socket:user:${userId}`, socketId);
        const remaining = yield redis_1.client.sCard(`socket:user:${userId}`);
        if (remaining === 0) {
            yield redis_1.client.del(`socket:user:${userId}`);
            yield redis_1.client.del(`socket:user-type:${userId}`);
            console.log(`User ${userId} is now offline`);
        }
    });
}
function getAllOnlineSocketIds(_a) {
    return __awaiter(this, arguments, void 0, function* ({ user_id, type, }) {
        const results = [];
        const keys = yield redis_1.client.keys("socket:user:*");
        for (const key of keys) {
            const id = parseInt(key.split(":")[2]);
            if (user_id !== undefined && id !== user_id)
                continue;
            const userType = yield redis_1.client.get(`socket:user-type:${id}`);
            if (type && userType !== type)
                continue;
            const socketIds = yield redis_1.client.sMembers(key);
            socketIds.forEach((socketId) => {
                results.push({ user_id: id, socketId });
            });
        }
        return results;
    });
}
