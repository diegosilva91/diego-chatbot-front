<template>
  <div class="card-footer">
    <div class="quick-questions" v-if="showSuggestions">
      <span
        v-for="suggestion in suggestions"
        :key="suggestion"
        class="suggestion-chip"
        @click="useSuggestion(suggestion)"
      >
        {{ suggestion }}
      </span>
    </div>

    <form @submit.prevent="sendAsk" class="input-wrapper">
      <input
        id="InputQuestion"
        v-model="question"
        class="form-control"
        type="text"
        placeholder="Escribe tu pregunta…"
      />
      <button :disabled="question.length === 0" type="submit" class="btn-send">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, ref, watch } from "vue";
import { backendApi, chatterwillyApi } from "@/services/api";

export default defineComponent({
  props: ["session_id", "session_token", "reset_token", "assistant_id"],
  emits: ["messagesent"],
  setup(props, { emit }) {
    const instance = getCurrentInstance();
    const emitter = (
      instance?.proxy as
        | {
            emitter?: {
              emit: (event: string, payload?: unknown) => void;
            };
          }
        | undefined
    )?.emitter;

    const question = ref("");
    const sessionToken = ref(props.session_token || "");
    const sessionId = ref(props.session_id || "");
    const counter = ref("");
    const showSuggestions = ref(true);

    const suggestions = ["Hola", "¿Quién eres?", "¿Qué puedes hacer?", "Ayuda"];

    watch(
      () => props.session_token,
      (value) => {
        sessionToken.value = value || "";
      }
    );

    watch(
      () => props.session_id,
      (value) => {
        sessionId.value = value || "";
      }
    );

    watch(
      () => props.reset_token,
      () => {
        counter.value = "";
        question.value = "";
        showSuggestions.value = true;
      }
    );

    const isChatterwilly = () => props.assistant_id === "chatterwilly";

    const useSuggestion = (text: string) => {
      question.value = text;
      showSuggestions.value = false;
    };

    const normalizeChatterwillyPayload = (data: unknown) => {
      const outer = data as { content?: Record<string, unknown> } | null;
      const content = outer?.content ?? (data as Record<string, unknown>) ?? {};
      const responseText =
        content.response ??
        content.answer ??
        content.message ??
        content.text ??
        "";

      return {
        sessionId:
          content.sessionId ||
          content.sessionID ||
          content.sessionToken ||
          sessionId.value ||
          "",
        answers: Array.isArray(content.answers)
          ? content.answers
          : responseText
          ? [responseText]
          : [],
        raw: content as Record<string, unknown>,
      };
    };

    const sendAsk = async (e: Event) => {
      e.preventDefault();
      if (question.value.length === 0) return;

      showSuggestions.value = false;
      emitter?.emit("messagesent", question.value);
      emit("messagesent", true);

      try {
        const response = isChatterwilly()
          ? await chatterwillyApi.post("/chat", {
              text: question.value,
            })
          : await backendApi.post("/conversation", {
              sessionToken: sessionToken.value,
              sessionId: sessionId.value,
              message: question.value,
              counters: counter.value,
            });
        const rawResponse = response.data?.content ?? response.data ?? {};
        const payload = isChatterwilly()
          ? normalizeChatterwillyPayload(response.data)
          : rawResponse;

        if (!isChatterwilly()) {
          const raw = rawResponse as Record<string, unknown>;
          const countersValue = raw?.counters;
          const rawSessionToken =
            (raw?.sessionToken as string) ||
            (raw?.session_token as string) ||
            "";
          const rawSessionId =
            (raw?.sessionId as string) || (raw?.sessionID as string) || "";

          sessionToken.value = rawSessionToken;
          sessionId.value = rawSessionId;
          counter.value =
            typeof countersValue === "number" && countersValue >= 1
              ? String(countersValue)
              : "";
        }
        emitter?.emit("messagesSendBot", payload);
        emit("messagesent", false);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error:", error);
        emit("messagesent", false);
      }

      question.value = "";
    };

    return {
      question,
      sessionToken,
      sessionId,
      counter,
      sendAsk,
      suggestions,
      showSuggestions,
      useSuggestion,
    };
  },
});
</script>

<style scoped>
.card-footer {
  padding: 16px;
  background: white;
  border-top: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 0 0 24px 24px;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.suggestion-chip {
  font-size: 0.75rem;
  padding: 6px 12px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.1) 0%,
    rgba(139, 92, 246, 0.1) 100%
  );
  color: #6366f1;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.suggestion-chip:hover {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  transform: translateY(-1px);
}

.input-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

.input-wrapper .form-control {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.input-wrapper .form-control:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn-send {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-send:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-send:disabled {
  background: #e2e8f0;
  cursor: not-allowed;
}
</style>
