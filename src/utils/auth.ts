export interface StoredUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'university_admin' | 'verifier';
  university_id?: number | null;
  university?: { id: number; name: string; location: string } | null;
}

/** Reads the cached user, tolerating a corrupted localStorage value. */
export const getStoredUser = (): StoredUser | null => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

export const getToken = () => localStorage.getItem('auth_token');

export const isAuthenticated = (): boolean => !!getToken() && !!getStoredUser();

/** Where a given role belongs after signing in. */
export const homeRouteForRole = (role?: string) => {
  if (role === 'super_admin') return '/superadmin/admin';
  if (role === 'verifier') return '/verifier/dashboard';
  return '/user/admin';
};

export const clearSession = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};
