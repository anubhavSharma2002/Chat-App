// src/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://chat-app-3i4l.onrender.com',
  withCredentials: true,
});
