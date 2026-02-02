'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MenuItem } from '@/types';
import { useCart } from '@/lib/CartContext';
import { ShoppingCart, Plus, Minus, Search, ChevronRight, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { cart, addToCart, updateQuantity, totalPrice, totalItems } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    async function fetchMenu() {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true);
      
      if (error) {
        toast.error('Failed to load menu');
        console.error(error);
      } else {
        setItems(data || []);
      }
      setLoading(false);
    }
    fetchMenu();
  }, []);

  const categories = ['All', ...Array.from(new Set(items.map((item) => item.category)))];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCartItemQuantity = (id: string) => {
    return cart.find((i) => i.id === id)?.quantity || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6 animate-pulse">
        <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-8" />
        <div className="h-12 w-full bg-zinc-200 dark:bg-zinc-800 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans pb-32">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Menu</h1>
            <Link 
              href="/admin/dashboard" 
              className="p-1.5 text-zinc-400 hover:text-orange-500 transition-colors rounded-lg"
              title="Admin Dashboard"
            >
              <LayoutDashboard className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search dishes..."
              className="pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-none rounded-full text-sm w-48 focus:ring-2 focus:ring-orange-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 py-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => {
            const qty = getCartItemQuantity(item.id);
            return (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 group transition-all"
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{item.name}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">{item.description}</p>
                    <p className="mt-1 font-bold text-orange-600">${item.price}</p>
                  </div>
                  
                  <div className="flex justify-end">
                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(item)}
                        className="p-1.5 bg-orange-50 text-orange-600 dark:bg-orange-950/30 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, qty - 1)}
                          className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold min-w-[20px] text-center">{qty}</span>
                        <button
                          onClick={() => updateQuantity(item.id, qty + 1)}
                          className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {totalItems > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 animate-in slide-in-from-bottom-8 duration-300">
          <Link
            href="/checkout"
            className="flex items-center justify-between w-full p-4 bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-600/30 font-semibold"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 px-2 py-0.5 rounded text-sm">
                {totalItems} items
              </div>
              <span>View Cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span>${totalPrice.toFixed(2)}</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
