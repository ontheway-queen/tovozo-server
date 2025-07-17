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
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class ChatModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createChatSession(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("chat_sessions")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    getChatSession(_a) {
        return __awaiter(this, arguments, void 0, function* ({ user1_id, user2_id, id, }) {
            return yield this.db("chat_sessions")
                .withSchema(this.DBO_SCHEMA)
                .select("*")
                .modify((qb) => {
                if (id) {
                    qb.where("id", id);
                    if (user1_id && user2_id) {
                        qb.andWhere((subQb) => {
                            subQb
                                .where({ user1_id, user2_id })
                                .orWhere({ user1_id: user2_id, user2_id: user1_id });
                        });
                    }
                }
                else if (user1_id && user2_id) {
                    qb.where((subQb) => {
                        subQb
                            .where({ user1_id, user2_id })
                            .orWhere({ user1_id: user2_id, user2_id: user1_id });
                    });
                }
            })
                .first();
        });
    }
    getChatSessionList(_a) {
        return __awaiter(this, arguments, void 0, function* ({ user_id, enable_chat, limit, skip, }) {
            const data = yield this.db("chat_sessions as cs")
                .withSchema(this.DBO_SCHEMA)
                .select("cs.id", "cs.user1_id", "cs.user2_id", "cs.last_message", "cs.last_message_at", "cs.enable_chat", this.db.raw(`
        CASE
          WHEN cs.user1_id = ? THEN u2.id
          ELSE u1.id
        END AS user_id
      `, [user_id]), this.db.raw(`
        CASE
          WHEN cs.user1_id = ? THEN u2.name
          ELSE u1.name
        END AS user_name
      `, [user_id]), this.db.raw(`
        CASE
          WHEN cs.user1_id = ? THEN u2.photo
          ELSE u1.photo
        END AS user_photo
      `, [user_id]), this.db.raw(`
        CASE
          WHEN cs.user1_id = ? THEN u2.type
          ELSE u1.type
        END AS user_type
      `, [user_id]))
                .join("user as u1", "u1.id", "cs.user1_id")
                .join("user as u2", "u2.id", "cs.user2_id")
                .where((qb) => {
                if (user_id) {
                    qb.where("cs.user1_id", user_id);
                    qb.orWhere("cs.user2_id", user_id);
                }
                if (enable_chat) {
                    qb.andWhere("cs.enable_chat", enable_chat);
                }
            })
                .limit(limit || 100)
                .offset(skip || 0);
            const total = yield this.db("chat_sessions as cs")
                .withSchema(this.DBO_SCHEMA)
                .count("cs.id as total")
                .where((qb) => {
                if (user_id) {
                    qb.where("cs.user1_id", user_id);
                    qb.orWhere("cs.user2_id", user_id);
                }
                if (enable_chat) {
                    qb.andWhere("cs.enable_chat", enable_chat);
                }
            })
                .first();
            return {
                data,
                total: total === null || total === void 0 ? void 0 : total.total,
            };
        });
    }
    getChatSessionListForAdmin(_a) {
        return __awaiter(this, arguments, void 0, function* ({ user_id, enable_chat, limit, skip, }) {
            const data = yield this.db("chat_sessions as cs")
                .withSchema(this.DBO_SCHEMA)
                .select("cs.id", "cs.user1_id", "cs.user2_id", "cs.last_message", "cs.last_message_at", "cs.enable_chat", this.db.raw(`
        CASE
          WHEN cs.user1_id != ? THEN u2.id
          ELSE u1.id
        END AS user_id
      `, [user_id]), this.db.raw(`
        CASE
          WHEN cs.user1_id != ? THEN u2.name
          ELSE u1.name
        END AS user_name
      `, [user_id]), this.db.raw(`
        CASE
          WHEN cs.user1_id != ? THEN u2.photo
          ELSE u1.photo
        END AS user_photo
      `, [user_id]), this.db.raw(`
        CASE
          WHEN cs.user1_id != ? THEN u2.type
          ELSE u1.type
        END AS user_type
      `, [user_id]))
                .join("user as u1", "u1.id", "cs.user1_id")
                .join("user as u2", "u2.id", "cs.user2_id")
                .where((qb) => {
                if (user_id) {
                    qb.where("cs.user1_id", user_id);
                    qb.orWhere("cs.user2_id", user_id);
                }
                if (enable_chat) {
                    qb.andWhere("cs.enable_chat", enable_chat);
                }
            })
                .limit(limit || 100)
                .offset(skip || 0);
            const total = yield this.db("chat_sessions as cs")
                .withSchema(this.DBO_SCHEMA)
                .count("cs.id as total")
                .where((qb) => {
                if (user_id) {
                    qb.where("cs.user1_id", user_id);
                    qb.orWhere("cs.user2_id", user_id);
                }
                if (enable_chat) {
                    qb.andWhere("cs.enable_chat", enable_chat);
                }
            })
                .first();
            return {
                data,
                total: total === null || total === void 0 ? void 0 : total.total,
            };
        });
    }
    updateChatSession(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("chat_sessions")
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id: where.id });
        });
    }
    createChatMessage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("chat_messages")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    getChatMessages(_a) {
        return __awaiter(this, arguments, void 0, function* ({ chat_session_id, user_id, limit, skip, }) {
            return yield this.db("chat_messages as cm")
                .withSchema(this.DBO_SCHEMA)
                .select("cm.*", this.db.raw(`
        CASE
          WHEN cm.sender_id != ? THEN u1.name
          ELSE u2.name
        END AS user_name
      `, [user_id]), this.db.raw(`
        CASE
          WHEN cm.sender_id != ? THEN u1.photo
          ELSE u2.photo
        END AS user_photo
      `, [user_id]), this.db.raw(`
        CASE
          WHEN cm.sender_id != ? THEN u1.type
          ELSE u2.type
        END AS user_type
      `, [user_id]))
                .leftJoin("user as u1", "u1.id", "cm.sender_id")
                .leftJoin("user as u2", "u2.id", "cm.receiver_id")
                .where("cm.chat_session_id", chat_session_id)
                .andWhere("cm.sender_id", user_id)
                .orderBy("cm.created_at", "desc")
                .limit(limit || 50)
                .offset(skip || 0);
        });
    }
}
exports.default = ChatModel;
