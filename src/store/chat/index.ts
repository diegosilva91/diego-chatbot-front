import { backendApi } from "../../services/api";
import { APIResponse } from "../../services/type";
import { ChatInfo } from "../type";
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
        const response = await backendApi.get<APIResponse<ChatInfo> | ChatInfo>(
          "/messages/recent"
        );
        const content =
          response.data && "content" in response.data
            ? response.data.content
            : (response.data as ChatInfo);

        this.chatInfo = content;

        return content;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching chat info:", error);
        return null;
      }
    },
  },
});
