'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  cpf?: string;
  photo?: string;
  role?: 'admin' | 'user';
  nameChangesCount: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, cpf: string) => Promise<void>;
  updateProfile: (data: { name?: string, photo?: File | string | null, cpf?: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    console.log('[Auth] AuthContext mounted');

    // Safety timeout: if loading takes more than 3 seconds, force it to false
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn('[Auth] Safety timeout reached - forcing isLoading to false');
        setIsLoading(false);
      }
    }, 3000);

    const checkInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[Auth] Error getting initial session:', error);
          // If the error is about refresh token, we should probably sign out to clear local state
          if (error.message.includes('Refresh Token') || error.message.includes('not found')) {
            console.warn('[Auth] Invalid refresh token detected, signing out...');
            await supabase.auth.signOut();
          }
        }
        if (mounted) {
          handleSession(session);
        }
      } catch (err) {
        console.error('[Auth] Exception checking initial session:', err);
        if (mounted) setIsLoading(false);
      }
    };

    const fetchProfile = async (userId: string) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('[Auth] Error fetching profile:', error);
        }
        return profile;
      } catch (err) {
        console.error('[Auth] Exception fetching profile:', err);
        return null;
      }
    };

    const handleSession = async (session: any) => {
      if (!mounted) return;
      
      if (session?.user) {
        // If user changed, clear study-related localStorage to prevent leaking
        const lastUser = localStorage.getItem('last_user_id');
        if (lastUser && lastUser !== session.user.id) {
          console.log('[Auth] User changed, clearing local study data');
          const keysToClear = [
            'stopwatchActive', 'stopwatchTime', 'stopwatchAccumulated', 
            'activeSubject', 'dailySubjectsData', 'subjects'
          ];
          keysToClear.forEach(k => localStorage.removeItem(k));
        }
        localStorage.setItem('last_user_id', session.user.id);

        const adminEmails = [
          'victorpedrorb6@gmail.com', 
          'pedroxygaming@gmail.com', 
          'pedrohribeiro35@gmail.com' // Incluído para que você, como desenvolvedor/admin atual, tenha acesso total
        ];
        const isHardcodedAdmin = adminEmails.includes(session.user.email?.toLowerCase() || '');
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || 'Soldado',
          photo: session.user.user_metadata?.avatar_url,
          role: isHardcodedAdmin ? 'admin' : 'user',
          nameChangesCount: 0
        });
        setIsAdmin(isHardcodedAdmin);
        
        // We have a user, we can stop the main loading spinner
        setIsLoading(false);

      // Fetch full profile in background
      let profile = await fetchProfile(session.user.id);
      
      // If profile doesn't exist, create it (e.g. for social login)
      if (mounted && !profile) {
        console.log('[Auth] Profile missing, creating default for:', session.user.id);
        const newProfile = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || 'Soldado',
          photo_url: session.user.user_metadata?.avatar_url,
          subjects: ['Português', 'Matemática', 'História', 'Geografia', 'Física'],
          active_subject: 'Português'
        };
        const { data, error } = await supabase
          .from('profiles')
          .upsert(newProfile, { onConflict: 'id' })
          .select()
          .single();
        
        if (!error) profile = data;
      }

      if (mounted && profile) {
        const isUserAdmin = adminEmails.includes(session.user.email?.toLowerCase() || '') || profile.role === 'admin';
        
        // Sync email if missing or different
        if (session.user.email && profile.email !== session.user.email) {
          supabase.from('profiles').update({ email: session.user.email }).eq('id', session.user.id).then(() => {
            console.log('[Auth] Email synced to DB for:', session.user.email);
          });
        }

        // If hardcoded admin but not in DB, update DB in background
        if (adminEmails.includes(session.user.email?.toLowerCase() || '') && profile.role !== 'admin') {
          supabase.from('profiles').update({ role: 'admin' }).eq('id', session.user.id).then(() => {
            console.log('[Auth] Admin role synced to DB for:', session.user.email);
          });
        }

        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: profile.name || session.user.user_metadata?.name || 'Soldado',
          cpf: profile.cpf,
          photo: profile.photo_url,
          role: isUserAdmin ? 'admin' : 'user',
          activeSubject: profile.active_subject,
          nameChangesCount: profile.name_changes_count || 0
        } as any);
        setIsAdmin(isUserAdmin);
      }
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    };

    // Use onAuthStateChange for both initial session and updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      console.log('[Auth] Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        handleSession(session);
      }
    });

    checkInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, cpf: string) => {
    setIsLoading(true);
    try {
      // Check if name already exists
      const { data: existingName, error: nameError } = await supabase
        .from('profiles')
        .select('name')
        .ilike('name', name)
        .maybeSingle();
      
      if (nameError) {
        console.error('Error checking name uniqueness:', nameError);
      }

      if (existingName) {
        throw new Error('Este nome já está em uso. Por favor, escolha outro.');
      }

      // Check if CPF already exists
      const { data: existingCpf, error: cpfError } = await supabase
        .from('profiles')
        .select('cpf')
        .eq('cpf', cpf)
        .maybeSingle();
      
      if (cpfError) {
        console.error('Error checking CPF uniqueness:', cpfError);
      }

      if (existingCpf) {
        throw new Error('Este CPF já está cadastrado.');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, cpf }
        }
      });
      
      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([{ id: data.user.id, name, email, cpf }], { onConflict: 'id' });
        
        if (profileError) console.error('Error creating profile:', profileError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: { name?: string, photo?: File | string | null, cpf?: string }) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const updateData: any = {};
      
      // 1. Handle Name Change
      if (data.name && data.name !== user.name) {
        // Check if user has already changed name once
        if (user.nameChangesCount >= 1) {
          throw new Error('O Nome de Guerra só pode ser alterado uma única vez.');
        }

        // Check for uniqueness
        const { data: existingName, error: nameError } = await supabase
          .from('profiles')
          .select('name')
          .ilike('name', data.name)
          .maybeSingle();
        
        if (nameError) console.error('Error checking name uniqueness:', nameError);

        if (existingName) {
          throw new Error('Este Nome de Guerra já está em uso por outro soldado.');
        }

        updateData.name = data.name;
        updateData.name_changes_count = (user.nameChangesCount || 0) + 1;
      }

      // 2. Handle Photo Change
      if (data.photo !== undefined) {
        if (data.photo === null) {
          // Delete photo
          updateData.photo_url = null;
        } else if (data.photo instanceof File) {
          // Upload to Supabase Storage
          const fileExt = data.photo.name.split('.').pop();
          const fileName = `${user.id}-${Math.random()}.${fileExt}`;
          const filePath = `avatars/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('profiles') // Assuming bucket name is 'profiles'
            .upload(filePath, data.photo);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('profiles')
            .getPublicUrl(filePath);

          updateData.photo_url = publicUrl;
        } else if (typeof data.photo === 'string') {
          // Handle legacy base64 or direct URL
          updateData.photo_url = data.photo;
        }
      }

      // 3. Handle CPF Change (only if missing)
      if (data.cpf && data.cpf !== user.cpf) {
        if (user.cpf) {
          throw new Error('O CPF não pode ser alterado após o cadastro.');
        }
        
        // Check for uniqueness
        const { data: existingCpf, error: cpfError } = await supabase
          .from('profiles')
          .select('cpf')
          .eq('cpf', data.cpf)
          .maybeSingle();
        
        if (cpfError) console.error('Error checking CPF uniqueness:', cpfError);

        if (existingCpf) {
          throw new Error('Este CPF já está cadastrado por outro soldado.');
        }

        updateData.cpf = data.cpf;
      }

      if (Object.keys(updateData).length === 0) return;

      console.log('[Auth] Updating profile for user:', user.id, updateData);

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Este Nome de Guerra ou CPF já está em uso.');
        }
        console.error('[Auth] Error updating profile:', error);
        throw error;
      }

      console.log('[Auth] Profile updated successfully in DB');

      setUser(prev => prev ? { 
        ...prev, 
        name: updateData.name !== undefined ? updateData.name : prev.name,
        photo: updateData.photo_url !== undefined ? updateData.photo_url : prev.photo,
        cpf: updateData.cpf !== undefined ? updateData.cpf : prev.cpf,
        nameChangesCount: updateData.name_changes_count !== undefined ? updateData.name_changes_count : prev.nameChangesCount
      } : null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('[Auth] Logging out');
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, logout, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
