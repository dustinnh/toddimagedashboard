import { createApp } from 'vue';
import App from './App.vue';
import './style.css';
import axios from 'axios';

// Configure axios to include API key in all requests
axios.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('openai_api_key');
  if (apiKey) {
    config.headers['X-OpenAI-API-Key'] = apiKey;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

createApp(App).mount('#app');
