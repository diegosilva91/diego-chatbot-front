import http from "../../services/api";
import { APIResponse } from "../../services/type";
import { ChatInfo } from "../type";
import { defineStore } from "pinia";

export const useChatStore = defineStore({
    id: "chat",
    state: () => ({
      chatInfo: null as ChatInfo | null
    }),
    actions: {
      async initChatInfo(data: ChatInfo) {
        this.chatInfo = data;
      },
      async getChatInfo() {
        try {
          const response = await http.get<APIResponse<ChatInfo>>("chatInfo");
          this.chatInfo = response.data;
        } catch (error) {
          console.error("Error fetching chat info:", error);
        }
      }
    }
  });