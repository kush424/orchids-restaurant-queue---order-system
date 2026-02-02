'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import { useParams } from 'next/navigation';
import { Clock, CheckCircle2, Utensils, Loader2, Home } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrderStatusPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        setOrder(data);
      }
      setLoading(false);
    }

    fetchOrder();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`order-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setOrder(payload.new as Order);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-black">
        <h2 className="text-xl font-bold mb-4">Order not found</h2>
        <Link href="/" className="text-orange-600 font-semibold">Go Back Home</Link>
      </div>
    );
  }

  const steps = [
    { status: 'pending', label: 'Order Placed', icon: Clock },
    { status: 'preparing', label: 'Preparing', icon: Utensils },
    { status: 'ready', label: 'Ready for Pickup', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.status);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans p-6 flex flex-col items-center">
      <div className="w-full max-w-md space-y-8 mt-12">
        <div className="text-center space-y-2">
          <p className="text-zinc-500 uppercase tracking-widest text-xs font-bold">Your Token Number</p>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl font-black text-orange-600"
          >
            #{order.token_number}
          </motion.div>
            <h1 className="text-2xl font-bold">Thank you, {order.customer_name}!</h1>
          </div>

          {order.verification_code && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center space-y-2">
              <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Security Verification PIN</p>
              <div className="text-4xl font-black text-white tracking-[0.2em]">{order.verification_code}</div>
              <p className="text-xs text-zinc-400">Show this PIN at the counter to verify your order</p>
            </div>
          )}

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800">
          <div className="relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStepIndex || order.status === 'served';
              const isCurrent = index === currentStepIndex && order.status !== 'served';
              
              return (
                <div key={step.status} className="flex gap-4 mb-8 last:mb-0 relative">
                  {index < steps.length - 1 && (
                    <div className={`absolute left-4 top-8 w-0.5 h-8 ${isCompleted ? 'bg-orange-500' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                  )}
                  <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted ? 'bg-orange-500 text-white' : 
                    isCurrent ? 'bg-orange-100 dark:bg-orange-950 text-orange-600 animate-pulse' : 
                    'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`font-bold ${isCurrent ? 'text-orange-600' : isCompleted ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-orange-500/80 mt-0.5">We're working on it!</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-orange-600 text-white rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-orange-600/20">
          <div>
            <p className="text-xs opacity-80 font-bold uppercase tracking-tight">Status</p>
            <p className="text-xl font-bold capitalize">{order.status === 'ready' ? 'Food is Ready!' : order.status}</p>
          </div>
          <AnimatePresence mode="wait">
            {order.status === 'ready' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-4 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors font-medium"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
