export interface StoredUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'university_admin' | 'verifier';
  university_id?: number | null;
  university?: { id: number; name: string; location: string } | null;
}

/**
 * Sessions live in localStorage when "Remember me" is ticked and in
 * sessionStorage otherwise, so an unticked sign-in ends when the browser
 * closes — which matters on the shared machines these portals run on.
 */
const stores = () => [localStorage, sessionStorage];

const readKey = (key: string): string | null => {
  for (const store of stores()) {
    try {
      const value = store.getItem(key);
      if (value) return value;
    } catch {
      /* storage can throw in private mode */
    }
  }
  return null;
};

/** Reads the cached user, tolerating a corrupted stored value. */
export const getStoredUser = (): StoredUser | null => {
  try {
    return JSON.parse(readKey('user') || 'null');
  } catch {
    return null;
  }
};

export const getToken = () => readKey('auth_token');

export const setSession = (token: string, user: unknown, remember: boolean) => {
  clearSession();
  const store = remember ? localStorage : sessionStorage;
  try {
    store.setItem('auth_token', token);
    store.setItem('user', JSON.stringify(user));
  } catch {
    /* ignore quota/private-mode failures */
  }
};

export const isAuthenticated = (): boolean => !!getToken() && !!getStoredUser();

/** Where a given role belongs after signing in. */
export const homeRouteForRole = (role?: string) => {
  if (role === 'super_admin') return '/superadmin/admin';
  if (role === 'verifier') return '/verifier/dashboard';
  return '/user/admin';
};

/**
 * Updates the cached user in whichever store currently holds the session,
 * so a "Remember me = off" session isn't silently promoted to a permanent one.
 */
export const persistUser = (user: unknown) => {
  const store = localStorage.getItem('auth_token') ? localStorage : sessionStorage;
  try {
    store.setItem('user', JSON.stringify(user));
  } catch {
    /* ignore */
  }
};

export const clearSession = () => {
  for (const store of stores()) {
    try {
      store.removeItem('auth_token');
      store.removeItem('user');
    } catch {
      /* ignore */
    }
  }
};
