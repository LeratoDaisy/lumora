import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { AppState } from 'react-native';

import { supabase, supabaseConfigurationError } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<{ session: Session | null; user: User | null }>;
  signIn: (email: string, password: string) => Promise<{ session: Session; user: User }>;
  sendPasswordReset: (email: string, redirectTo: string) => Promise<void>;
  restorePasswordRecovery: (url: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function friendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Incorrect email or password.';
  }
  if (normalized.includes('already registered') || normalized.includes('already exists')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (normalized.includes('email not confirmed')) {
    return 'Please confirm your email before signing in. Check your inbox for the confirmation link.';
  }
  if (
    normalized.includes('otp_expired') ||
    normalized.includes('invalid token') ||
    normalized.includes('expired')
  ) {
    return 'This password reset link is invalid or has expired. Request a new one and try again.';
  }
  if (
    normalized.includes('network') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('fetch failed')
  ) {
    return 'Unable to reach the sign-in service. Check your internet connection and try again.';
  }
  if (message) return message;
  return 'Authentication could not be completed. Please try again.';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [error, setError] = useState<string | null>(
    supabase ? null : supabaseConfigurationError,
  );

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let active = true;
    let receivedAuthEvent = false;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      receivedAuthEvent = true;
      if (active) {
        setSession(nextSession);
        setIsLoading(false);
      }
    });
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void client.auth.startAutoRefresh();
      } else {
        void client.auth.stopAutoRefresh();
      }
    });
    if (AppState.currentState === 'active') {
      void client.auth.startAutoRefresh();
    } else {
      void client.auth.stopAutoRefresh();
    }

    void client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) {
        setError(friendlyAuthError(sessionError));
      } else if (!receivedAuthEvent) {
        setSession(data.session);
      }
      setIsLoading(false);
    }).catch((sessionError: unknown) => {
      if (active) {
        setError(friendlyAuthError(sessionError));
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
      appStateSubscription.remove();
      void client.auth.stopAutoRefresh();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setError(null);
    if (!supabase) {
      setError(supabaseConfigurationError);
      throw new Error(supabaseConfigurationError);
    }
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;
      if (!data.session && data.user?.identities?.length === 0) {
        throw new Error('An account with this email already exists. Try signing in instead.');
      }
      return { session: data.session, user: data.user };
    } catch (signUpError) {
      const message = friendlyAuthError(signUpError);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    if (!supabase) {
      setError(supabaseConfigurationError);
      throw new Error(supabaseConfigurationError);
    }
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      if (!data.session || !data.user) {
        throw new Error('Sign-in completed without an active session. Please try again.');
      }
      return { session: data.session, user: data.user };
    } catch (signInError) {
      const message = friendlyAuthError(signInError);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    if (!supabase) {
      setError(supabaseConfigurationError);
      throw new Error(supabaseConfigurationError);
    }
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
    } catch (signOutError) {
      const message = friendlyAuthError(signOutError);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const sendPasswordReset = useCallback(async (email: string, redirectTo: string) => {
    setError(null);
    if (!supabase) {
      setError(supabaseConfigurationError);
      throw new Error(supabaseConfigurationError);
    }
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (resetError) throw resetError;
    } catch (resetFailure) {
      const message = friendlyAuthError(resetFailure);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const restorePasswordRecovery = useCallback(async (url: string) => {
    setError(null);
    if (!supabase) {
      setError(supabaseConfigurationError);
      throw new Error(supabaseConfigurationError);
    }
    try {
      const callbackUrl = new URL(url);
      const hashParams = new URLSearchParams(callbackUrl.hash.replace(/^#/, ''));
      const getParam = (name: string) =>
        callbackUrl.searchParams.get(name) ?? hashParams.get(name);
      const callbackError = getParam('error_description') ?? getParam('error');
      if (callbackError) throw new Error(callbackError.replace(/\+/g, ' '));

      const code = getParam('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;
        return;
      }

      const accessToken = getParam('access_token');
      const refreshToken = getParam('refresh_token');
      if (!accessToken || !refreshToken) {
        throw new Error('This password reset link is incomplete. Request a new one and try again.');
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (sessionError) throw sessionError;
    } catch (recoveryFailure) {
      const message = friendlyAuthError(recoveryFailure);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    setError(null);
    if (!supabase) {
      setError(supabaseConfigurationError);
      throw new Error(supabaseConfigurationError);
    }
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
    } catch (updateFailure) {
      const message = friendlyAuthError(updateFailure);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      error,
      signUp,
      signIn,
      sendPasswordReset,
      restorePasswordRecovery,
      updatePassword,
      signOut,
    }),
    [
      session,
      isLoading,
      error,
      signUp,
      signIn,
      sendPasswordReset,
      restorePasswordRecovery,
      updatePassword,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider.');
  return context;
}
