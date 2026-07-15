<template>
  <div class="card-body msg_card_body" ref="messagesContainer">
    <div v-for="message in messages" :key="message.id">
      <div v-if="message.role === 'user'" class="message-wrapper user-message">
        <div class="msg_cotainer_send">
          {{ message.text }}
        </div>
        <div class="img_cont_msg">
          <img :src="userAvatarSrc()" class="rounded-circle user_img_msg" />
        </div>
      </div>

      <div v-else class="message-wrapper bot-message">
        <div class="img_cont_msg">
          <img :src="botAvatarSrc()" class="rounded-circle user_img_msg" />
        </div>
        <div class="msg_cotainer">
          {{ message.text }}
        </div>
      </div>
    </div>

    <div v-if="showTyping" class="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>
<script lang="ts">
import userAvatar from "@/assets/images/gOr7e1Qaxlh89FlAKz3t.jpg";

type HistoryMessage = {
  user?: string;
  message: string | unknown[];
  sessionId?: string;
};

type BotMessagePayload = {
  sessionId?: string;
  answers: unknown[];
  response?: string;
  message?: string;
  text?: string;
};

type ChatBubble = {
  id: number;
  role: "user" | "bot";
  text: string;
};

const CHATTERWILLY_BOT_AVATAR =
  "https://2.bp.blogspot.com/-8ytYF7cfPkQ/WkPe1-rtrcI/AAAAAAAAGqU/FGfTDVgkcIwmOTtjLka51vineFBExJuSACLcBGAs/s320/31.jpg";
const CHATTERWILLY_USER_AVATAR = "/chatterwilly-user-avatar.svg";

export default {
  props: ["history_messages", "reset_token", "assistant_id"],
  watch: {
    history_messages: {
      handler(newMessages: HistoryMessage[]) {
        if (newMessages && newMessages.length > 0) {
          this.resetMessages();
          this.hydrateHistoryMessages(newMessages);
        }
      },
      deep: true,
    },
    reset_token() {
      this.resetMessages();
    },
  },
  methods: {
    isChatterwilly() {
      return this.assistant_id === "chatterwilly";
    },
    userAvatarSrc() {
      return CHATTERWILLY_USER_AVATAR;
    },
    botAvatarSrc() {
      return this.assistant_id === "diego"
        ? userAvatar
        : CHATTERWILLY_BOT_AVATAR;
    },
    resetMessages() {
      this.messages = [];
      this.id = 0;
      this.showTyping = false;
    },
    hydrateHistoryMessages(historyMessages: HistoryMessage[]) {
      historyMessages.forEach((element) => {
        if (element.user === "user") {
          const message: ChatBubble = {
            id: this.id++,
            role: "user",
            text: String(element.message),
          };
          this.messages.push(message);
        } else {
          const messageBot: ChatBubble = {
            id: this.id++,
            role: "bot",
            text: Array.isArray(element.message)
              ? element.message.map((entry) => String(entry)).join("\n")
              : String(element.message),
          };
          this.messages.push(messageBot);
        }
      });
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer as HTMLElement;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
  },
  mounted() {
    if (this.history_messages && this.history_messages.length > 0) {
      this.hydrateHistoryMessages(this.history_messages);
    }

    this.emitter.on("messagesent", (messageWrite: string) => {
      this.showTyping = true;
      let message = {
        id: this.id++,
        role: "user",
        text: messageWrite,
      };
      this.messages.push(message);
      this.scrollToBottom();
    });

    this.emitter.on("messagesSendBot", (messageWriteBot: BotMessagePayload) => {
      const botText = Array.isArray(messageWriteBot.answers)
        ? messageWriteBot.answers.map((entry) => String(entry)).join("\n")
        : String(
            messageWriteBot.response ||
              messageWriteBot.message ||
              messageWriteBot.text ||
              ""
          );
      const messageBot: ChatBubble = {
        id: this.id++,
        role: "bot",
        text: botText,
      };
      this.messages.push(messageBot);
      this.showTyping = false;
      this.scrollToBottom();
    });
  },
  data() {
    return {
      mixAssetUrl: process.env.VUE_APP_ASSET_URL,
      messages: [] as ChatBubble[],
      id: 0,
      showTyping: false,
    };
  },
};
</script>
<style scoped>
.msg_card_body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #fafbfc;
}

.message-wrapper {
  display: flex;
  align-items: flex-end;
  margin-bottom: 16px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-message {
  justify-content: flex-end;
}

.bot-message {
  justify-content: flex-start;
}

.img_cont_msg {
  height: 36px;
  width: 36px;
  flex-shrink: 0;
}

.user_img_msg {
  height: 36px;
  width: 36px;
  border: 2px solid #e2e8f0;
  object-fit: cover;
}

.msg_cotainer {
  margin-left: 10px;
  padding: 12px 16px;
  border-radius: 18px;
  background-color: #f1f5f9;
  color: #1e293b;
  max-width: 80%;
  font-size: 0.9rem;
  line-height: 1.5;
  position: relative;
  white-space: pre-line;
}

.msg_cotainer::before {
  content: "";
  position: absolute;
  left: -8px;
  top: 8px;
  border: 6px solid transparent;
  border-right-color: #f1f5f9;
}

.msg_cotainer_send {
  margin-right: 10px;
  padding: 12px 16px;
  border-radius: 18px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  max-width: 80%;
  font-size: 0.9rem;
  line-height: 1.5;
  position: relative;
}

.msg_cotainer_send::before {
  content: "";
  position: absolute;
  right: -8px;
  top: 8px;
  border: 6px solid transparent;
  border-left-color: #22c55e;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  margin-left: 46px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #94a3b8;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}
</style>
