import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const authStorage =
  Platform.OS === 'web'
    ? {
        getItem: async (key: string) =>
          typeof window === 'undefined' ? null : window.localStorage.getItem(key),
        setItem: async (key: string, value: string) => {
          if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
        },
        removeItem: async (key: string) => {
          if (typeof window !== 'undefined') window.localStorage.removeItem(key);
        },
      }
    : AsyncStorage;

export const supabaseConfigurationError =
  'Missing Supabase configuration. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.';

export const supabase =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey, {
        auth: {
          storage: authStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;
