import axios from 'axios';
const instance = axios.create({
  baseURL: process.env.VUE_APP_BACK_URL,
});
export default instance