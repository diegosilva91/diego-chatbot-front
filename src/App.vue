<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card card-chat">
          <div class="card-header text-white">
            <div class="d-flex bd-highlight">
              <div class="img_cont">
                <img
                  src="./assets/images/gOr7e1Qaxlh89FlAKz3t.jpg"
                  class="rounded-circle user_img"
                />
                <span
                  class="online_icon"
                  :class="{ offline: !status_chat }"
                ></span>
              </div>
              <div class="user_info">
                <h1>Diego ChatBot</h1>
                <p>{{ status_message }}</p>
              </div>
            </div>
          </div>
          <MessagesChatComponent
            :history_messages="messages"
            :session_token="sessionToken"
            :session_id="sessionId"
          ></MessagesChatComponent>
          <FormChatComponent
            :session_id="sessionId"
            :session_token="sessionToken"
          ></FormChatComponent>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import MessagesChatComponent from "./components/MessagesChatComponent.vue";
import FormChatComponent from "./components/FormChatComponent.vue";
import { useChatStore } from "@/store/chat";
import { ref, onMounted } from "vue";

export default {
  name: "App",
  components: {
    MessagesChatComponent,
    FormChatComponent,
  },
  setup() {
    const answer = ref("I cannot give you an answer until you ask a question!");
    const status_message = ref("online");
    const status_chat = ref(false);
    const sessionToken = ref("");
    const sessionId = ref("");
    const messages = ref("");

    const store = useChatStore();

    const loadChat = async () => {
      try {
        const response: any = await store.getChatInfo();
        sessionToken.value = response.sessionToken;
        sessionId.value = response.sessionId;
        status_message.value = response.status_message;
        status_chat.value = response.status_chat;
        // counter.value = response.counters >= 1 ? response.counters : "";
        answer.value = "writing...";
        // question.value = "";
      } catch (error) {
        answer.value = "Error! Could not reach the API. " + error;
      }
    };

    onMounted(loadChat);

    return {
      answer,
      status_message,
      sessionToken,
      sessionId,
      messages,
      status_chat,
    };
  },
};
</script>

<style lang="scss" scope>
@import "./assets/scss/global.scss";
</style>
