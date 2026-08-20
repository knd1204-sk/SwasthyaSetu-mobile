import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  authApi,
  patientApi,
  tokenStorage,
  handleApiError,
  User,
  PatientProfile,
  LoginData,
  languageStorage,
} from '../services/api';
import { Language, translations, TranslationKey } from '../constants/translations';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isVerifying: boolean;
  token: string | null;
  user: User | null;
  profile: PatientProfile | null;
  error: string | null;
  isColdStarting: boolean;
}

interface AuthContextType extends AuthState {
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  verifySession: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: TranslationKey) => string;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    isVerifying: false,
    token: null,
    user: null,
    profile: null,
    error: null,
    isColdStarting: false,
  });

  const [language, setLanguageState] = useState<Language>('en');

  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = translations[language] || translations.en;
      return (dict as any)[key] || (translations.en as any)[key] || key;
    },
    [language]
  );

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    try {
      await languageStorage.save(lang);
    } catch (e) {
      console.warn('Failed to save language preference:', e);
    }
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  const setTokenToStorage = useCallback(async (token: string) => {
    try {
      await tokenStorage.save(token);
    } catch (e) {
      console.warn('Failed to save token:', e);
    }
  }, []);

  const clearToken = useCallback(async () => {
    try {
      await tokenStorage.clear();
    } catch (e) {
      console.warn('Failed to clear token:', e);
    }
  }, []);

  const login = useCallback(
    async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setState((s) => ({ ...s, isLoading: true, error: null, isColdStarting: false }));

      try {
        const startTime = Date.now();
        const response = await authApi.login(identifier, password);
        const elapsed = Date.now() - startTime;

        if (elapsed < 500) {
          await new Promise((r) => setTimeout(r, 500 - elapsed));
        }

        const loginData: LoginData = response.data.data as LoginData;

        if (!loginData || !loginData.token) {
          setState((s) => ({ ...s, isLoading: false, error: 'Invalid server response' }));
          return { success: false, error: 'Invalid server response' };
        }

        if (loginData.role !== 'patient' && loginData.user?.role !== 'patient') {
          setState((s) => ({
            ...s,
            isLoading: false,
            error: "This account doesn't have patient access",
          }));
          return { success: false, error: "This account doesn't have patient access" };
        }

        await setTokenToStorage(loginData.token);

        let profile: PatientProfile | null = null;
        if (loginData.profile && (loginData.profile as PatientProfile).health_id) {
          profile = loginData.profile as PatientProfile;
        } else {
          try {
            const profileRes = await patientApi.getMe();
            profile = profileRes.data.data as PatientProfile;
          } catch (e) {
            console.warn('Failed to fetch patient profile:', e);
          }
        }

        setState((s) => ({
          ...s,
          isAuthenticated: true,
          isLoading: false,
          token: loginData.token,
          user: loginData.user,
          profile,
          error: null,
        }));

        return { success: true };
      } catch (error: any) {
        const handled = handleApiError(error);
        const isCold = handled.isColdStart || (!error.response && error.code !== 'ERR_BAD_REQUEST');

        let errorMsg = handled.message;
        if (handled.status === 401) {
          errorMsg = 'Invalid email/phone or password';
        } else if (handled.status === 403) {
          errorMsg = "This account doesn't have patient access";
        } else if (isCold) {
          errorMsg = handled.message;
        }

        setState((s) => ({
          ...s,
          isLoading: false,
          error: errorMsg,
          isColdStarting: isCold && handled.status !== 401,
        }));

        return { success: false, error: errorMsg };
      }
    },
    [setTokenToStorage]
  );

  const logout = useCallback(async () => {
    await clearToken();
    setState({
      isAuthenticated: false,
      isLoading: false,
      isVerifying: false,
      token: null,
      user: null,
      profile: null,
      error: null,
      isColdStarting: false,
    });
  }, [clearToken]);

  const verifySession = useCallback(async (): Promise<boolean> => {
    setState((s) => ({ ...s, isVerifying: true, error: null }));

    try {
      const token = await tokenStorage.get();
      if (!token) {
        setState((s) => ({ ...s, isLoading: false, isVerifying: false, isAuthenticated: false }));
        return false;
      }

      const meRes = await authApi.me();
      const userData = meRes.data.data;

      if (!userData?.user || userData.user.role !== 'patient') {
        await clearToken();
        setState((s) => ({
          ...s,
          isLoading: false,
          isVerifying: false,
          isAuthenticated: false,
        }));
        return false;
      }

      let profile: PatientProfile | null = null;
      try {
        const profileRes = await patientApi.getMe();
        profile = profileRes.data.data as PatientProfile;
      } catch (e) {
        console.warn('Failed to fetch profile during verify:', e);
      }

      setState((s) => ({
        ...s,
        isAuthenticated: true,
        isLoading: false,
        isVerifying: false,
        token,
        user: userData.user,
        profile,
        error: null,
      }));

      return true;
    } catch (error: any) {
      const handled = handleApiError(error);
      if (handled.status === 401 || handled.status === 403) {
        await clearToken();
        setState((s) => ({
          ...s,
          isAuthenticated: false,
          isLoading: false,
          isVerifying: false,
          token: null,
        }));
      } else {
        setState((s) => ({
          ...s,
          isLoading: false,
          isVerifying: false,
          error: handled.message,
        }));
      }
      return false;
    }
  }, [clearToken]);

  const refreshProfile = useCallback(async () => {
    try {
      const profileRes = await patientApi.getMe();
      const profile = profileRes.data.data as PatientProfile;
      setState((s) => ({ ...s, profile }));
    } catch (e) {
      console.warn('Failed to refresh profile:', e);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const savedLang = await languageStorage.get();
        if (savedLang === 'en' || savedLang === 'hi') {
          setLanguageState(savedLang);
        }
      } catch (e) {
        console.warn('Failed to load language preference:', e);
      }
      await verifySession();
    };
    init();
  }, [verifySession]);

  const value = useMemo<AuthContextType>(
    () => ({
      ...state,
      login,
      logout,
      verifySession,
      refreshProfile,
      language,
      setLanguage,
      t,
      clearError,
    }),
    [state, login, logout, verifySession, refreshProfile, language, setLanguage, t, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
