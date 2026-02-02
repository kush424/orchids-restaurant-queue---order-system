import Link from 'next/link';
import { Utensils, QrCode, Clock, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 dark:bg-black font-sans">
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-2xl mx-auto">
        <div className="mb-8 p-4 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
          <Utensils className="w-12 h-12 text-orange-600" />
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
          Welcome to <span className="text-orange-600">QuickBite</span>
        </h1>
        
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-12">
          Scan, Order, and Relax. We'll notify you when your food is ready. No more waiting in long queues!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full">
          <div className="flex flex-col items-center p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <QrCode className="w-6 h-6 text-zinc-500 mb-2" />
            <span className="text-sm font-medium">Scan QR</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <Utensils className="w-6 h-6 text-zinc-500 mb-2" />
            <span className="text-sm font-medium">Order Food</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <Clock className="w-6 h-6 text-zinc-500 mb-2" />
            <span className="text-sm font-medium">Get Token</span>
          </div>
        </div>

        <Link
          href="/menu"
          className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-600/20"
        >
          View Menu & Order
        </Link>
        
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          No registration required
        </p>
      </main>
      
      <footer className="py-8 text-zinc-400 text-sm flex flex-col items-center gap-4">
        <p>Powered by Bheed Control Logic</p>
        <Link 
          href="/admin/dashboard" 
          className="text-zinc-500 hover:text-orange-500 transition-colors text-xs font-medium uppercase tracking-wider"
        >
          Staff Dashboard
        </Link>
      </footer>
    </div>
  );
}
