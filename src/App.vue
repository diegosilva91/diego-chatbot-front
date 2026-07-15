<template>
  <div class="page-shell">
    <header class="chat-header">
      <div class="chat-header__brand">
        <div class="chat-header__mark">DC</div>
        <div>
          <div class="chat-header__eyebrow">Chat web</div>
          <h1 class="chat-header__title">Diego Chatbot</h1>
        </div>
      </div>

      <div class="chat-header__status">
        <span class="chat-header__dot" :class="{ offline: !isOnline }"></span>
        <div>
          <strong>{{ activeAssistant.name }}</strong>
          <p>{{ status_message }}</p>
        </div>
      </div>
    </header>

    <div class="page-hero">
      <div class="page-hero__title">
        <p>
          Selecciona un asistente y continúa la conversación en el panel
          principal.
        </p>
      </div>
    </div>

    <div class="mobile-assistant-switcher">
      <button
        class="mobile-assistant-switcher__button"
        type="button"
        @click="toggleMobileAssistantMenu"
      >
        <span class="mobile-assistant-switcher__label">Asistente</span>
        <span class="mobile-assistant-switcher__active">
          {{ activeAssistant.name }}
        </span>
        <span
          class="mobile-assistant-switcher__chevron"
          :class="{ open: isMobileAssistantMenuOpen }"
        >
          ⌄
        </span>
      </button>
      <div
        v-if="isMobileAssistantMenuOpen"
        class="mobile-assistant-switcher__menu"
      >
        <button
          v-for="assistant in assistants"
          :key="assistant.id"
          type="button"
          class="mobile-assistant-switcher__item"
          :class="{ active: assistant.id === activeAssistant.id }"
          @click="selectAssistantAndCloseMenu(assistant.id)"
        >
          <img
            :src="assistant.avatar"
            :alt="assistant.name"
            class="mobile-assistant-switcher__avatar"
          />
          <span>
            <strong>{{ assistant.name }}</strong>
            <small>{{ assistant.description }}</small>
          </span>
        </button>
      </div>
    </div>

    <div class="chat-layout">
      <aside class="assistant-panel">
        <div class="assistant-panel__header">
          <div class="img_cont assistant-panel__avatar">
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

        <div class="assistant-panel__section">
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
        </div>

        <div class="assistant-panel__section">
          <div class="bot-info-title">Capacidades</div>
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
      </aside>

      <section class="chat-panel">
        <MessagesChatComponent
          :history_messages="messages"
          :reset_token="assistantResetToken"
          :session_token="sessionToken"
          :session_id="sessionId"
          :assistant_id="activeAssistant.id"
        ></MessagesChatComponent>
        <FormChatComponent
          :session_id="sessionId"
          :session_token="sessionToken"
          :reset_token="assistantResetToken"
          :assistant_id="activeAssistant.id"
          @messagesent="handleMessageSent"
        ></FormChatComponent>
      </section>
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
    description: "Asistente cercano y claro",
    baseUrl: defaultAssistantBaseUrl,
    avatar: diegoAvatar,
    skills: ["Asistente IA", "Responder preguntas", "Conversación"],
  },
  {
    id: "chatterwilly",
    name: "Chatterwilly",
    description: "Robot simpático para ayudarte",
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
    const isMobileAssistantMenuOpen = ref(false);

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

    const toggleMobileAssistantMenu = () => {
      isMobileAssistantMenuOpen.value = !isMobileAssistantMenuOpen.value;
    };

    const selectAssistantAndCloseMenu = async (assistantId: AssistantId) => {
      isMobileAssistantMenuOpen.value = false;
      await selectAssistant(assistantId);
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
      isMobileAssistantMenuOpen,
      handleMessageSent,
      selectAssistant,
      toggleMobileAssistantMenu,
      selectAssistantAndCloseMenu,
    };
  },
};
</script>

<style lang="scss" scope>
@import "./assets/scss/global.scss";

.page-shell {
  width: min(1240px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 24px 0 32px;
  min-height: 100vh;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  padding: 16px 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.1);
}

.chat-header__brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.chat-header__mark {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.chat-header__eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6366f1;
  font-weight: 700;
  margin-bottom: 4px;
}

