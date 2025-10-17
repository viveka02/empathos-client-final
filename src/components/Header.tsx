'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { LogOut, ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="bg-primary text-primary-foreground">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div>
            <Link href="/" className="text-3xl font-extrabold">
              Empathos
            </Link>
            <p className="text-sm text-muted">Elevate your Research</p>
          </div>

          {user ? (
            // Show User Menu if logged in
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center ring-2 ring-orange-400">
                  <span className="font-bold text-primary">{user.email?.charAt(0).toUpperCase()}</span>
                </div>
                <ChevronDown className="w-5 h-5" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right bg-card rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-foreground hover:bg-background">Dashboard</Link>
                    <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-background">
                      <LogOut className="mr-3 h-5 w-5 text-muted" /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Show Login Button if logged out
            <Link href="/auth">
              <Button variant="secondary">Login</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}