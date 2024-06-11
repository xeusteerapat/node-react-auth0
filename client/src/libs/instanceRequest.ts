import axios from 'axios';

export const apiInstance = axios.create({
  baseURL: 'http://localhost:5001',
  withCredentials: true,
  headers: {
    'Access-Control-Allow-Credentials': true,
  },
});
