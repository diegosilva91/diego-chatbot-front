export type Message = {
  id: number;
  name: string;
  description: string;
};

export type ChatInfoResponse = {
  messages: Message[];
  sessionId?: string;
  sessionID: string;
  sessionToken: string;
  status_chat: boolean;
  status_message: string;
};

export type ChatInfo = {
  messages: Message[];
  sessionID: string;
  sessionToken: string;
  isOnline: boolean;
  status_message: string;
};
