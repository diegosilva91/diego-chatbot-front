<template>
  <div class="container">
    <div class="card card-chat">
      <div class="card-header text-white">
        <div class="d-flex bd-highlight">
          <div class="img_cont">
            <img
              :src="activeAssistant.avatar"
              :alt="activeAssistant.name"
              class="rounded-circle user_img"
            />
            <span class="online_icon" :class="{ offline: !isOnline }"></span>
          </div>
          <div class="user_info">
            <h1>{{ activeAssistant.name }}</h1>
            <p>{{ status_message }}</p>
          </div>
        </div>
      </div>

      <div class="bot-info">
        <div class="bot-info-title">Elige asistente</div>
        <div class="assistant-switcher">
          <button
            v-for="assistant in assistants"
            :key="assistant.id"
            type="button"
            class="assistant-option"
            :class="{ active: assistant.id === activeAssistant.id }"
            @click="selectAssistant(assistant.id)"
          >
            <img
              :src="assistant.avatar"
              :alt="assistant.name"
              class="assistant-option-avatar"
            />
            <span class="assistant-option-copy">
              <strong>{{ assistant.name }}</strong>
              <small>{{ assistant.description }}</small>
            </span>
          </button>
        </div>
        <div class="bot-skills">
          <span
            v-for="skill in activeAssistant.skills"
            :key="skill"
            class="skill-tag"
          >
            {{ skill }}
          </span>
        </div>
      </div>

      <MessagesChatComponent
        :history_messages="messages"
        :reset_token="assistantResetToken"
        :session_token="sessionToken"
        :session_id="sessionId"
      ></MessagesChatComponent>
      <FormChatComponent
        :session_id="sessionId"
        :session_token="sessionToken"
        :reset_token="assistantResetToken"
        :assistant_id="activeAssistant.id"
        @messagesent="handleMessageSent"
      ></FormChatComponent>
    </div>
  </div>
</template>

<script lang="ts">
import MessagesChatComponent from "./components/MessagesChatComponent.vue";
import FormChatComponent from "./components/FormChatComponent.vue";
import diegoAvatar from "@/assets/images/gOr7e1Qaxlh89FlAKz3t.jpg";
import { useChatStore } from "@/store/chat";
import { CHATTERWILLY_BACK_URL, DEFAULT_BACK_URL } from "@/services/api";
import { computed, onMounted, ref } from "vue";

type AssistantId = "diego" | "chatterwilly";

type AssistantConfig = {
  id: AssistantId;
  name: string;
  description: string;
  baseUrl: string;
  avatar: string;
  skills: string[];
};

type ChatSessionResponse = {
  sessionToken?: string;
  sessionID?: string;
  messages?: unknown[];
  status_message?: string;
  isOnline?: boolean;
};

const ASSISTANT_STORAGE_KEY = "diego-chatbot.assistant";
const defaultAssistantBaseUrl = DEFAULT_BACK_URL;

const assistants: AssistantConfig[] = [
  {
    id: "diego",
    name: "Diego",
    description: "Tu asistente personal",
    baseUrl: defaultAssistantBaseUrl,
    avatar: diegoAvatar,
    skills: ["Asistente IA", "Responder preguntas", "Conversación"],
  },
  {
    id: "chatterwilly",
    name: "Chatterwilly",
    description: "Conecta con la API del chatbot",
    baseUrl: CHATTERWILLY_BACK_URL,
    avatar: "/favicon.ico",
    skills: ["Robot", "API chatbot", "Sesión persistente"],
  },
];

export default {
  name: "App",
  components: {
    MessagesChatComponent,
    FormChatComponent,
  },
  setup() {
    const status_message = ref("online");
    const isOnline = ref(false);
    const sessionToken = ref("");
    const sessionId = ref("");
    const messages = ref<unknown[]>([]);
    const isTyping = ref(false);
    const assistantResetToken = ref(0);
    const activeAssistantId = ref<AssistantId>("diego");

    const store = useChatStore();
    const activeAssistant = computed(() => {
      return (
        assistants.find(
          (assistant) => assistant.id === activeAssistantId.value
        ) || assistants[0]
      );
    });

    const applyAssistant = (assistantId: AssistantId) => {
      const selectedAssistant =
        assistants.find((assistant) => assistant.id === assistantId) ||
        assistants[0];

      activeAssistantId.value = selectedAssistant.id;
      localStorage.setItem(ASSISTANT_STORAGE_KEY, selectedAssistant.id);
      assistantResetToken.value += 1;
      sessionToken.value = "";
      sessionId.value = "";
      messages.value = [];
      status_message.value = selectedAssistant.description;
      isOnline.value = false;
    };

    const loadChat = async () => {
      try {
        const response: ChatSessionResponse | null = await store.getChatInfo();

        if (!response) {
          throw new Error("Empty chat response");
        }

        sessionToken.value = response.sessionToken || "";
        sessionId.value = response.sessionID || "";
        messages.value = Array.isArray(response.messages)
          ? response.messages
          : [];
        status_message.value =
          response.status_message || activeAssistant.value.description;
        isOnline.value = Boolean(response.isOnline);
      } catch (error) {
        status_message.value = "offline";
        isOnline.value = false;
      }
    };

    const handleMessageSent = (writing: boolean) => {
      isTyping.value = writing;
    };

    const selectAssistant = async (assistantId: AssistantId) => {
      if (assistantId === activeAssistantId.value) return;

      applyAssistant(assistantId);
      await loadChat();
    };

    onMounted(async () => {
      const storedAssistant =
        (localStorage.getItem(ASSISTANT_STORAGE_KEY) as AssistantId | null) ||
        "diego";

      applyAssistant(storedAssistant);
      await loadChat();
    });

    return {
      assistants,
      activeAssistant,
      status_message,
      sessionToken,
      sessionId,
      messages,
      isOnline,
      isTyping,
      assistantResetToken,
      handleMessageSent,
      selectAssistant,
    };
  },
};
</script>

<style lang="scss" scope>
@import "./assets/scss/global.scss";

.assistant-switcher {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
}

.assistant-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  border: 1px solid rgba(99, 102, 241, 0.12);
  border-radius: 16px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.8);
  color: #1e293b;
  text-align: left;
  transition: all 0.2s ease;
}

.assistant-option:hover {
  transform: translateY(-1px);
  border-color: rgba(99, 102, 241, 0.24);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.08);
}

.assistant-option.active {
  border-color: #6366f1;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.12),
    rgba(139, 92, 246, 0.12)
  );
}

.assistant-option-avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  object-fit: cover;
  flex-shrink: 0;
}

.assistant-option-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.assistant-option-copy strong {
  font-size: 0.88rem;
}

.assistant-option-copy small {
  font-size: 0.72rem;
  color: #64748b;
}
</style>
