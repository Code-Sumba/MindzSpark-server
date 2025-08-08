import axios from 'axios';

const Axios = axios.create({
  baseURL: 'http://localhost:8080', // adjust if using env variables
  withCredentials: true, // only if using cookies/auth sessions
});


Axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accesstoken'); // 👈 your stored token from login
  if (token) {
    config.headers.Authorization = `Bearer ${accesstoken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
export default Axios;
