'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { LogOut, ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

export default function Header() {
  const router = useRouter();
  const [userInitial, setUserInitial] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserInitial(user.email.charAt(0).toUpperCase());
      }
    };
    fetchUser();
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <header className="bg-primary text-primary-foreground border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div>
            <Link href="/" className="text-3xl font-extrabold">
              Empathos
            </Link>
            <p className="text-sm text-muted">Elevate your Research</p>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center ring-2 ring-orange-400">
                <span className="font-bold text-primary">{userInitial}</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-primary-foreground transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 origin-top-right bg-card rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-background">
                    <LogOut className="mr-3 h-5 w-5 text-muted" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}