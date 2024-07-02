// services/http.ts
import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios';

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: 'http://10.1.52.70:3030/', // 这里是你的 API 地址
  // baseURL: 'http://192.168.204.237:3030/', // 这里是你的 API 地址
  timeout: 5000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 这里可以添加 token 等请求头信息
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 处理请求错误
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 可以根据实际情况处理响应数据
    return response.data;
  },
  (error) => {
    // 处理响应错误
    // 这里可以添加全局错误处理，例如跳转到登录页面
    console.error('Error: ', error.response ? error.response.data : 'Network Error');
    return Promise.reject(error);
  }
);

export default service;
