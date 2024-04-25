import { authInstance, instance } from '../axios';
import { AxiosError } from 'axios';
import type {
  SignUpUser,
  LoginUser,
  VarifyCheck,
} from '@/interfaces/main/auth/auth.interface';
import { Cookies } from 'react-cookie';
import useAuthStore from '@/store/AuthState';
import { useNavigate } from 'react-router-dom';
import { AuthUser } from '@/interfaces/user/user.interface';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

export const signUp = async (user: SignUpUser) => {
  try {
    const res = await instance.post('/users/signup', user);
    return res;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const message = axiosError.response.data.message || '회원가입 실패';
      throw new Error(message);
    }
    throw new Error('Network error');
  }
};

export const login = async (user: LoginUser) => {
  try {
    const res = await authInstance.post('/users/login', user);
    console.log('로그인정보: ', res);

    return res;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const message = axiosError.response.data.message || 'Login 실패';
      throw new Error(message);
    }
    throw new Error('Network error');
  }
};

export const getUserInfo = async (): Promise<AuthUser> => {
  try {
    const response = await authInstance.get('/users/my-info');
    localStorage.setItem('user', JSON.stringify(response.data));
    console.log('내정보: ', response.data);
    return response.data;
  } catch (error) {
    throw error as AxiosError<ErrorResponse>;
  }
};

export const sendVerificationCode = async (email: string) => {
  try {
    await instance.post(`/email-verification?email=${email}`);
  } catch (error) {
    throw error as AxiosError<ErrorResponse>;
  }
};

export const varifyNumberCheck = async (user: VarifyCheck) => {
  const { email, code } = user;
  try {
    const res = await instance.get(
      `/email-verification?email=${email}&code=${code}`,
    );
    const result = res.data;
    return result;
  } catch (error) {
    throw error as AxiosError<ErrorResponse>;
  }
};

export const nicknameDupCheck = async (nickname: string) => {
  try {
    const res = await instance.get(
      `/users/check-nickname?nickname=${nickname}`,
    );
    return res;
  } catch (error) {
    throw error as AxiosError<ErrorResponse>;
  }
};

export const useLogout = () => {
  const navigate = useNavigate();
  const cookie = new Cookies();

  return async () => {
    const token = cookie.get('accessToken');
    const param = `Bearer ${token}`;

    try {
      await instance.post(`/users/logout?accessToken=${param}`);
    } catch (error) {
      console.error('Logout failed:', error);
    }

    cookie.remove('accessToken', { path: '/' });
    useAuthStore.getState().logout();
    navigate('/');
  };
};
