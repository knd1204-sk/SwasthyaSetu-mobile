import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const BASE_URL = 'https://swasthyasetu-3cif.onrender.com';
export const API_BASE = `${BASE_URL}/api`;

const TOKEN_KEY = 'swasthyasetu_jwt_token';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE,
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  instance.interceptors.request.use(
    async (config) => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to get auth token from secure store:', error);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      if (axios.isCancel(error)) {
        return Promise.reject(error);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const api = createApiInstance();

export const tokenStorage = {
  async save(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async get(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },
  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

export const LANG_KEY = 'swasthyasetu_language';

export const languageStorage = {
  async save(lang: string): Promise<void> {
    await SecureStore.setItemAsync(LANG_KEY, lang);
  },
  async get(): Promise<string | null> {
    return await SecureStore.getItemAsync(LANG_KEY);
  },
  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(LANG_KEY);
  },
};

export const handleApiError = (error: unknown): { message: string; status?: number; isColdStart?: boolean } => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const responseData = error.response?.data as ApiResponse | undefined;
    const message = responseData?.message || error.message || 'Unknown error';

    if (status === 408 || (error.code === 'ECONNABORTED' && !error.response)) {
      return { message: 'Request timed out. The server may be waking up from idle — please try again.', status, isColdStart: true };
    }

    if (!error.response && (error.code === 'ERR_NETWORK' || error.message.includes('Network Error'))) {
      return { message: 'Connecting to server...', status, isColdStart: true };
    }

    return { message, status };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'An unexpected error occurred' };
};

export const get = <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
  return api.get<ApiResponse<T>>(url, config);
};

export const post = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<ApiResponse<T>>> => {
  return api.post<ApiResponse<T>>(url, data, config);
};

export const patch = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<ApiResponse<T>>> => {
  return api.patch<ApiResponse<T>>(url, data, config);
};

export const put = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<ApiResponse<T>>> => {
  return api.put<ApiResponse<T>>(url, data, config);
};

export const del = <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
  return api.delete<ApiResponse<T>>(url, config);
};

export interface User {
  id: string;
  email: string;
  phone: string;
  role: 'doctor' | 'laboratory' | 'patient';
  created_at: string;
}

export interface DoctorProfile {
  id: string;
  user_id: string;
  full_name: string;
  specialization: string;
  registration_number: string;
  clinic_hospital_name: string;
  years_of_experience: number;
  created_at: string;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  health_id: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  address: string;
  emergency_contact: string;
  created_at: string;
}

export interface LoginData {
  user: User;
  role: string;
  profile: PatientProfile | DoctorProfile | any;
  token: string;
}

export const authApi = {
  login: (identifier: string, password: string) =>
    post<LoginData>('/auth/login', { identifier, password }),

  me: () => get<{ user: User; profile: PatientProfile | DoctorProfile | any }>('/auth/me'),
};

export const patientApi = {
  getMe: () => get<PatientProfile>('/patients/me'),
  getConsultations: () => get<any[]>('/patients/me/consultations'),
  getPrescriptions: () => get<any[]>('/patients/me/prescriptions'),
  getLabOrders: () => get<any[]>('/patients/me/lab-orders'),
  getLabReports: () => get<any[]>('/patients/me/lab-reports'),
  getChronicConditions: () => get<any[]>('/patients/me/chronic-conditions'),
};

export const notificationsApi = {
  getAll: () => get<any[]>('/notifications'),
  markRead: (id: string) => patch<{ id: string; is_read: boolean }>(`/notifications/${id}/read`),
};

export const aiApi = {
  scanPrescription: (formData: FormData) =>
    post<{
      medicines: { name: string; dosage: string; frequency: string; instructions: string }[];
      explanation: string;
      disclaimer: string;
    }>('/ai/scan-prescription', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }),

  chat: (message: string) =>
    post<{ reply: string }>('/ai/chat', { message }, { timeout: 60000 }),
};
