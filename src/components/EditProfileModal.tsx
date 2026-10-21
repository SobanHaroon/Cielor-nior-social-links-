import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  RotateCcw,
  Check,
  Sparkles,
  Lock,
  Unlock,
  Upload,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
} from 'lucide-react';
import { BrandProfile, SocialPlatformId } from '../types.ts';
import { DEFAULT_BRAND_PROFILE } from '../data/defaultProfile.ts';

const REQUIRED_ADMIN_PASSWORD = 'CN4536';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: BrandProfile;
  onSave: (updated: BrandProfile) => void;
  onReset: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSave,
  onReset,
}) => {
  const [formData, setFormData] = useState<BrandProfile>(currentProfile);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [syncCopied, setSyncCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopySyncLink = () => {
    try {
      const b64 = btoa(encodeURIComponent(JSON.stringify(formData)));
      const syncUrl = `https://cielornior.vercel.app/?cfg=${b64}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(syncUrl);
      } else {
        const input = document.createElement('textarea');
        input.value = syncUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setSyncCopied(true);
      setTimeout(() => setSyncCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy cross-device sync URL', err);
    }
  };

  const handleModalClose = () => {
    setIsUnlocked(false);
    setPasswordInput('');
    setPasswordError('');
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setFormData(currentProfile);
      setIsUnlocked(false);
      setPasswordError('');
      setPasswordInput('');
    } else {
      setIsUnlocked(false);
      setPasswordInput('');
      setPasswordError('');
    }
  }, [isOpen, currentProfile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleModalClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === REQUIRED_ADMIN_PASSWORD) {
      setIsUnlocked(true);
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('Invalid password. Access restricted.');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPasswordInput('');
    setPasswordError('');
  };

  const handleLinkChange = (id: SocialPlatformId, field: 'handleOrInfo' | 'url', value: string) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.map((link) => (link.id === id ? { ...link, [field]: value } : link)),
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Supported formats: JPG, PNG, WEBP, SVG, GIF, etc.
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WEBP, SVG).');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result as string;
        // If SVG or very small, keep raw data URL
        if (file.type === 'image/svg+xml' || file.size < 60000) {
          setFormData((prev) => ({ ...prev, logoUrl: rawDataUrl }));
          setIsUploading(false);
          return;
        }

        // Scale down to max 400x400 to preserve localStorage capacity
        const img = new Image();
        img.onload = () => {
          const maxDim = 400;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const optimized = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/webp', 0.88);
            setFormData((prev) => ({ ...prev, logoUrl: optimized }));
          } else {
            setFormData((prev) => ({ ...prev, logoUrl: rawDataUrl }));
          }
          setIsUploading(false);
        };
        img.onerror = () => {
          setFormData((prev) => ({ ...prev, logoUrl: rawDataUrl }));
          setIsUploading(false);
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error processing logo image', err);
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    handleModalClose();
  };

  const handlePresetSelect = (presetName: string, monogram: string, tagline: string) => {
    setFormData((prev) => ({
      ...prev,
      name: presetName,
      monogram,
      tagline,
    }));
  };

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleModalClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg border ${
                  isUnlocked
                    ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </div>
              <div>
                <h2
                  id="edit-profile-title"
                  className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2"
                >
                  <span>Brand Settings</span>
                  {!isUnlocked && (
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-500">
                      Locked
                    </span>
                  )}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {isUnlocked
                    ? 'Authenticated as brand administrator'
                    : 'Authentication required to modify brand details'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isUnlocked && (
                <button
                  type="button"
                  onClick={handleLock}
                  title="Lock editor"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs flex items-center gap-1 font-medium"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lock</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleModalClose}
                aria-label="Close editor"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* SCREEN 1: LOCKED PASSWORD CHALLENGE */}
          {!isUnlocked ? (
            <div className="py-8 px-2 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300 mb-4">
                <Lock className="w-6 h-6" />
              </div>

              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Administrator Password Required
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs leading-relaxed">
                Please enter the security password to unlock the brand parameters, monogram, and links editor.
              </p>

              <form onSubmit={handleUnlockSubmit} className="w-full max-w-xs mt-6 space-y-3">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Enter security key"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-center tracking-wider font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {passwordError && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-rose-500 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors shadow-xs active:scale-98"
                >
                  Unlock Brand Editor
                </button>
              </form>
            </div>
          ) : (
            /* SCREEN 2: UNLOCKED EDITING FORM */
            <>
              {/* Quick presets */}
              <div className="py-3 shrink-0 flex items-center gap-2 overflow-x-auto text-xs border-b border-neutral-100 dark:border-neutral-800/60">
                <span className="text-neutral-400 flex items-center gap-1 shrink-0 font-medium text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-500" /> Presets:
                </span>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('AURA STUDIO', 'AS', 'Contemporary Spatial & Object Design')}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shrink-0"
                >
                  Aura Studio
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('LUMEN & CO.', 'LC', 'Minimalist Lighting & Industrial Artifacts')}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shrink-0"
                >
                  Lumen & Co.
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('ATELIER NOIR', 'AN', 'Bespoke Haute Couture & Tailoring')}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shrink-0"
                >
                  Atelier Noir
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 py-4 space-y-4 flex-1">
                {/* Brand Core Identity */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 tracking-wide uppercase">
                    Brand Identity & Logo
                  </h3>

                  {/* LOGO & MONOGRAM SECTION */}
                  <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/50 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block">
                          Brand Visual Mark (Logo or Monogram)
                        </span>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                          Upload a logo file (JPG, PNG, WEBP, SVG) or specify monogram text. When a logo is present, it replaces the text on the page.
                        </p>
                      </div>

                      {formData.logoUrl ? (
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                          Logo Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded">
                          Monogram Active
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Logo Upload Box */}
                      <div className="flex items-center gap-3 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                        {formData.logoUrl ? (
                          <div className="relative w-12 h-12 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 flex items-center justify-center">
                            <img
                              src={formData.logoUrl}
                              alt="Brand Logo Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-400 shrink-0">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif"
                            onChange={handleLogoUpload}
                            className="hidden"
                            id="logo-upload-input"
                          />

                          <div className="flex flex-col gap-1">
                            <label
                              htmlFor="logo-upload-input"
                              className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors w-fit"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploading ? 'Uploading...' : formData.logoUrl ? 'Replace Logo' : 'Upload Logo'}</span>
                            </label>

                            {formData.logoUrl && (
                              <button
                                type="button"
                                onClick={handleRemoveLogo}
                                className="text-[11px] text-rose-500 hover:text-rose-600 flex items-center gap-1 font-medium transition-colors w-fit"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove Logo</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Monogram Text Input */}
                      <div className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between">
                        <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                          Monogram Initials (Fallback)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={formData.monogram}
                            onChange={(e) => setFormData({ ...formData, monogram: e.target.value.toUpperCase() })}
                            className="w-full px-2.5 py-1.5 text-xs text-center font-bold tracking-widest rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                            placeholder="AS"
                          />
                          <div className="w-8 h-8 rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center text-xs font-bold shrink-0">
                            {formData.monogram || 'AS'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Brand Name (H1) */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Brand Name (H1 Wordmark)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                      placeholder="e.g. AURA STUDIO"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Tagline / Bio
                    </label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                      placeholder="e.g. Minimalist Architecture & Curated Objects"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Location / Details
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                      placeholder="e.g. SoHo, New York · Est. 2024"
                    />
                  </div>
                </div>

                {/* Platform Links */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 tracking-wide uppercase">
                    Platform Links & Handles
                  </h3>

                  {formData.links.map((link) => (
                    <div
                      key={link.id}
                      className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200">
                          {link.title}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-400">
                          {link.id}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="block text-[11px] text-neutral-500 mb-0.5">Handle / Display Text</span>
                          <input
                            type="text"
                            value={link.handleOrInfo}
                            onChange={(e) => handleLinkChange(link.id, 'handleOrInfo', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none"
                          />
                        </div>
                        <div>
                          <span className="block text-[11px] text-neutral-500 mb-0.5">Target Destination URL</span>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cross-Device Permanent Sync Card */}
                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-950/60 flex items-center justify-between gap-3 text-xs mt-3">
                  <div className="min-w-0">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block truncate">
                      Cross-Device Sync Link
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block line-clamp-1">
                      Open on any other phone or device to load & save these changes permanently.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySyncLink}
                    className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    {syncCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{syncCopied ? 'Copied Link!' : 'Copy Sync Link'}</span>
                  </button>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(DEFAULT_BRAND_PROFILE);
                      onReset();
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleModalClose}
                      className="px-3.5 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
