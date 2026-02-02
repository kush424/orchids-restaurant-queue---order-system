'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import { CheckCircle, Clock, Utensils, Play, Trash2, Loader2, QrCode, RefreshCw, BarChart3, ListChecks, LogOut, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');
  const [view, setView] = useState<'orders' | 'reports'>('orders');
  const [verificationPin, setVerificationPin] = useState('');
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [reportRange, setReportRange] = useState<'day' | 'week' | 'month'>('day');
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem('admin_authenticated');
    if (isAdmin !== 'true') {
      router.push('/admin');
      return;
    }

    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error('Failed to load orders');
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    }

    async function fetchSettings() {
      const { data, error } = await supabase
        .from('shop_settings')
        .select('value')
        .eq('key', 'verification_pin')
        .single();
      
      if (data) setVerificationPin(data.value);
    }

    fetchOrders();
    fetchSettings();

    // Real-time updates for new orders
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders((prev) => [payload.new as Order, ...prev]);
            toast.info('New order received!');
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? (payload.new as Order) : o))
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const updateStatus = async (id: string, status: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Update failed');
    } else {
      toast.success(`Order ${status}`);
    }
  };

  const generateNewPin = async () => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    const { error } = await supabase
      .from('shop_settings')
      .update({ value: newPin })
      .eq('key', 'verification_pin');

    if (error) {
      toast.error('Failed to update PIN');
    } else {
      setVerificationPin(newPin);
      toast.success('New PIN generated');
      setIsEditingPin(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    router.push('/admin');
  };

  const updateVerificationPin = async () => {
    const { error } = await supabase
      .from('shop_settings')
      .update({ value: verificationPin })
      .eq('key', 'verification_pin');

    if (error) {
      toast.error('Failed to update PIN');
    } else {
      toast.success('Verification PIN updated');
      setIsEditingPin(false);
    }
  };

  const filteredOrders = orders.filter((o) => 
    (filter === 'all' && o.status !== 'served' && o.status !== 'cancelled') || 
    o.status === filter
  );

  const getReportData = () => {
    const now = new Date();
    let startDate = new Date();

    if (reportRange === 'day') {
      startDate.setHours(0, 0, 0, 0);
    } else if (reportRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (reportRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    }

    const filtered = orders.filter((o) => {
      const orderDate = new Date(o.created_at);
      return orderDate >= startDate && o.status === 'served';
    });

    const totalSales = filtered.reduce((acc, o) => acc + Number(o.total_price), 0);
    const totalOrders = filtered.length;
    
    return { totalSales, totalOrders, orders: filtered };
  };

  const reportStats = getReportData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-6 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kitchen Dashboard</h1>
            <p className="text-zinc-500 text-sm">Real-time order management & sales analytics</p>
          </div>
          
          <div className="h-10 w-px bg-zinc-800 hidden md:block" />

          <nav className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setView('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'orders' ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ListChecks className="w-4 h-4" /> Orders
            </button>
            <button
              onClick={() => setView('reports')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'reports' ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Reports
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/admin/qr"
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            <QrCode className="w-4 h-4 text-orange-500" />
            QR
          </Link>
          <button 
            onClick={handleLogout}
            className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {view === 'orders' ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 overflow-x-auto max-w-full">
              {(['all', 'pending', 'preparing', 'ready'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${
                    filter === f ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 shadow-xl">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Verification PIN</span>
                {isEditingPin ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={verificationPin}
                      onChange={(e) => setVerificationPin(e.target.value)}
                      className="bg-zinc-800 text-white text-sm px-2 py-1 rounded border border-orange-500 outline-none w-20"
                      autoFocus
                    />
                    <button 
                      onClick={updateVerificationPin}
                      className="text-[10px] bg-orange-600 text-white px-2 py-1 rounded font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-2xl font-black text-white tracking-[0.2em]">{verificationPin || '----'}</span>
                    <button 
                      onClick={generateNewPin}
                      className="flex items-center gap-1.5 text-[10px] text-orange-500 hover:text-orange-400 font-black uppercase transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Refresh
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-zinc-900 border-2 rounded-[2.5rem] overflow-hidden transition-all shadow-2xl ${
                  order.status === 'ready' ? 'border-green-500/30' : 
                  order.status === 'preparing' ? 'border-orange-500/30' : 
                  'border-zinc-800'
                }`}
              >
                <div className="p-6 bg-zinc-800/30 flex justify-between items-center border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-600 flex items-center justify-center rounded-2xl shadow-lg shadow-orange-600/20">
                        <span className="text-xl font-black text-white">#{order.token_number}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white truncate max-w-[120px]">{order.customer_name}</span>
                        <span className="text-[10px] font-black text-orange-500/80 uppercase">Active Token</span>
                      </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Ordered at</span>
                    <span className="text-xs font-medium text-zinc-400">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4 min-h-[160px]">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-zinc-800/20 p-3 rounded-2xl border border-zinc-800/50">
                      <span className="text-sm font-medium text-zinc-300">
                        {item.name}
                      </span>
                      <span className="bg-orange-600/10 text-orange-500 text-xs font-black px-2.5 py-1 rounded-lg border border-orange-500/20">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-zinc-950/50 flex flex-col gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(order.id, 'preparing')}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20"
                    >
                      <Play className="w-4 h-4 fill-current" /> Start Cooking
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateStatus(order.id, 'ready')}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-green-600/20"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateStatus(order.id, 'served')}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                    >
                      <Utensils className="w-4 h-4" /> Mark Served
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(order.id, 'cancelled')}
                    className="w-full py-3 text-[10px] font-black text-zinc-600 hover:text-red-500 uppercase tracking-widest transition-all"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-zinc-800">
              <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                <Utensils className="w-12 h-12 opacity-20" />
              </div>
              <p className="text-xl font-black uppercase tracking-widest">No orders found</p>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 w-fit">
            {(['day', 'week', 'month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setReportRange(r)}
                className={`px-8 py-2.5 rounded-lg text-sm font-black uppercase tracking-widest transition-all ${
                  reportRange === r ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {r === 'day' ? 'Today' : r}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-24 h-24 text-orange-500" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Sales</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">₹{reportStats.totalSales.toFixed(2)}</span>
                  <DollarSign className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-xs text-zinc-600 mt-4">Calculated from served orders</p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-24 h-24 text-green-500" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Orders Served</span>
                <span className="text-4xl font-black text-white">{reportStats.totalOrders}</span>
                <p className="text-xs text-zinc-600 mt-4">Successful transactions</p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-24 h-24 text-blue-500" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Average Order</span>
                <span className="text-4xl font-black text-white">
                  ₹{reportStats.totalOrders > 0 ? (reportStats.totalSales / reportStats.totalOrders).toFixed(2) : '0.00'}
                </span>
                <p className="text-xs text-zinc-600 mt-4">Per transaction value</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">Transaction History</h3>
              <span className="text-xs font-black text-orange-500 bg-orange-500/10 px-4 py-1.5 rounded-full border border-orange-500/20 uppercase tracking-widest">
                Latest 50 Orders
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-950/50">
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Token</th>
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Customer</th>
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Items</th>
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Amount</th>
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {reportStats.orders.slice(0, 50).map((o) => (
                    <tr key={o.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-8 py-4 font-black text-orange-500">#{o.token_number}</td>
                      <td className="px-8 py-4 text-sm font-medium text-zinc-300">{o.customer_name}</td>
                      <td className="px-8 py-4 text-sm text-zinc-500">{o.items.length} items</td>
                      <td className="px-8 py-4 text-sm font-black text-white text-right">₹{Number(o.total_price).toFixed(2)}</td>
                      <td className="px-8 py-4 text-[10px] font-bold text-zinc-600 text-right uppercase">
                        {new Date(o.created_at).toLocaleDateString()} {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                  {reportStats.orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-zinc-600 uppercase font-black tracking-widest">
                        No transactions found for this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
