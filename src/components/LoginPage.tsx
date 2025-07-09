import React, { useState } from 'react';
import { LogIn, Users, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '../pages/Index';
import './AdminViewAnimations.css';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });
    if (error) {
      toast.error('Login failed: ' + error.message);
      setIsLoading(false);
      return;
    }
    const { user } = data;
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, username, role')
      .eq('auth_user_id', user.id)
      .single();
    if (profileError || !profile) {
      toast.error('User profile not found.');
      setIsLoading(false);
      return;
    }
    onLogin({
      username: profile.username,
      role: profile.role,
      id: profile.id,
    });
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpLoading(true);
    setSignUpSuccess(false);
    // 1. Register with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: signUpEmail,
      password: signUpPassword,
    });
    if (error) {
      toast.error('Sign up failed: ' + error.message);
      setSignUpLoading(false);
      return;
    }
    const { user } = data;
    if (!user) {
      toast.error('Sign up failed: No user returned.');
      setSignUpLoading(false);
      return;
    }
    // 2. Insert into public.users
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        username: signUpUsername,
        password_hash: 'supabase_auth', // Not used, but required by schema
        role: 'waiter', // Default role
        auth_user_id: user.id,
      });
    if (insertError) {
      toast.error('Profile creation failed: ' + insertError.message);
      setSignUpLoading(false);
      return;
    }
    setSignUpSuccess(true);
    toast.success('Registration successful! You can now log in.');
    setSignUpLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--gradient-order)' }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-white/5 animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-3/4 h-3/4 rounded-full bg-white/3 animate-pulse delay-1000"></div>
      </div>
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md bg-white/10 border border-white/20 animate-float">
          <LogIn className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Restaurant Management</h1>
        <p className="text-white/80 text-lg">Welcome back! Please sign in to continue.</p>
      </div>
      <div className="w-full max-w-md z-10">
        {!showSignUp ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              type="email"
              placeholder="Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 text-lg bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/30"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 text-lg bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/30"
              required
            />
            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white transition-all duration-300 hover:scale-105 animate-pulse-on-hover"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-white/80 underline hover:text-white"
                onClick={() => setShowSignUp(true)}
              >
                Don't have an account? Sign up
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-6">
            <Input
              type="text"
              placeholder="Username"
              value={signUpUsername}
              onChange={(e) => setSignUpUsername(e.target.value)}
              className="h-12 text-lg bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/30"
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              className="h-12 text-lg bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/30"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              className="h-12 text-lg bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/30"
              required
            />
            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white transition-all duration-300 hover:scale-105 animate-pulse-on-hover"
              disabled={signUpLoading}
            >
              {signUpLoading ? 'Signing up...' : 'Sign Up'}
            </Button>
            {signUpSuccess && (
              <div className="text-green-300 text-center">Registration successful! You can now log in.</div>
            )}
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-white/80 underline hover:text-white"
                onClick={() => setShowSignUp(false)}
              >
                Already have an account? Log in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;