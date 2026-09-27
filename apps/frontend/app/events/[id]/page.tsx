'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CalendarDays, MapPin } from 'lucide-react';
import { api, Event, Rsvp } from '@/lib/api';
import { getUser, isLoggedIn } from '@/lib/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function statusVariant(status: Rsvp['status']) {
  if (status === 'GOING') return 'success' as const;
  if (status === 'WAITLISTED') return 'warning' as const;
  return 'secondary' as const;
}

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Rsvp[]>([]);
  const [myRsvp, setMyRsvp] = useState<Rsvp | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    setError('');
    try {
      const [ev, att] = await Promise.all([
        api.getEvent(id),
        api.attendees(id),
      ]);
      setEvent(ev);
      setAttendees(att.data);
      const me = getUser();
      if (me) {
        const mine = att.data.find(
          (r) =>
            r.userId === me.id &&
            (r.status === 'GOING' || r.status === 'WAITLISTED'),
        );
        setMyRsvp(mine ?? null);
      } else {
        setMyRsvp(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function onRsvp() {
    if (!isLoggedIn()) {
      window.location.href = '/login';
      return;
    }
    setBusy(true);
    setError('');
    try {
      const rsvp = await api.rsvp(id);
      setMyRsvp(rsvp);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'RSVP failed');
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (
      !window.confirm(
        'Delete this event? This cannot be undone and removes all RSVPs.',
      )
    ) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.deleteEvent(id);
      window.location.href = '/';
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setBusy(false);
    }
  }

  async function onCancel() {
    setBusy(true);
    setError('');
    try {
      await api.cancelRsvp(id);
      setMyRsvp(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cancel failed');
    } finally {
      setBusy(false);
    }
  }

  if (!event) {
    return (
      <main>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <p className="text-muted-foreground">Loading…</p>
        )}
      </main>
    );
  }

  const active =
    myRsvp &&
    (myRsvp.status === 'GOING' || myRsvp.status === 'WAITLISTED');
  const me = getUser();
  const isOwner = Boolean(me && event.createdById === me.id);

  return (
    <main className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <CardTitle className="text-2xl">{event.title}</CardTitle>
            <Badge variant="secondary">
              {event.goingCount}
              {event.capacity != null ? ` / ${event.capacity}` : ''} going
            </Badge>
          </div>
          <CardDescription className="space-y-1">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {new Date(event.startTime).toLocaleString()} –{' '}
              {new Date(event.endTime).toLocaleString()}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.location}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">{event.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            {!active ? (
              <Button onClick={onRsvp} disabled={busy}>RSVP</Button>
            ) : (
              <>
                <Badge variant={statusVariant(myRsvp!.status)}>
                  Your status: {myRsvp?.status}
                </Badge>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={busy}
                >
                  Cancel RSVP
                </Button>
              </>
            )}
            {isOwner && (
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={busy}
              >
                Delete event
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Attendees</h2>
        {attendees.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex items-center justify-between py-4">
              <span className="font-medium">{a.user.name}</span>
              <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
            </CardContent>
          </Card>
        ))}
        {attendees.length === 0 && (
          <p className="text-sm text-muted-foreground">No RSVPs yet.</p>
        )}
      </section>
    </main>
  );
}
