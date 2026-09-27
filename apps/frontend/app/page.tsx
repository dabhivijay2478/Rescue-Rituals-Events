'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { api, Event } from '@/lib/api';
import { AUTH_CHANGE_EVENT, getUser, isLoggedIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function HomePage() {
  const [when, setWhen] = useState<'upcoming' | 'past'>('upcoming');
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    function syncUser() {
      setUserId(isLoggedIn() ? getUser()?.id ?? null : null);
    }
    syncUser();
    window.addEventListener(AUTH_CHANGE_EVENT, syncUser);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, syncUser);
  }, []);

  async function onDeleteEvent(eventId: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setError('');
    try {
      await api.deleteEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  useEffect(() => {
    setError('');
    api
      .listEvents(when)
      .then((res) => setEvents(res.data))
      .catch((e) => setError(e.message));
  }, [when]);

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo: <code className="text-xs">ada@events.dev</code> /{' '}
          <code className="text-xs">password123</code>
        </p>
      </div>

      <Tabs
        value={when}
        onValueChange={(v) => setWhen(v as 'upcoming' | 'past')}
      >
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {events.map((event) => (
          <Card key={event.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-xl">
                  <Link href={`/events/${event.id}`} className="hover:underline">
                    {event.title}
                  </Link>
                </CardTitle>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="secondary">
                    {event.goingCount}
                    {event.capacity != null ? ` / ${event.capacity}` : ''} going
                  </Badge>
                  {userId && event.createdById === userId && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteEvent(event.id, event.title)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {new Date(event.startTime).toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.location}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </CardContent>
          </Card>
        ))}
      </div>

      {!error && events.length === 0 && (
        <p className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          No events found.
        </p>
      )}
    </main>
  );
}
