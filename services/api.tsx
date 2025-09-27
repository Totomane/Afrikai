// services/api.tsx
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true, // très important pour envoyer les cookies
});

export default api;
