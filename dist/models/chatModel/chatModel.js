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
const userModelTypes_1 = require("../../utils/modelTypes/user/userModelTypes");
class ChatModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // ------------------------------------------------------------------------------------------------
    getReceiverId(_a) {
        return __awaiter(this, arguments, void 0, function* ({ chat_session_id, sender_id, }) {
            return yield this.db("chat_session_participants")
                .withSchema(this.DBO_SCHEMA)
                .select("user_id")
                .where("chat_session_id", chat_session_id)
                .andWhereNot("user_id", sender_id)
                .first();
        });
    }
    checkSessionForJobSeekerAndHotelier(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotelier_id, job_seeker_id } = payload;
            return yield this.db("chat_session_participants as csp")
                .withSchema(this.DBO_SCHEMA)
                .join("chat_sessions as cs", "cs.id", "csp.chat_session_id")
                .whereIn("csp.user_id", [hotelier_id, job_seeker_id])
                .groupBy("cs.id")
                .havingRaw("COUNT(*) = 2")
                .select("cs.id")
                .first();
        });
    }
    createChatSession(_a) {
        return __awaiter(this, arguments, void 0, function* ({ last_message, }) {
            return yield this.db("chat_sessions")
                .withSchema(this.DBO_SCHEMA)
                .insert({ last_message }, "id");
        });
    }
    updateChatSession(_a) {
        return __awaiter(this, arguments, void 0, function* ({ session_id, payload, }) {
            const { last_message, last_message_at, enable_chat } = payload;
            return yield this.db("chat_sessions")
                .withSchema(this.DBO_SCHEMA)
                .where({ id: session_id })
                .update({ last_message, last_message_at, enable_chat }, "id");
        });
    }
    createChatSessionParticipants(participants) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("chat_session_participants")
                .withSchema(this.DBO_SCHEMA)
                .insert(participants);
        });
    }
    getChatSessions(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id, name } = query;
            const baseQuery = this.db("chat_sessions as cs")
                .withSchema(this.DBO_SCHEMA)
                .select("cs.id as session_id", "cs.last_message", "cs.last_message_at", "other_participant.id as participant_user_id", "other_participant.name as participant_name", "other_participant.email as participant_email", "other_participant.photo as participant_image", "other_participant.type as participant_type")
                .join("chat_session_participants as csp", "cs.id", "csp.chat_session_id")
                .join(this.db.raw(`
				(
					SELECT
						csp2.chat_session_id,
						u.id,
						u.name,
            u.email,
						u.photo,
						csp2.type
					FROM "dbo"."chat_session_participants" csp2
					LEFT JOIN "dbo"."user" u ON u.id = csp2.user_id
					WHERE (csp2.user_id IS NULL OR csp2.user_id != ?)
					  AND u.type IS DISTINCT FROM 'ADMIN'
				) as other_participant
			`, [user_id]), "cs.id", "other_participant.chat_session_id")
                .where("csp.user_id", user_id)
                .orderBy("cs.last_message_at", "desc");
            if (name !== "undefined") {
                console.log({ name });
                console.log(1);
                baseQuery.whereILike("other_participant.name", `%${name}%`);
            }
            return yield baseQuery;
        });
    }
    getChatSessionById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("chat_sessions as cs")
                .withSchema(this.DBO_SCHEMA)
                .select("*")
                .where("cs.id", id)
                .andWhere("cs.enable_chat", true)
                .first();
        });
    }
    // Get session between hotelier and job seeker
    getChatSessionBetweenUsers(_a) {
        return __awaiter(this, arguments, void 0, function* ({ hotelier_id, job_seeker_id, }) {
            return yield this.db("chat_sessions as cs")
                .withSchema(this.DBO_SCHEMA)
                .join("chat_session_participants as p1", "p1.chat_session_id", "cs.id")
                .join("chat_session_participants as p2", "p2.chat_session_id", "cs.id")
                .where("p1.user_id", hotelier_id)
                .where("p2.user_id", job_seeker_id)
                .select("cs.id", "cs.last_message", "cs.last_message_at", "cs.enable_chat")
                .orderBy("cs.last_message_at", "desc")
                .first();
        });
    }
    sendMessage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("chat_messages")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, ["id", "message", "created_at"]);
        });
    }
    getMessages(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id, chat_session_id, limit = 100, skip = 0 } = query;
            const messages = yield this.db("chat_messages as cm")
                .withSchema(this.DBO_SCHEMA)
                .select("cm.id", "cm.chat_session_id", "cm.sender_id", "u.name as sender_name", "u.type as sender_type", "u.photo", "cm.message", "cm.created_at")
                .join("user as u", "u.id", "cm.sender_id")
                .join("chat_session_participants as csp", "csp.chat_session_id", "cm.chat_session_id")
                .join("chat_sessions as cs", "csp.chat_session_id", "cs.id")
                .where("cm.chat_session_id", chat_session_id)
                .andWhere("cs.enable_chat", true)
                .andWhere("csp.user_id", user_id)
                .orderBy("cm.created_at", "asc")
                .limit(limit)
                .offset(skip);
            return messages;
        });
    }
    // check session for admin
    checkSupportSession(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("chat_sessions as cs")
                .withSchema(this.DBO_SCHEMA)
                .join("chat_session_participants as csp1", "cs.id", "csp1.chat_session_id")
                .join("chat_session_participants as csp2", "cs.id", "csp2.chat_session_id")
                .where("csp1.user_id", user_id) // job seeker
                .andWhere("csp1.type", userModelTypes_1.TypeUser.JOB_SEEKER)
                .andWhere("csp2.type", userModelTypes_1.TypeUser.ADMIN) // at least one admin joined
                .select("cs.id")
                .first();
        });
    }
    getSessionParticipants(session_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("chat_session_participants as csp")
                .withSchema(this.DBO_SCHEMA)
                .select("*")
                .where("csp.chat_session_id", session_id);
            // .first();
        });
    }
}
exports.default = ChatModel;
