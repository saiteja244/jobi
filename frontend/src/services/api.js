import axios from "axios";

const API = axios.create({
  baseURL: "https://jobi-1-t3gk.onrender.com/api"
});

export default API;
