"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_1 = require("../../../app/socket");
class SocketService {
    emitNotification(data) {
        console.log("Emitting notification to socket:", data);
        const { emitType, read_status = false, created_at = new Date().toISOString(), socketId } = data, restData = __rest(data, ["emitType", "read_status", "created_at", "socketId"]);
        const payload = Object.assign(Object.assign({}, restData), { read_status,
            created_at });
        socket_1.io.to(socketId).emit(emitType, payload);
    }
}
exports.default = SocketService;
