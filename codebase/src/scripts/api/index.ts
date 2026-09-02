import axios from 'axios';
const api = axios.create({
  baseURL: 'https://personal-api-v1-azure.vercel.app/migrate',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

export default api
