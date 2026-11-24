import axiosClient from './axiosClient';

export const authApi = {
  login: async (credentials) => {
    const res = await axiosClient.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await axiosClient.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await axiosClient.get('/auth/me');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await axiosClient.put('/auth/profile', data);
    return res.data;
  },
  updatePassword: async (passwords) => {
    const res = await axiosClient.put('/auth/updatepassword', passwords);
    return res.data;
  },
  forgotPassword: async (email) => {
    const res = await axiosClient.post('/auth/forgotpassword', { email });
    return res.data;
  },
  resetPassword: async (token, password) => {
    const res = await axiosClient.put(`/auth/resetpassword/${token}`, { password });
    return res.data;
  },
};

