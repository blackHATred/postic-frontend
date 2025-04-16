import axios from 'axios';
import config from '../constants/appConfig';

const axiosInstance = axios.create({
  baseURL: config.api.baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
