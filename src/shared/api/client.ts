import axios from "axios";

const config = { baseURL: "/api/v1", withCredentials: true, timeout: 10_000 };

export const api = axios.create(config);
export const publicApi = axios.create(config);
