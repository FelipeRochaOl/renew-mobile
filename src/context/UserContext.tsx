import { User } from '@/services/api/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

const USER_KEY = 'app_user_v1';
const TOKEN_KEY = 'app_token_v1';

interface UserContextValue {
  user: User | null;
  setUser: (u: User) => void;
  authToken?: string;
  login: (token: string, user?: User) => Promise<void>;
  logout: () => Promise<void>;
  hydrated: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from storage
  useEffect(() => {
    (async () => {
      try {
        const [userJson, token] = await Promise.all([
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(TOKEN_KEY),
        ]);
        if (token) setAuthToken(token);
        if (userJson) {
          try {
            setUserState(JSON.parse(userJson));
          } catch {
            setUserState(null);
          }
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const persist = useCallback(async (nextUser: User | null, nextToken?: string) => {
    try {
      if (nextUser) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      } else {
        await AsyncStorage.removeItem(USER_KEY);
      }
      if (nextToken) {
        await AsyncStorage.setItem(TOKEN_KEY, nextToken);
      } else if (nextToken === undefined) {
        // do nothing
      } else {
        await AsyncStorage.removeItem(TOKEN_KEY);
      }
    } catch { }
  }, []);

  const setUser = useCallback((u: User) => {
    setUserState(u);
    persist(u); // persist user only (token unchanged)
  }, [persist]);

  const login = useCallback(async (token: string, u?: User) => {
    setAuthToken(token);
    if (u) setUserState(u);
    await persist(u || user, token);
  }, [persist, user]);

  const logout = useCallback(async () => {
    setAuthToken(undefined);
    setUserState(null);
    await persist(null, '');
    await AsyncStorage.removeItem(TOKEN_KEY);
  }, [persist]);

  return (
    <UserContext.Provider value={{ user, setUser, authToken, login, logout, hydrated }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
