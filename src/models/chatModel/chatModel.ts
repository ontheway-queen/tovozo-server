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
	}) {
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
		last_message,
		session_id,
	}: {
		last_message?: string;
		session_id: number;
	}) {
		return await this.db("chat_sessions")
			.withSchema(this.DBO_SCHEMA)
			.where({ id: session_id })
			.update({ last_message, last_message_at: new Date() }, "id");
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
			participant_user_id: number;
			participant_name: string;
			participant_email: string;
			participant_image: string;
			participant_type: TypeUser;
		}[]
	> {
		const { user_id, name } = query;

		const baseQuery = this.db
			.withSchema(this.DBO_SCHEMA)
			.select(
				"cs.id as session_id",
				"cs.last_message",
				"cs.last_message_at",
				"other_participant.id as participant_user_id",
				"other_participant.name as participant_name",
				"other_participant.email as participant_email",
				"other_participant.photo as participant_image",
				"other_participant.type as participant_type"
			)
			.from("chat_sessions as cs")
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
			.where("csp.user_id", user_id)
			.orderBy("cs.last_message_at", "desc");

		if (name !== "undefined") {
			console.log({ name });
			console.log(1);
			baseQuery.whereILike("other_participant.name", `%${name}%`);
		}

		return await baseQuery;
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
		const messages = await this.db("chat_messages as cm")
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
			.where("cm.chat_session_id", chat_session_id)
			.andWhere("csp.user_id", user_id)
			.orderBy("cm.created_at", "asc")
			.limit(limit)
			.offset(skip);

		return messages;
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
}

export default ChatModel;
