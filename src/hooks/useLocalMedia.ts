'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface LocalMediaState {
  mediaStream: MediaStream | null;
  screenStream: MediaStream | null;
  isCameraOn: boolean;
  isMicOn: boolean;
  isScreenSharing: boolean;
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  selectedAudioDeviceId: string;
  selectedVideoDeviceId: string;
  permissionError: string | null;
  hardwareError: string | null;
  audioLevel: number;
}

export function useLocalMedia() {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<string>('');
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<string>('');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [hardwareError, setHardwareError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // References to keep tracks accessible across renders
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Enumerate connected input devices safely
  const refreshDevices = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const aInputs = devices.filter((d) => d.kind === 'audioinput');
      const vInputs = devices.filter((d) => d.kind === 'videoinput');

      setAudioDevices(aInputs);
      setVideoDevices(vInputs);

      if (aInputs.length > 0 && !selectedAudioDeviceId) {
        setSelectedAudioDeviceId(aInputs[0].deviceId);
      }
      if (vInputs.length > 0 && !selectedVideoDeviceId) {
        setSelectedVideoDeviceId(vInputs[0].deviceId);
      }
    } catch {
      // Device enumeration not permitted or failed
    }
  }, [selectedAudioDeviceId, selectedVideoDeviceId]);

  // Audio level monitoring using Web Audio API when mic is active
  const startAudioMonitoring = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        setAudioLevel(25);
        return;
      }

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        setAudioLevel(25);
        return;
      }

      const ctx = new AudioCtx();
      ctx.resume().catch(() => {});
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      setAudioLevel(35);

      const checkLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.max(20, Math.min(100, Math.round((avg / 128) * 100)));
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(checkLevel);
      };

      checkLevel();
    } catch {
      // Audio level monitoring fallback
      setAudioLevel(25);
    }
  }, []);

  const stopAudioMonitoring = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  // Cleanup all media resources safely
  const cleanupMedia = useCallback(() => {
    stopAudioMonitoring();

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Track already stopped
        }
      });
      mediaStreamRef.current = null;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Track already stopped
        }
      });
      screenStreamRef.current = null;
    }

    setMediaStream(null);
    setScreenStream(null);
    setIsCameraOn(false);
    setIsMicOn(false);
    setIsScreenSharing(false);
  }, [stopAudioMonitoring]);

  // Toggle local camera
  const toggleCamera = useCallback(async (): Promise<boolean> => {
    setPermissionError(null);
    setHardwareError(null);

    // If camera is currently on, shut down the video track
    if (isCameraOn) {
      if (mediaStreamRef.current) {
        const videoTracks = mediaStreamRef.current.getVideoTracks();
        videoTracks.forEach((t) => t.stop());
        const remainingAudioTracks = mediaStreamRef.current.getAudioTracks();

        if (remainingAudioTracks.length === 0) {
          mediaStreamRef.current = null;
          setMediaStream(null);
        } else {
          // Keep stream with audio only
          const newStream = new MediaStream(remainingAudioTracks);
          mediaStreamRef.current = newStream;
          setMediaStream(newStream);
        }
      }
      setIsCameraOn(false);
      return false;
    }

    // Camera is currently off, request permission and stream
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setHardwareError('Browser does not support media device capture.');
      return false;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: selectedVideoDeviceId ? { deviceId: selectedVideoDeviceId } : true,
      };

      const newVideoStream = await navigator.mediaDevices.getUserMedia(constraints);
      const newVideoTrack = newVideoStream.getVideoTracks()[0];

      let updatedStream: MediaStream;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.addTrack(newVideoTrack);
        updatedStream = new MediaStream(mediaStreamRef.current.getTracks());
      } else {
        updatedStream = new MediaStream([newVideoTrack]);
      }

      mediaStreamRef.current = updatedStream;
      setMediaStream(updatedStream);
      setIsCameraOn(true);

      // Refresh devices with newly granted permission
      refreshDevices();
      return true;
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionError('Camera access was denied. Please allow camera permissions in your browser settings.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setHardwareError('No camera device detected on this system.');
      } else {
        setHardwareError(`Camera error: ${error.message || 'Unable to access video device.'}`);
      }
      setIsCameraOn(false);
      return false;
    }
  }, [isCameraOn, selectedVideoDeviceId, refreshDevices]);

  // Toggle local microphone
  const toggleMic = useCallback(async (): Promise<boolean> => {
    setPermissionError(null);
    setHardwareError(null);

    // If mic is currently on, shut down audio track
    if (isMicOn) {
      stopAudioMonitoring();
      if (mediaStreamRef.current) {
        const audioTracks = mediaStreamRef.current.getAudioTracks();
        audioTracks.forEach((t) => t.stop());
        const remainingVideoTracks = mediaStreamRef.current.getVideoTracks();

        if (remainingVideoTracks.length === 0) {
          mediaStreamRef.current = null;
          setMediaStream(null);
        } else {
          const newStream = new MediaStream(remainingVideoTracks);
          mediaStreamRef.current = newStream;
          setMediaStream(newStream);
        }
      }
      setIsMicOn(false);
      return false;
    }

    // Mic is off, request audio permission
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setHardwareError('Browser does not support media device capture.');
      return false;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedAudioDeviceId ? { deviceId: selectedAudioDeviceId } : true,
      };

      const newAudioStream = await navigator.mediaDevices.getUserMedia(constraints);
      const newAudioTrack = newAudioStream.getAudioTracks()[0];

      let updatedStream: MediaStream;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.addTrack(newAudioTrack);
        updatedStream = new MediaStream(mediaStreamRef.current.getTracks());
      } else {
        updatedStream = new MediaStream([newAudioTrack]);
      }

      mediaStreamRef.current = updatedStream;
      setMediaStream(updatedStream);
      setIsMicOn(true);
      startAudioMonitoring(updatedStream);

      refreshDevices();
      return true;
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionError('Microphone access was denied. Please allow microphone permissions in your browser.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setHardwareError('No microphone detected on this system.');
      } else {
        setHardwareError(`Microphone error: ${error.message || 'Unable to access audio device.'}`);
      }
      setIsMicOn(false);
      return false;
    }
  }, [isMicOn, selectedAudioDeviceId, refreshDevices, startAudioMonitoring, stopAudioMonitoring]);

  // Screen sharing control
  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {
          // Already stopped
        }
      });
      screenStreamRef.current = null;
    }
    setScreenStream(null);
    setIsScreenSharing(false);
  }, []);

  const startScreenShare = useCallback(async (): Promise<boolean> => {
    setPermissionError(null);
    setHardwareError(null);

    if (isScreenSharing) {
      stopScreenShare();
      return false;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      setHardwareError('Screen sharing is not supported by this browser.');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          stopScreenShare();
        };
      }

      screenStreamRef.current = stream;
      setScreenStream(stream);
      setIsScreenSharing(true);
      return true;
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'NotAllowedError') {
        // User cancelled the prompt or permission denied
        setPermissionError('Screen sharing was cancelled or not permitted.');
      } else {
        setHardwareError(`Screen share error: ${error.message || 'Unable to share screen.'}`);
      }
      setIsScreenSharing(false);
      return false;
    }
  }, [isScreenSharing, stopScreenShare]);

  // Change input devices
  const switchVideoDevice = useCallback(
    async (deviceId: string) => {
      setSelectedVideoDeviceId(deviceId);
      if (isCameraOn && mediaStreamRef.current) {
        // Restart video track with new device
        const oldTracks = mediaStreamRef.current.getVideoTracks();
        oldTracks.forEach((t) => t.stop());

        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } },
          });
          const newTrack = newStream.getVideoTracks()[0];

          const audioTracks = mediaStreamRef.current.getAudioTracks();
          const combined = new MediaStream([...audioTracks, newTrack]);
          mediaStreamRef.current = combined;
          setMediaStream(combined);
        } catch (err: unknown) {
          const error = err as Error;
          setHardwareError(`Failed to switch camera: ${error.message}`);
        }
      }
    },
    [isCameraOn]
  );

  const switchAudioDevice = useCallback(
    async (deviceId: string) => {
      setSelectedAudioDeviceId(deviceId);
      if (isMicOn && mediaStreamRef.current) {
        const oldTracks = mediaStreamRef.current.getAudioTracks();
        oldTracks.forEach((t) => t.stop());
        stopAudioMonitoring();

        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: { exact: deviceId } },
          });
          const newTrack = newStream.getAudioTracks()[0];

          const videoTracks = mediaStreamRef.current.getVideoTracks();
          const combined = new MediaStream([...videoTracks, newTrack]);
          mediaStreamRef.current = combined;
          setMediaStream(combined);
          startAudioMonitoring(combined);
        } catch (err: unknown) {
          const error = err as Error;
          setHardwareError(`Failed to switch microphone: ${error.message}`);
        }
      }
    },
    [isMicOn, startAudioMonitoring, stopAudioMonitoring]
  );

  // Mandatory resource cleanup when component unmounts
  useEffect(() => {
    let mounted = true;
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          if (!mounted) return;
          const aInputs = devices.filter((d) => d.kind === 'audioinput');
          const vInputs = devices.filter((d) => d.kind === 'videoinput');
          setAudioDevices(aInputs);
          setVideoDevices(vInputs);
        })
        .catch(() => {});
    }

    return () => {
      mounted = false;
      cleanupMedia();
    };
  }, [cleanupMedia]);

  return {
    mediaStream,
    screenStream,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    audioDevices,
    videoDevices,
    selectedAudioDeviceId,
    selectedVideoDeviceId,
    permissionError,
    hardwareError,
    audioLevel,
    toggleCamera,
    toggleMic,
    startScreenShare,
    stopScreenShare,
    switchVideoDevice,
    switchAudioDevice,
    cleanupMedia,
    refreshDevices,
  };
}
