import { backendApi } from "../../services/api";
import { APIResponse } from "../../services/type";
import { ChatInfo, ChatInfoResponse } from "../type";
import { defineStore } from "pinia";

export const useChatStore = defineStore({
  id: "chat",
  state: () => ({
    chatInfo: null as ChatInfo | null,
  }),
  actions: {
    async initChatInfo(data: ChatInfo) {
      this.chatInfo = data;
    },
    async getChatInfo() {
      try {
        const response = await backendApi.get<
          APIResponse<ChatInfoResponse> | ChatInfoResponse
        >("/messages/recent");
        const content =
          response.data && "content" in response.data
            ? response.data.content
            : (response.data as ChatInfoResponse);

        const normalizedContent: ChatInfo = {
          messages: content.messages,
          sessionID: content.sessionID || content.sessionId || "",
          sessionToken: content.sessionToken,
          isOnline: Boolean(content.status_chat),
          status_message: content.status_message,
        };

        this.chatInfo = normalizedContent;

        return normalizedContent;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching chat info:", error);
        return null;
      }
    },
  },
});
