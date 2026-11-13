import React, { useState, useEffect } from 'react';
import { Room } from 'livekit-client';
import { Badge } from '@/components/Badge';

/**
 * Simple LiveKit room component.
 * Connects to a LiveKit room using a token fetched from the server.
 * Shows a badge and connection status. Video rendering to be added later.
 */
export default function LiveKitRoom({
  roomName,
  identity,
  role,
}: {
  roomName: string;
  identity: string;
  role: 'host' | 'viewer';
}) {
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setStatus('connecting');
      try {
        const res = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room: roomName, identity, role }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch token');
        }
        const { token } = await res.json();
        const lkRoom = new Room({
          adaptiveStream: true,
        });
        await lkRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL || '', token);
        if (role === 'host') {
          // Enable mic & camera for host if supported
          await lkRoom.localParticipant.enableCameraAndMicrophone();
        }
        if (!cancelled) {
          setRoom(lkRoom);
          setStatus('connected');
        }
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        if (!cancelled) {
          setError(errMsg);
          setStatus('disconnected');
        }
      }
    }
    init();
    return () => {
      cancelled = true;
      room?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName, identity, role]);

  if (error) {
    return <div className="text-red-500">LiveKit error: {error}</div>;
  }

  return (
    <div className="border rounded p-2">
      <Badge variant="success">LIVEKIT LIVE</Badge>
      <p>Connection status: {status}</p>
      {/* Placeholder for video participants – to be built later */}
    </div>
  );
}
