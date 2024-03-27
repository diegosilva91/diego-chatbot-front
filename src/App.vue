<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card card-chat">
          <div class="card-header text-white">
            <div class="d-flex bd-highlight">
              <div class="img_cont">
                <img src="./assets/images/gOr7e1Qaxlh89FlAKz3t.jpg" class="rounded-circle user_img">
                <span class="online_icon @unless($status_chat) offline @endunless"></span>
              </div>
              <div class="user_info">
                <h1>Diego ChatBot</h1>
                <p>{{ status_message }}</p>
              </div>
            </div>
          </div>
          <MessagesChatComponent :history_messages="messages"></MessagesChatComponent>
          <FormChatComponent :session_id="sessionID" :session_token="sessionToken"></FormChatComponent>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MessagesChatComponent from './components/MessagesChatComponent.vue'
import FormChatComponent from './components/FormChatComponent.vue'

export default {
  name: 'App',
  components: {
    MessagesChatComponent,
    FormChatComponent
  },
  data() {
    return {
      question: '',
      answer: 'I cannot give you an answer until you ask a question!',
      sessionToken: '',
      sessionID: '',
      messages: '',
      status_message: "online",
    }
  },
  mounted(){
    
  },
}
</script>

<style lang="scss" scope>
@import './assets/scss/global.scss'
</style>
