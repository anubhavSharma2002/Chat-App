// src/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://chat-app-4apm.onrender.com',
  withCredentials: true,
});
