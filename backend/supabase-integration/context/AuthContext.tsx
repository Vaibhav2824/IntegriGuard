import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase-types';

type UserDetails = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: Omit<UserDetails, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Session check:', session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      console.log('Fetching user details for:', user.id);
      // Fetch user details from the users table
      supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching user details:', error);
          }
          if (data) {
            console.log('User details found:', data);
            setUserDetails(data);
          } else {
            console.log('No user details found, creating...');
            // If no user details exist, create them
            supabase
              .from('users')
              .insert([
                {
                  id: user.id,
                  email: user.email!,
                  full_name: user.user_metadata.full_name || '',
                  role: 'student', // default role
                }
              ])
              .then(({ error: insertError, data: insertData }) => {
                if (insertError) {
                  console.error('Error creating user details:', insertError);
                } else {
                  console.log('User details created:', insertData);
                  setUserDetails(insertData?.[0] as UserDetails);
                }
              });
          }
        });
    } else {
      setUserDetails(null);
    }
  }, [user]);

  const signUp = async (
    email: string,
    password: string,
    userData: Omit<UserDetails, 'id' | 'created_at' | 'updated_at'>
  ) => {
    console.log('Starting signup process for:', email);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          role: userData.role,
        }
      }
    });

    if (authError) {
      console.error('Signup auth error:', authError);
      throw authError;
    }

    if (authData.user) {
      console.log('Auth successful, creating user profile:', authData.user);
      const { error: profileError } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          email,
          ...userData,
        },
      ]);

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Try to delete the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }
      
      console.log('User profile created successfully');
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    console.log('Sign in successful:', data);
  };

  const signOut = async () => {
    console.log('Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    console.log('Sign out successful');
  };

  const resetPassword = async (email: string) => {
    console.log('Requesting password reset for:', email);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      console.error('Password reset error:', error);
      throw error;
    }
    console.log('Password reset email sent');
  };

  const value = {
    user,
    userDetails,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 