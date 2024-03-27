<template>
    <div class="card-footer text-white">
        <form @submit="SendAsk">
            <div class="form-group">
                <label for="InputQuestion"></label>
                <input id="InputQuestion" v-model="question" class="form-control" type="text"
                    placeholder="Type your question here…">
                <small id="InputQuestion" class="form-text">{{ answer }}</small>
            </div>
            <button :disabled="question.length == 0" type="submit" class="btn btn-success">Submit</button>
        </form>
    </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import axios from 'axios'
import { useChatStore } from '@/store/chat';


const store = useChatStore();

export default {
    props: ['session_id', 'session_token'],
    setup() {
        const answer = ref('I cannot give you an answer until you ask a question!');
        const question = ref('');
        const sessionToken = ref('');
        const sessionId = ref('');
        const counter = ref('');
        const sendAsk = async (e) => {
            e.preventDefault();
            try {
                const response = await store.getChatInfo();
                sessionToken.value = response.sessionToken;
                sessionId.value = response.sessionId;
                counter.value = response.counters >= 1 ? response.counters : '';
                answer.value = 'writing...';
                question.value = ''; 
            } catch (error) {
                answer.value = 'Error! Could not reach the API. ' + error;
            }
        };
        return {
            answer,
            question,
            sessionToken,
            sessionId,
            counter,
            sendAsk
        };
    },
    mounted() {
        console.log('Component mounted.')
        this.sessionToken = this.session_token ? this.session_token : '',
            this.sessionId = this.session_id ? this.session_id : ''
    },
   /* data() {
        return {
            question: '',
            answer: 'I cannot give you an answer until you ask a question!',
            sessionToken: '',
            sessionId: '',
            counter: ''
        }
    },*/
    watch: {

    },
    methods: {
        SendAsk: function (e) {
            //let targetId = event.currentTarget.id;
            //  this.emitter.emit(('messagesent', this.question);
            e.preventDefault();
            var vm = this
            // console.log("request",{sessionToken:this.sessionToken,sessionId:this.sessionId,message:this.question})
            axios.post(process.env.VUE_APP_BACK_URL + '/api/conversation', { sessionToken: this.sessionToken, sessionId: this.sessionId, message: this.question, counters: vm.counter })
                .then(function (response) {
                    //console.log("response",response)
                    vm.answer = ''
                    vm.sessionToken = response.data.sessionToken
                    vm.sessionId = response.data.sessionId
                    vm.counter = response.data.counters >= 1 ? response.data.counters : ''
                    // this.emitter.emit(('messagesSendBot', response.data);//vm.answer = _.capitalize(response.data.answer)
                })
                .catch(function (error) {
                    vm.answer = 'Error! Could not reach the API. ' + error
                })
            vm.answer = 'writing...'
            vm.question = ''
        }
    }
}
</script>
