'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/CartContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ShoppingBag, CreditCard, Loader2, Phone } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [correctPin, setCorrectPin] = useState('');
  const [userPin, setUserPin] = useState('');
  const router = useRouter();
  
    useEffect(() => {
      async function fetchPin() {
        const { data } = await supabase
          .from('shop_settings')
          .select('value')
          .eq('key', 'verification_pin')
          .single();
        
        if (data) setCorrectPin(data.value);
      }
      fetchPin();
    }, []);
  
    const handlePlaceOrder = async () => {
      if (cart.length === 0) return;
      if (userPin !== correctPin) {
        toast.error('Invalid Verification Code. Please ask at the counter.');
        return;
      }
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert({
            items: cart,
            total_price: totalPrice,
            customer_name: customerName || 'Guest',
            customer_phone: phone,
            status: 'pending',
            verification_code: correctPin
          })
          .select()
          .single();

      if (error) throw error;

      toast.success('Order placed successfully!');
      clearCart();
      router.push(`/order-status/${data.id}`);
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-black">
        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full mb-4">
          <ShoppingBag className="w-8 h-8 text-zinc-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-zinc-500 mb-6">Add some delicious items from the menu to get started.</p>
        <Link
          href="/menu"
          className="px-8 py-3 bg-orange-600 text-white rounded-full font-semibold"
        >
          Go to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans pb-40">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center gap-4">
        <Link href="/menu" className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Checkout</h1>
      </header>

      <main className="px-6 py-8 max-w-2xl mx-auto space-y-8">
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-zinc-900 dark:text-white">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
            Order Summary
          </h2>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            {cart.map((item) => (
              <div key={item.id} className="p-4 flex justify-between border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-zinc-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between items-center">
              <span className="font-bold text-lg">Total Amount</span>
              <span className="font-bold text-2xl text-orange-600">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Customer Details</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1.5">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1.5">Phone Number</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  placeholder="Enter 10 digit number"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

              <div className="p-6 bg-orange-50 dark:bg-orange-900/10 border-2 border-dashed border-orange-200 dark:border-orange-800 rounded-2xl space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Verification Required</p>
                  <div className="text-xl font-bold text-zinc-900 dark:text-white">Ask at Counter for Code</div>
                  <p className="text-xs text-zinc-500">Enter the secret code provided by the shop staff</p>
                </div>

                <input
                  type="text"
                  maxLength={4}
                  placeholder="----"
                  className="w-full px-4 py-4 bg-white dark:bg-zinc-900 border-2 border-orange-500 rounded-xl focus:ring-4 focus:ring-orange-500/20 outline-none text-center text-3xl tracking-[1em] font-black"
                  value={userPin}
                  onChange={(e) => setUserPin(e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </section>


        <section>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl flex gap-3 text-sm">
            <CreditCard className="w-5 h-5 flex-shrink-0" />
            <p>Payment will be collected at the counter when you pick up your order.</p>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 z-20">
        <button
          onClick={handlePlaceOrder}
          disabled={loading || userPin.length < 4}
          className="w-full max-w-2xl mx-auto flex items-center justify-center gap-2 py-4 bg-orange-600 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-2xl shadow-xl shadow-orange-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            'Place Order & Confirm Code'
          )}
        </button>
      </div>
    </div>
  );
}
