import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { useSound } from '../theme/SoundContext';
import { AppShell } from '../components/layout/AppShell';
import { Profile, MediaSignature, Tag, StreakInfo } from '../types';
import { AvatarCard3D } from '../components/3d/AvatarCard3D';
import {
  GraphicsQuality,
  getStoredQuality,
  getStoredSimpleMode,
} from '../theme/QualitySystem';
import {
  Save,
  KeyRound,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Sun,
  Moon,
  Laptop,
  UploadCloud,
  Tag as TagIcon,
  Edit2,
  X,
  Volume2,
  VolumeX,
  Sliders,
} from 'lucide-react';

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Australia/Sydney',
];

export const ProfilePage: React.FC = () => {
  const { profile, refreshProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { soundEnabled, setSoundEnabled, playClick } = useSound();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [location, setLocation] = useState('');

  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQuality>(() => getStoredQuality());
  const [simpleMode, setSimpleMode] = useState<boolean>(() => getStoredSimpleMode());

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [tags, setTags] = useState<Tag[]>([]);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editTagName, setEditTagName] = useState('');
  const [editTagColor, setEditTagColor] = useState('#8B5CF6');
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const fetchTags = async () => {
    try {
      const res = await api.get<Tag[]>('/tags');
      setTags(res.data);
    } catch (err) {
      console.error('Failed to fetch tags', err);
    }
  };

  const fetchStreak = async () => {
    try {
      const res = await api.get<StreakInfo>('/streaks');
      setStreakInfo(res.data);
    } catch (err) {
      console.error('Failed to fetch streak info', err);
    }
  };

  useEffect(() => {
    refreshProfile();
    fetchTags();
    fetchStreak();
  }, []);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatarUrl || '');
      setTimezone(profile.timezone || 'UTC');
      setDateOfBirth(profile.dateOfBirth || '');
      setLocation(profile.location || '');
    }
  }, [profile]);

  const handleQualityChange = (q: GraphicsQuality) => {
    setGraphicsQuality(q);
    localStorage.setItem('daybook_graphics_quality', q);
    playClick();
    toast.success(`Graphics quality set to ${q.toUpperCase()}`);
    window.location.reload();
  };

  const handleSimpleModeToggle = () => {
    const next = !simpleMode;
    setSimpleMode(next);
    localStorage.setItem('daybook_simple_mode', String(next));
    playClick();
    toast.success(next ? 'Simple mode enabled' : '3D mode enabled');
    window.location.reload();
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAvatarUploading(true);
    try {
      const sigRes = await api.get<MediaSignature>('/media/signature?type=image');
      const sigData = sigRes.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp.toString());
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`;
      const uploadRes = await axios.post(cloudinaryUrl, formData);
      const newAvatarUrl = uploadRes.data.secure_url;

      setAvatarUrl(newAvatarUrl);

      await api.put('/profile', {
        displayName,
        bio,
        avatarUrl: newAvatarUrl,
        timezone,
        dateOfBirth: dateOfBirth || null,
        location,
      });

      await refreshProfile();
      toast.success('Avatar image updated!');
    } catch (err) {
      console.error('Avatar upload failed', err);
      toast.error('Failed to upload avatar image');
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await api.put<Profile>('/profile', {
        displayName,
        bio,
        avatarUrl,
        timezone,
        dateOfBirth: dateOfBirth || null,
        location,
      });
      setDisplayName(res.data.displayName || '');
      setBio(res.data.bio || '');
      setAvatarUrl(res.data.avatarUrl || '');
      setTimezone(res.data.timezone || 'UTC');
      setDateOfBirth(res.data.dateOfBirth || '');
      setLocation(res.data.location || '');

      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (err: any) {
      console.error('Failed to update profile', err);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please enter current and new password');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Password update failed');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      await api.delete('/account');
      await logout();
      navigate('/register');
    } catch (err) {
      console.error('Failed to delete account', err);
      toast.error('Failed to delete account');
    }
  };

  return (
    <AppShell>
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 3D Interactive Profile Avatar Card */}
        <div className="relative cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarSelect}
            accept="image/*"
            className="hidden"
          />
          <AvatarCard3D
            displayName={displayName || profile?.displayName || undefined}
            email={profile?.email || undefined}
            avatarUrl={avatarUrl || profile?.avatarUrl || undefined}
            streakCount={streakInfo?.currentStreak || 0}
            totalEntries={streakInfo?.totalEntries || 0}
          />
        </div>

        {/* Personal Details Form */}
        <div className="glass-panel p-6 sm:p-8 space-y-6 border border-border rounded-panel">
          <h2 className="font-display text-lg font-bold text-text border-b border-border/60 pb-3">
            Personal Details
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1.5 font-mono">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-4 py-2.5 rounded-btn bg-surface-2/70 border border-border text-text placeholder-muted text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1.5 font-mono">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-btn bg-surface-2/70 border border-border text-text text-sm focus:outline-none focus:border-accent font-mono"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1.5 font-mono">
                Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A short reflection about yourself..."
                className="w-full px-4 py-2.5 rounded-btn bg-surface-2/70 border border-border text-text placeholder-muted text-sm focus:outline-none focus:border-accent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1.5 font-mono">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full px-4 py-2.5 rounded-btn bg-surface-2/70 border border-border text-text placeholder-muted text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1.5 font-mono">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-btn bg-surface-2/70 border border-border text-text text-sm focus:outline-none focus:border-accent font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 rounded-btn bg-accent text-accent-fg font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </form>
        </div>

        {/* Graphics & Sound Settings */}
        <div className="glass-panel p-6 sm:p-8 space-y-6 border border-border rounded-panel">
          <h2 className="font-display text-lg font-bold text-text border-b border-border/60 pb-3 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-accent" />
            <span>Appearance & 3D Graphics Settings</span>
          </h2>

          <div className="space-y-4">
            {/* Theme Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-2 font-mono">Theme Mode</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setTheme('light');
                  }}
                  className={`p-3.5 rounded-btn border text-center space-y-1.5 transition-all ${
                    theme === 'light' ? 'bg-accent/15 border-accent text-accent shadow-sm' : 'bg-surface-2/60 border-border text-muted hover:text-text'
                  }`}
                >
                  <Sun className="w-5 h-5 mx-auto text-gold" />
                  <p className="text-xs font-bold">Light (Paper)</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setTheme('dark');
                  }}
                  className={`p-3.5 rounded-btn border text-center space-y-1.5 transition-all ${
                    theme === 'dark' ? 'bg-accent/15 border-accent text-accent shadow-sm' : 'bg-surface-2/60 border-border text-muted hover:text-text'
                  }`}
                >
                  <Moon className="w-5 h-5 mx-auto text-accent" />
                  <p className="text-xs font-bold">Dark (Ink)</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setTheme('system');
                  }}
                  className={`p-3.5 rounded-btn border text-center space-y-1.5 transition-all ${
                    theme === 'system' ? 'bg-accent/15 border-accent text-accent shadow-sm' : 'bg-surface-2/60 border-border text-muted hover:text-text'
                  }`}
                >
                  <Laptop className="w-5 h-5 mx-auto text-sage" />
                  <p className="text-xs font-bold">System</p>
                </button>
              </div>
            </div>

            {/* Graphics Quality Tier */}
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-2 font-mono">3D Graphics Quality Tier</label>
              <div className="grid grid-cols-4 gap-2">
                {(['high', 'medium', 'low', 'off'] as GraphicsQuality[]).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleQualityChange(q)}
                    className={`py-2 px-3 rounded-btn border text-xs font-bold capitalize transition-all ${
                      graphicsQuality === q
                        ? 'bg-accent text-accent-fg border-accent shadow-sm'
                        : 'bg-surface-2/60 border-border text-muted hover:text-text'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSimpleModeToggle}
                  className={`px-4 py-2 rounded-btn font-bold text-xs border transition-all ${
                    simpleMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-surface-2/60 text-muted border-border'
                  }`}
                >
                  {simpleMode ? 'Simple Mode (ON)' : 'Simple Mode (OFF)'}
                </button>
                <span className="text-xs text-muted">Disable WebGL 3D context & use CSS fallback</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSoundEnabled(!soundEnabled);
                    playClick();
                  }}
                  className={`p-2.5 rounded-btn border transition-all ${
                    soundEnabled ? 'bg-sage/20 text-sage border-sage/40' : 'bg-surface-2/60 text-muted border-border'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <span className="text-xs text-muted">UI Sound FX ({soundEnabled ? 'Enabled' : 'Muted'})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Danger Zone */}
        <div className="glass-panel p-6 sm:p-8 space-y-4 border border-border rounded-panel">
          <h2 className="font-display text-lg font-bold text-text border-b border-border/60 pb-3 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-accent" />
            <span>Change Password</span>
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1.5 font-mono">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-btn bg-surface-2/70 border border-border text-text text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1.5 font-mono">New Password (min. 8 chars)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-btn bg-surface-2/70 border border-border text-text text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-btn bg-surface-2 hover:bg-surface border border-border text-text font-semibold text-sm transition-all"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="glass-panel p-6 sm:p-8 border-rose-500/30 space-y-4 bg-rose-500/[0.02] rounded-panel">
          <h2 className="font-display text-lg font-bold text-rose-500 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span>Danger Zone</span>
          </h2>
          <p className="text-xs text-muted">
            Deleting your account will permanently wipe all your diary entries, streak history, and uploaded media attachments.
          </p>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-5 py-2.5 rounded-btn bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Daybook Account</span>
          </button>
        </div>
      </main>
    </AppShell>
  );
};
