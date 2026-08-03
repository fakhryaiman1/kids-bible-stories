import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  favorites: string[];
  refreshProfile: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
  toggleFavorite: (storyId: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isAdmin: false,
  loading: true,
  favorites: [],
  refreshProfile: async () => {},
  refreshFavorites: async () => {},
  toggleFavorite: async () => false,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Check admin_roles table as fallback/override
      const { data: adminRoleData } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      let currentRole: 'admin' | 'editor' | 'user' = 'user';

      if (adminRoleData && (adminRoleData.role === 'admin' || adminRoleData.role === 'editor')) {
        currentRole = adminRoleData.role as any;
      } else if (data?.role) {
        currentRole = data.role as any;
      }

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist yet, insert profile
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'مستخدم',
            email: user?.email,
            stars: 0,
            completed_stories: 0,
            reading_streak: 1,
            role: currentRole,
          })
          .select()
          .single();

        if (newProfile) {
          setProfile(newProfile as Profile);
          setIsAdmin(newProfile.role === 'admin' || newProfile.role === 'editor');
        }
      } else if (data) {
        const fullProfile = { ...data, role: currentRole } as Profile;
        setProfile(fullProfile);
        setIsAdmin(currentRole === 'admin' || currentRole === 'editor');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchFavorites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('story_id')
        .eq('user_id', userId);

      if (!error && data) {
        setFavorites(data.map((item) => item.story_id));
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchFavorites(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchFavorites(session.user.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setFavorites([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const refreshFavorites = async () => {
    if (user) await fetchFavorites(user.id);
  };

  const toggleFavorite = async (storyId: string): Promise<boolean> => {
    if (!user) return false;
    const isFav = favorites.includes(storyId);
    if (isFav) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('story_id', storyId);

      if (!error) {
        setFavorites((prev) => prev.filter((id) => id !== storyId));
        return true;
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, story_id: storyId });

      if (!error) {
        setFavorites((prev) => [...prev, storyId]);
        return true;
      }
    }
    return false;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    setFavorites([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin,
        loading,
        favorites,
        refreshProfile,
        refreshFavorites,
        toggleFavorite,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
