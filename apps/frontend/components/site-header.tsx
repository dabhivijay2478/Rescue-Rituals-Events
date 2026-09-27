'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AUTH_CHANGE_EVENT,
  clearToken,
  getUser,
  isLoggedIn,
} from '@/lib/auth';

export function SiteHeader() {
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    function sync() {
      setLoggedIn(isLoggedIn());
      setUserName(getUser()?.name ?? null);
    }
    sync();
    setMounted(true);
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  function onLogout() {
    clearToken();
    window.location.href = '/';
  }

  return (
    <header className="mb-8 flex flex-wrap items-center gap-3 border-b pb-4">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        Rescue Rituals
      </Link>
      <nav className="flex flex-1 flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">Browse</Link>
        </Button>
        {mounted && loggedIn && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/events/new">Create</Link>
          </Button>
        )}
      </nav>
      <div className="flex items-center gap-2">
        {!mounted ? (
          <span className="h-8 w-24" aria-hidden />
        ) : loggedIn ? (
          <>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {userName ? `Hi, ${userName}` : 'Signed in'}
            </span>
            <Button variant="outline" size="sm" type="button" onClick={onLogout}>
              Log out
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Register</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
