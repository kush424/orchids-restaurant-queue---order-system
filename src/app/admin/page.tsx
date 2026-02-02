'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Loader2, ChefHat } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem('admin_authenticated');
    if (isAdmin === 'true') {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('shop_settings')
        .select('value')
        .eq('key', 'admin_pin')
        .single();

      if (error) throw error;

      if (data.value === pin) {
        localStorage.setItem('admin_authenticated', 'true');
        toast.success('Welcome back, Staff!');
        router.push('/admin/dashboard');
      } else {
        toast.error('Invalid Staff PIN');
      }
    } catch (err) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-600/10 rounded-2xl flex items-center justify-center mb-4">
            <ChefHat className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Staff Login</h1>
          <p className="text-zinc-500 text-sm mt-2 text-center">
            Enter the 4-digit staff PIN to access the kitchen dashboard and reports
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <div className="relative">
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-12 text-center text-2xl font-black tracking-[1em] text-white focus:border-orange-500 outline-none transition-all placeholder:tracking-normal placeholder:text-sm placeholder:font-medium"
                required
                autoFocus
              />
              <Lock className="w-5 h-5 text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || pin.length < 4}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Access Dashboard'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-600">
          Authorized personnel only. For safety, do not share this PIN.
        </p>
      </div>
    </div>
  );
}
