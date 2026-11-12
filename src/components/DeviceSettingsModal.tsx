'use client';

import React from 'react';
import { Camera, Mic, X, Volume2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { useLanguage } from '@/context/LanguageContext';

interface DeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  selectedAudioDeviceId: string;
  selectedVideoDeviceId: string;
  onSelectAudioDevice: (id: string) => void;
  onSelectVideoDevice: (id: string) => void;
  audioLevel: number;
  permissionError: string | null;
  hardwareError: string | null;
}

export function DeviceSettingsModal({
  isOpen,
  onClose,
  audioDevices,
  videoDevices,
  selectedAudioDeviceId,
  selectedVideoDeviceId,
  onSelectAudioDevice,
  onSelectVideoDevice,
  audioLevel,
  permissionError,
  hardwareError,
}: DeviceSettingsModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
      data-testid="device-settings-modal"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight" data-testid="device-modal-title">
                {t.deviceSettingsTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {t.deviceSettingsSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            data-testid="btn-close-device-settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission or Hardware Alert */}
        {(permissionError || hardwareError) && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5" data-testid="device-error-banner">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block text-rose-200">Hardware Access Notice</span>
              <span>{permissionError || hardwareError}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Camera Selection */}
          <div className="space-y-1.5">
            <label
              htmlFor="camera-select"
              className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.selectCamera}</span>
            </label>
            <select
              id="camera-select"
              value={selectedVideoDeviceId}
              onChange={(e) => onSelectVideoDevice(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              data-testid="select-camera-device"
            >
              {videoDevices.length === 0 ? (
                <option value="">Default Web Camera (System Default)</option>
              ) : (
                videoDevices.map((d, idx) => (
                  <option key={d.deviceId || idx} value={d.deviceId}>
                    {d.label || `Camera ${idx + 1}`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Microphone Selection */}
          <div className="space-y-1.5">
            <label
              htmlFor="mic-select"
              className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
            >
              <Mic className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.selectMicrophone}</span>
            </label>
            <select
              id="mic-select"
              value={selectedAudioDeviceId}
              onChange={(e) => onSelectAudioDevice(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              data-testid="select-mic-device"
            >
              {audioDevices.length === 0 ? (
                <option value="">Default Microphone (System Default)</option>
              ) : (
                audioDevices.map((d, idx) => (
                  <option key={d.deviceId || idx} value={d.deviceId}>
                    {d.label || `Microphone ${idx + 1}`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Audio Input Level Meter */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                Mic Input Level
              </span>
              <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                {audioLevel}%
              </Badge>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-emerald-500 via-teal-400 to-indigo-500 transition-all duration-75"
                style={{ width: `${Math.min(100, Math.max(5, audioLevel))}%` }}
                data-testid="audio-level-bar"
              />
            </div>
          </div>
        </div>

        {/* Footer info & Done button */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Local Browser Media API</span>
          </div>
          <Button variant="primary" size="sm" onClick={onClose} data-testid="btn-save-device-settings">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
