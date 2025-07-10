import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router/index.ts";
import "./assets/styles/_framework.scss";
import axios from "axios";
import i18n from "./i18n";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);

const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
}

app.mount("#app");
