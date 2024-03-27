export type Message = {
    id: number;
    name: string;
    description: string;
  };

  export type ChatInfo = {
    messages: Message[];
    sessionID: string;
    sessionToken: string;
    status_chat: boolean;
    status_message: string;
  }