import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { USER_TYPE } from "../../../utils/miscellaneous/constants";
import { ICreateChatMessagePayload } from "../../../utils/modelTypes/chat/chatModelTypes";

class AdminChatService extends AbstractServices {
  constructor() {
    super();
  }

  public async createChatSession(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_id } = req.body as unknown as {
        user_id: number;
      };

      const user1_id = req.admin.user_id;
      const user2_id = user_id;

      if (user1_id === user2_id) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Cannot create chat session with yourself!",
        };
      }

      const model = this.Model.chatModel(trx);
      const userModel = this.Model.UserModel(trx);

      const checkUser = await userModel.checkUser({ id: user_id });
      if (!checkUser.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "User not found!",
        };
      }

      if (checkUser[0].type === USER_TYPE.ADMIN) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Cannot create chat session with admin!",
        };
      }

      const chatSession = await model.getChatSession({ user1_id, user2_id });

      if (chatSession) {
        return {
          success: true,
          code: this.StatusCode.HTTP_SUCCESSFUL,
          message: this.ResMsg.HTTP_SUCCESSFUL,
          data: chatSession,
        };
      }

      const newChatSession = await model.createChatSession({
        user1_id,
        user2_id,
      });

      if (!newChatSession.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
          message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
        };
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: newChatSession[0],
      };
    });
  }

  public async getChatSession(req: Request) {
    const query = req.query as unknown as {
      enable_chat: boolean;
      limit: number;
      skip: number;
    };

    const { user_id } = req.admin;

    const model = this.Model.chatModel();
    const chatSession = await model.getChatSessionList({
      user_id,
      enable_chat: query.enable_chat,
      limit: query.limit,
      skip: query.skip,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      ...chatSession,
    };
  }

  public async getChatMessages(req: Request) {
    const { id } = req.params;
    const { limit, skip } = req.query as unknown as {
      limit: number;
      user_id: number;
      skip: number;
    };

    const { user_id } = req.admin;

    const model = this.Model.chatModel();
    const chatMessages = await model.getChatMessages({
      chat_session_id: Number(id),
      user_id,
      limit,
      skip,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: chatMessages,
    };
  }

  public async createChatMessage(req: Request) {
    const body = req.body as unknown as ICreateChatMessagePayload;
    return await this.db.transaction(async (trx) => {
      const model = this.Model.chatModel(trx);

      const { user_id } = req.admin;
      const checkSession = await model.getChatSession({
        id: body.chat_session_id,
        user1_id: user_id,
        user2_id: body.receiver_id,
      });
      if (!checkSession) {
        return {
          success: false,
          message: "Chat session not found!",
          code: this.StatusCode.HTTP_NOT_FOUND,
        };
      }

      body.sender_id = user_id;

      const chatMessage = await model.createChatMessage(body);
      if (!chatMessage.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
          message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
        };
      }
      await model.updateChatSession(
        {
          last_message: body.message,
          last_message_at: new Date().toDateString(),
        },
        { id: body.chat_session_id }
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: chatMessage[0],
      };
    });
  }
}

export default AdminChatService;
