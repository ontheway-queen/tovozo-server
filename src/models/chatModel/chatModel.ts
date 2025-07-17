import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
  ICreateChatMessagePayload,
  ICreateChatSessionPayload,
  IGetChatSession,
} from "../../utils/modelTypes/chat/chatModelTypes";

class ChatModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createChatSession(payload: ICreateChatSessionPayload) {
    return await this.db("chat_sessions")
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, "id");
  }

  public async getChatSession({
    user1_id,
    user2_id,
    id,
  }: {
    user1_id?: number;
    user2_id?: number;
    id?: number;
  }): Promise<IGetChatSession> {
    return await this.db("chat_sessions")
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
        } else if (user1_id && user2_id) {
          qb.where((subQb) => {
            subQb
              .where({ user1_id, user2_id })
              .orWhere({ user1_id: user2_id, user2_id: user1_id });
          });
        }
      })
      .first();
  }

  public async getChatSessionList({
    user_id,
    enable_chat,
    limit,
    skip,
  }: {
    user_id?: number;
    enable_chat?: boolean;
    limit?: number;
    skip?: number;
  }) {
    const data = await this.db("chat_sessions as cs")
      .withSchema(this.DBO_SCHEMA)
      .select(
        "cs.id",
        "cs.user1_id",
        "cs.user2_id",
        "cs.last_message",
        "cs.last_message_at",
        "cs.enable_chat",
        this.db.raw(
          `
        CASE
          WHEN cs.user1_id = ? THEN u2.id
          ELSE u1.id
        END AS user_id
      `,
          [user_id]
        ),
        this.db.raw(
          `
        CASE
          WHEN cs.user1_id = ? THEN u2.name
          ELSE u1.name
        END AS user_name
      `,
          [user_id]
        ),
        this.db.raw(
          `
        CASE
          WHEN cs.user1_id = ? THEN u2.photo
          ELSE u1.photo
        END AS user_photo
      `,
          [user_id]
        ),
        this.db.raw(
          `
        CASE
          WHEN cs.user1_id = ? THEN u2.type
          ELSE u1.type
        END AS user_type
      `,
          [user_id]
        )
      )
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
    const total = await this.db("chat_sessions as cs")
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
      total: total?.total,
    };
  }

  public async getChatSessionListForAdmin({
    user_id,
    enable_chat,
    limit,
    skip,
  }: {
    user_id?: number;
    enable_chat?: boolean;
    limit?: number;
    skip?: number;
  }) {
    const data = await this.db("chat_sessions as cs")
      .withSchema(this.DBO_SCHEMA)
      .select(
        "cs.id",
        "cs.user1_id",
        "cs.user2_id",
        "cs.last_message",
        "cs.last_message_at",
        "cs.enable_chat",
        this.db.raw(
          `
        CASE
          WHEN cs.user1_id != ? THEN u2.id
          ELSE u1.id
        END AS user_id
      `,
          [user_id]
        ),
        this.db.raw(
          `
        CASE
          WHEN cs.user1_id != ? THEN u2.name
          ELSE u1.name
        END AS user_name
      `,
          [user_id]
        ),
        this.db.raw(
          `
        CASE
          WHEN cs.user1_id != ? THEN u2.photo
          ELSE u1.photo
        END AS user_photo
      `,
          [user_id]
        ),
        this.db.raw(
          `
        CASE
          WHEN cs.user1_id != ? THEN u2.type
          ELSE u1.type
        END AS user_type
      `,
          [user_id]
        )
      )
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
    const total = await this.db("chat_sessions as cs")
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
      total: total?.total,
    };
  }

  public async updateChatSession(
    payload: Partial<IGetChatSession>,

    where: { id: number }
  ) {
    return await this.db("chat_sessions")
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id: where.id });
  }

  public async createChatMessage(payload: ICreateChatMessagePayload) {
    return await this.db("chat_messages")
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, "id");
  }

  public async getChatMessages({
    chat_session_id,
    user_id,
    limit,
    skip,
  }: {
    chat_session_id: number;
    user_id: number;
    limit: number;
    skip: number;
  }) {
    return await this.db("chat_messages as cm")
      .withSchema(this.DBO_SCHEMA)
      .select(
        "cm.*",
        this.db.raw(
          `
        CASE
          WHEN cm.sender_id != ? THEN u1.name
          ELSE u2.name
        END AS user_name
      `,
          [user_id]
        ),
        this.db.raw(
          `
        CASE
          WHEN cm.sender_id != ? THEN u1.photo
          ELSE u2.photo
        END AS user_photo
      `,
          [user_id]
        ),
        this.db.raw(
          `
        CASE
          WHEN cm.sender_id != ? THEN u1.type
          ELSE u2.type
        END AS user_type
      `,
          [user_id]
        )
      )
      .leftJoin("user as u1", "u1.id", "cm.sender_id")
      .leftJoin("user as u2", "u2.id", "cm.receiver_id")
      .where("cm.chat_session_id", chat_session_id)
      .andWhere("cm.sender_id", user_id)
      .orderBy("cm.created_at", "desc")
      .limit(limit || 50)
      .offset(skip || 0);
  }
}

export default ChatModel;
