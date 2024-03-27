<template>
  <div class="card-body msg_card_body">
    <div v-for="message in messages" :key="message.id">
      <div v-if="idSender === message.idSender">
        <div
          v-for="message in orderMessages(message.messages)"
          :key="message.id"
          class="d-flex justify-content-end mb-4"
        >
          <div class="msg_cotainer_send" v-html="message"></div>
          <div class="img_cont_msg">
            <img
              :src="mixAssetUrl + '/images/gOr7e1Qaxlh89FlAKz3t.jpg'"
              class="rounded-circle user_img_msg"
            />
          </div>
        </div>
      </div>

      <div v-else class="d-flex justify-content-start mb-4">
        <div class="img_cont_msg">
          <img
            src="https://2.bp.blogspot.com/-8ytYF7cfPkQ/WkPe1-rtrcI/AAAAAAAAGqU/FGfTDVgkcIwmOTtjLka51vineFBExJuSACLcBGAs/s320/31.jpg"
            class="rounded-circle user_img_msg"
          />
        </div>
        <div class="msg_cotainer">
          {{ message.message }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  props: ["history_messages"],
  methods: {
    orderMessages: function (message) {
      //console.log(message)
      return message.map((element) => element);
    },
  },
  mounted() {
    //console.log("history",vm.history_messages)
    if (this.history_messages && this.history_messages.length > 0)
      this.history_messages.forEach((element) => {
        //console.log(element)
        if (element.user === "user") {
          let message = {
            id: this.id++,
            message: element.message,
            idSender: this.id,
          };
          this.messages.push(message);
        } else {
          let messageBot = {
            id: this.id++,
            messages: element.message,
            idSender: element.sessionId,
          };
          this.messages.push(messageBot);
          this.idSender = element.sessionId ? element.sessionId : "";
        }
        //console.log(vm.messages)
      });
    this.emitter.on("messagesent", (messageWrite) => {
      let message = {
        id: this.id++,
        message: messageWrite,
        idSender: this.id,
      };
      this.messages.push(message);
    });
    this.emitter.on("messagesSendBot", (messageWriteBot) => {
      //console.log("answers",messageWriteBot.answers)
      // console.log("Sesionid",messageWriteBot.sessionId,vm.idSender)
      this.idSender = messageWriteBot.sessionId;
      //console.log("arrow",messageWriteBot.answers.reduce((element) => (element)))
      let answerBot = messageWriteBot.answers; //.reduce((element) => (element.message))
      let messageBot = {
        id: this.id++,
        messages: answerBot,
        idSender: messageWriteBot.sessionId,
      };
      this.messages.push(messageBot);
      // console.log("idSender",vm.idSender)
      // console.log("messages",this.messages);
    });
  },
  data() {
    return {
      mixAssetUrl: process.env.MIX_ASSET_URL,
      messages: [],
      messagesBot: [],
      id: 0,
      idSender: "",
    };
  },
};
</script>
<style scoped>
.img_cont_msg {
  height: 40px;
  width: 40px;
}

.user_img_msg {
  height: 40px;
  width: 40px;
  border: 1.5px solid #f5f6fa;
}

.msg_cotainer {
  margin-top: auto;
  margin-bottom: auto;
  margin-left: 10px;
  border-radius: 25px;
  background-color: #82ccdd;
  padding: 10px;
  position: relative;
}

.msg_cotainer_send {
  margin-top: auto;
  margin-bottom: auto;
  margin-right: 10px;
  border-radius: 25px;
  background-color: #78e08f;
  padding: 10px;
  position: relative;
}

.msg_card_body {
  overflow-y: auto;
}
</style>
