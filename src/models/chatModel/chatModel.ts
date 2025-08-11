import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import { TypeUser } from "../../utils/modelTypes/user/userModelTypes";

class ChatModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	// ------------------------------------------------------------------------------------------------
	public async getReceiverId({
		chat_session_id,
		sender_id,
	}: {
		chat_session_id: number;
		sender_id: number;
	}): Promise<number> {
		return await this.db("chat_session_participants")
			.withSchema(this.DBO_SCHEMA)
			.select("user_id")
			.where("chat_session_id", chat_session_id)
			.andWhereNot("user_id", sender_id)
			.first();
	}

	public async checkSessionForJobSeekerAndHotelier(payload: {
		hotelier_id: number;
		job_seeker_id: number;
	}): Promise<{ id: number }> {
		const { hotelier_id, job_seeker_id } = payload;
		return await this.db("chat_session_participants as csp")
			.withSchema(this.DBO_SCHEMA)
			.join("chat_sessions as cs", "cs.id", "csp.chat_session_id")
			.whereIn("csp.user_id", [hotelier_id, job_seeker_id])
			.groupBy("cs.id")
			.havingRaw("COUNT(*) = 2")
			.select("cs.id")
			.first();
	}

	public async createChatSession({
		last_message,
	}: {
		last_message?: string;
	}) {
		return await this.db("chat_sessions")
			.withSchema(this.DBO_SCHEMA)
			.insert({ last_message }, "id");
	}

	public async updateChatSession({
		session_id,
		payload,
	}: {
		session_id: number;
		payload: {
			last_message?: string;
			last_message_at?: Date;
			enable_chat?: boolean;
		};
	}) {
		const { last_message, last_message_at, enable_chat } = payload;
		return await this.db("chat_sessions")
			.withSchema(this.DBO_SCHEMA)
			.where({ id: session_id })
			.update({ last_message, last_message_at, enable_chat }, "id");
	}

	public async createChatSessionParticipants(
		participants: {
			chat_session_id: number;
			user_id: number;
			type: TypeUser;
			joined_at: Date;
		}[]
	) {
		return await this.db("chat_session_participants")
			.withSchema(this.DBO_SCHEMA)
			.insert(participants);
	}

	public async getChatSessions(query: {
		user_id: number;
		name?: string;
	}): Promise<
		{
			session_id: number;
			last_message: string;
			last_message_at: string;
			enable_chat: boolean;
			participant_user_id: number;
			participant_name: string;
			participant_email: string;
			participant_image: string;
			participant_type: TypeUser;
			unread_message_count: number;
		}[]
	> {
		const { user_id, name } = query;

		return await this.db("chat_sessions as cs")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"cs.id as session_id",
				"cs.last_message",
				"cs.last_message_at",
				"cs.enable_chat",
				"other_participant.id as participant_user_id",
				"other_participant.name as participant_name",
				"other_participant.email as participant_email",
				"other_participant.photo as participant_image",
				"other_participant.type as participant_type",
				this.db.raw(
					`COALESCE(unread_counts.unread_message_count, 0) as unread_message_count`
				)
			)
			.join(
				"chat_session_participants as csp",
				"cs.id",
				"csp.chat_session_id"
			)
			.join(
				this.db.raw(
					`
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
    `,
					[user_id]
				),
				"cs.id",
				"other_participant.chat_session_id"
			)
			.leftJoin(
				this.db.raw(
					`
      (
        SELECT
          cm.chat_session_id,
          COUNT(*) AS unread_message_count
        FROM "dbo"."chat_messages" cm
        LEFT JOIN "dbo"."chat_message_reads" cmr
          ON cm.id = cmr.message_id AND cmr.user_id = ?
        WHERE cmr.id IS NULL
          AND cm.sender_id != ?
        GROUP BY cm.chat_session_id
      ) as unread_counts
      `,
					[user_id, user_id]
				),
				"unread_counts.chat_session_id",
				"cs.id"
			)
			.where((qb) => {
				qb.andWhere("csp.user_id", user_id);
				if (name) {
					qb.andWhereILike("other_participant.name", `%${name}%`);
				}
			})
			.orderBy("cs.last_message_at", "desc");
	}

	public async getChatSessionById(id: number): Promise<{
		id: number;
		last_message: string;
		last_message_at: Date;
		enable_chat: boolean;
	}> {
		return await this.db("chat_sessions as cs")
			.withSchema(this.DBO_SCHEMA)
			.select("*")
			.where("cs.id", id)
			.first();
	}

	// Get session between hotelier and job seeker
	public async getChatSessionBetweenUsers({
		hotelier_id,
		job_seeker_id,
	}: {
		hotelier_id: number;
		job_seeker_id: number;
	}) {
		return await this.db("chat_sessions as cs")
			.withSchema(this.DBO_SCHEMA)
			.join(
				"chat_session_participants as p1",
				"p1.chat_session_id",
				"cs.id"
			)
			.join(
				"chat_session_participants as p2",
				"p2.chat_session_id",
				"cs.id"
			)
			.where("p1.user_id", hotelier_id)
			.where("p2.user_id", job_seeker_id)
			.select(
				"cs.id",
				"cs.last_message",
				"cs.last_message_at",
				"cs.enable_chat"
			)
			.orderBy("cs.last_message_at", "desc")
			.first();
	}

	public async sendMessage(payload: {
		chat_session_id: number;
		sender_id: number;
		message: string;
	}) {
		return await this.db("chat_messages")
			.withSchema(this.DBO_SCHEMA)
			.insert(payload, ["id", "message", "created_at"]);
	}

	public async getMessages(query: {
		chat_session_id: number;
		user_id: number;
		limit?: number;
		skip?: number;
	}): Promise<
		{
			id: number;
			chat_session_id: number;
			sender_id: number;
			sender_name: string;
			sender_type: TypeUser;
			photo: string;
			message: string;
			created_at: string;
		}[]
	> {
		const { user_id, chat_session_id, limit = 100, skip = 0 } = query;
		return await this.db("chat_messages as cm")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"cm.id",
				"cm.chat_session_id",
				"cm.sender_id",
				"u.name as sender_name",
				"u.type as sender_type",
				"u.photo",
				"cm.message",
				"cm.created_at"
			)
			.join("user as u", "u.id", "cm.sender_id")
			.join(
				"chat_session_participants as csp",
				"csp.chat_session_id",
				"cm.chat_session_id"
			)
			.join("chat_sessions as cs", "csp.chat_session_id", "cs.id")
			.where("cm.chat_session_id", chat_session_id)
			// .andWhere("cs.enable_chat", true)
			.andWhere("csp.user_id", user_id)
			.orderBy("cm.created_at", "asc")
			.limit(limit)
			.offset(skip);
	}

	// check session for admin
	public async checkSupportSession(user_id: number) {
		return await this.db("chat_sessions as cs")
			.withSchema(this.DBO_SCHEMA)
			.join(
				"chat_session_participants as csp1",
				"cs.id",
				"csp1.chat_session_id"
			)
			.join(
				"chat_session_participants as csp2",
				"cs.id",
				"csp2.chat_session_id"
			)
			.where("csp1.user_id", user_id) // job seeker
			.andWhere("csp1.type", TypeUser.JOB_SEEKER)
			.andWhere("csp2.type", TypeUser.ADMIN) // at least one admin joined
			.select("cs.id")
			.first();
	}

	public async getSessionParticipants(session_id: number) {
		return await this.db("chat_session_participants as csp")
			.withSchema(this.DBO_SCHEMA)
			.select("*")
			.where("csp.chat_session_id", session_id);
		// .first();
	}

	// ------------------------------------------------------------------------------------------------

	public async getAllReadMessagesByUserAndSession({
		user_id,
		session_id,
	}: {
		user_id: number;
		session_id: number;
	}) {
		return await this.db("chat_message_reads as cmr")
			.withSchema(this.DBO_SCHEMA)
			.select("cmr.id as message_id")
			.where("cmr.chat_session_id", session_id)
			.andWhere("cmr.user_id", user_id);
	}

	public async markMessagesAsSeenBulk(
		records: {
			message_id: number;
			chat_session_id: number;
			user_id: number;
			seen_at: Date;
		}[]
	) {
		return await this.db("chat_message_reads")
			.withSchema(this.DBO_SCHEMA)
			.insert(records, "id");
	}
}

export default ChatModel;
