export interface ICreateChatSessionPayload {
  user1_id: number;
  user2_id: number;
}

export interface IGetChatSession {
  id: number;
  user1_id: number;
  user2_id: number;
  last_message: string;
  last_message_at: string;
  enable_chat: boolean;
}

export interface IUpdateChatSessionPayload {
  last_message?: string;
  last_message_at?: string;
  enable_chat?: boolean;
}

export interface ICreateChatMessagePayload {
  chat_session_id: number;
  sender_id: number;
  receiver_id: number;
  message?: string;
  file?: string;
}

export interface IGetChatMessage {
  id: number;
  chat_session_id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  file: string;
  is_read: boolean;
  created_at: string;
}