.chat-header__title {
  margin: 0;
  font-size: 1.15rem;
  color: #0f172a;
}

.chat-header__status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.95);
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.chat-header__status strong {
  display: block;
  color: #0f172a;
  font-size: 0.92rem;
}

.chat-header__status p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 0.78rem;
}

.chat-header__dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.12);
}

.page-hero {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}

.mobile-assistant-switcher {
  display: none;
  margin-bottom: 16px;
  position: relative;
}

.mobile-assistant-switcher__button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
  border: 1px solid rgba(99, 102, 241, 0.14);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  padding: 14px 16px;
  color: #0f172a;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.mobile-assistant-switcher__label {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6366f1;
  font-weight: 700;
}

.mobile-assistant-switcher__active {
  flex: 1;
  text-align: left;
  font-weight: 700;
}

.mobile-assistant-switcher__chevron {
  transition: transform 0.2s ease;
}

.mobile-assistant-switcher__chevron.open {
  transform: rotate(180deg);
}

.mobile-assistant-switcher__menu {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  right: 0;
  z-index: 20;
  display: grid;
  gap: 8px;
  padding: 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.14);
}

.mobile-assistant-switcher__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  border: 1px solid rgba(99, 102, 241, 0.12);
  border-radius: 14px;
  background: #fff;
  padding: 10px 12px;
  text-align: left;
  color: #1e293b;
}

.mobile-assistant-switcher__item.active {
  border-color: #6366f1;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.12),
    rgba(139, 92, 246, 0.12)
  );
}

.mobile-assistant-switcher__avatar {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  object-fit: cover;
  flex-shrink: 0;
}

.page-hero__eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6366f1;
  font-weight: 700;
}

.page-hero__title {
  display: grid;
  gap: 8px;
  max-width: 760px;

  p {
    margin: 0;
    color: #475569;
    font-size: 1rem;
    line-height: 1.6;
  }
}

.chat-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;
  align-items: stretch;
}

.assistant-panel,
.chat-panel {
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.1);
  overflow: hidden;
}

.assistant-panel {
  display: flex;
  flex-direction: column;
  padding: 18px;
  gap: 18px;
}

.assistant-panel__header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 22px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.12),
    rgba(139, 92, 246, 0.12)
  );
}

.assistant-panel__avatar {
  height: 64px;
  width: 64px;
}

.assistant-panel .user_info h1 {
  color: #0f172a;
  font-size: 1.15rem;
}

.assistant-panel .user_info p {
  color: #475569;
  font-size: 0.85rem;
}

.assistant-panel__section {
  display: grid;
  gap: 10px;
}

.assistant-switcher {
  display: flex;
  flex-direction: column;
  gap: 10px;
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

.bot-skills {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.skill-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 64px;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(99, 102, 241, 0.14);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(248, 250, 252, 0.96) 100%
  );
  color: #1e293b;
  font-size: 0.84rem;
  line-height: 1.25;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.skill-tag:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.28);
  box-shadow: 0 16px 28px rgba(99, 102, 241, 0.12);
}

.chat-panel {
  display: flex;
  flex-direction: column;
  min-height: 760px;
}

.chat-panel :deep(.card-body.msg_card_body) {
  min-height: 0;
}

@media (max-width: 1024px) {
  .page-shell {
    width: min(100vw - 24px, 1240px);
    padding-top: 16px;
  }

  .chat-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .mobile-assistant-switcher {
    display: block;
  }

  .chat-layout {
    grid-template-columns: 1fr;
  }

  .assistant-panel {
    display: none;
  }

  .chat-panel {
    order: 1;
    min-height: 680px;
  }

  .bot-skills {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .page-shell {
    width: calc(100vw - 16px);
    padding-top: 12px;
  }

  .assistant-panel,
  .chat-panel {
    border-radius: 22px;
  }

  .chat-header {
    padding: 14px 16px;
  }

  .chat-header__status {
    width: 100%;
  }

  .assistant-panel {
    padding: 14px;
  }

  .bot-skills {
    grid-template-columns: 1fr;
  }

  .skill-tag {
    min-height: auto;
    justify-content: flex-start;
    text-align: left;
  }
}
</style>
