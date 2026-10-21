/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun,
  Moon,
  Share2,
  Lock,
  CheckCircle2,
  Check,
  QrCode,
  Sparkles,
  Link2,
} from 'lucide-react';
import { BrandProfile, SocialLinkItem } from './types.ts';
import { DEFAULT_BRAND_PROFILE } from './data/defaultProfile.ts';
import { SocialButton } from './components/SocialButton.tsx';
import { QRCodeModal } from './components/QRCodeModal.tsx';
import { EditProfileModal } from './components/EditProfileModal.tsx';

export const DEPLOYED_SITE_URL = 'https://cielornior.vercel.app/';

export default function App() {
  // Theme state: defaults to dark for high-contrast minimalist look
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('aura_theme_mode');
    if (saved) return saved === 'dark';
    return true; // default dark mode
  });

  // Brand Profile State
  const [brandProfile, setBrandProfile] = useState<BrandProfile>(() => {
    try {
      const saved = localStorage.getItem('aura_brand_profile');
      if (saved) {
        const parsed: BrandProfile = JSON.parse(saved);
        // Ensure website link points to the deployed site if previously saved with old default
        if (parsed.links) {
          parsed.links = parsed.links.map((link) =>
            link.id === 'website' && (link.url === 'https://aurastudio.design' || !link.url)
              ? { ...link, url: DEPLOYED_SITE_URL, handleOrInfo: 'cielornior.vercel.app' }
              : link
          );
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse local brand profile', e);
    }
    return DEFAULT_BRAND_PROFILE;
  });

  // Modals & Active Targets
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [qrModalState, setQrModalState] = useState<{
    isOpen: boolean;
    title: string;
    url: string;
    subtitle?: string;
  }>({
    isOpen: false,
    title: '',
    url: '',
    subtitle: '',
  });

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync theme with HTML document
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('aura_theme_mode', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('aura_theme_mode', 'light');
    }
  }, [isDarkMode]);

  // Show temporary toast message
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Copy handler
  const handleCopyLink = async (url: string, label: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      triggerToast(`Copied ${label} link to clipboard`);
    } catch (err) {
      console.error('Failed to copy', err);
      triggerToast(`Could not copy link`);
    }
  };

  // Open QR modal for specific item
  const handleOpenQR = (item: SocialLinkItem) => {
    setQrModalState({
      isOpen: true,
      title: item.title,
      url: item.url,
      subtitle: item.handleOrInfo,
    });
  };

  // Share main site QR or link (using deployed URL: https://cielornior.vercel.app/)
  const handleShareEntirePage = () => {
    setQrModalState({
      isOpen: true,
      title: brandProfile.name,
      url: DEPLOYED_SITE_URL,
      subtitle: `Official Hub · cielornior.vercel.app`,
    });
  };

  // Save updated brand profile
  const handleSaveProfile = (updated: BrandProfile) => {
    setBrandProfile(updated);
    try {
      localStorage.setItem('aura_brand_profile', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save brand profile', e);
    }
    triggerToast('Brand profile updated');
  };

  // Reset to default
  const handleResetProfile = () => {
    setBrandProfile(DEFAULT_BRAND_PROFILE);
    localStorage.removeItem('aura_brand_profile');
    triggerToast('Reset to default brand profile');
  };

  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300 flex flex-col justify-between selection:bg-neutral-900 selection:text-white dark:selection:bg-neutral-100 dark:selection:text-neutral-900">
      {/* Background subtle radial texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06] bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"
        aria-hidden="true"
      />

      {/* Top Utility Bar & Centered Brand Header */}
      <header className="relative w-full border-b border-neutral-200/60 dark:border-neutral-900 bg-white/70 dark:bg-neutral-950/70 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Left: Quick Actions (Customize Brand - Password Protected) */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            aria-label="Brand admin and link settings"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-all active:scale-95"
          >
            <Lock className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden sm:inline">Brand Admin</span>
          </button>

          {/* Middle: Brand Name (Centered at the top as requested) */}
          <div className="text-center px-2">
            <h2 className="text-xs sm:text-sm font-bold tracking-[0.22em] uppercase text-neutral-900 dark:text-neutral-100 transition-all select-none">
              {brandProfile.name}
            </h2>
          </div>

          {/* Right: Share Page & Dark/Light Toggle */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShareEntirePage}
              title="Share this page QR code"
              aria-label="Share this page"
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-all active:scale-95"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative flex-1 w-full max-w-xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
        {/* Brand Showcase Hero (Middle of Top Page) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-center w-full mb-8 flex flex-col items-center"
        >
          {/* Logo or Monogram Avatar */}
          <div
            className="relative mb-4 group cursor-pointer"
            onClick={() => setIsEditModalOpen(true)}
            title="Click to manage brand settings (Password protected)"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 flex items-center justify-center font-bold text-lg sm:text-xl tracking-widest shadow-lg border border-neutral-200 dark:border-neutral-800 transition-transform duration-200 group-hover:scale-105 overflow-hidden">
              {brandProfile.logoUrl ? (
                <img
                  src={brandProfile.logoUrl}
                  alt={`${brandProfile.name} logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                brandProfile.monogram || 'AS'
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-500 shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>
          </div>

          {/* Prominent Minimalist Wordmark */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-neutral-900 dark:text-neutral-100 text-balance">
            {brandProfile.name}
          </h1>

          {/* Tagline / Bio */}
          <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md font-normal leading-relaxed text-balance">
            {brandProfile.tagline}
          </p>

          {/* Unboxed Metadata (Zero-Pill Discipline) */}
          <div className="flex items-center justify-center flex-wrap gap-2 text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-2.5">
            <span>{brandProfile.location}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" />
              Verified Channel
            </span>
          </div>
        </motion.div>

        {/* Action Buttons Section */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between px-1 pb-1 text-xs text-neutral-500 dark:text-neutral-400 font-medium tracking-wide">
            <span className="uppercase text-[11px] tracking-wider">Connect & Share</span>
            <span className="text-[11px] font-mono">{brandProfile.links.length} Direct Channels</span>
          </div>

          {/* Render All Social & Contact Buttons with Subtle Hover Animations */}
          <div className="space-y-2.5 w-full">
            {brandProfile.links.map((linkItem, idx) => (
              <SocialButton
                key={linkItem.id}
                item={linkItem}
                index={idx}
                onCopy={handleCopyLink}
                onOpenQR={handleOpenQR}
              />
            ))}
          </div>
        </div>

        {/* Quick Share Strip at the bottom of the card list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="w-full mt-6 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
              <Link2 className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                Share this profile
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate font-mono">
                cielornior.vercel.app
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleCopyLink(DEPLOYED_SITE_URL, brandProfile.name)}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              Copy Link
            </button>
            <button
              type="button"
              onClick={handleShareEntirePage}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 font-medium transition-colors flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Code</span>
            </button>
          </div>
        </motion.div>
      </main>

      {/* Minimalist Footer */}
      <footer className="w-full border-t border-neutral-200/60 dark:border-neutral-900 py-6 px-4 text-center text-xs text-neutral-400 dark:text-neutral-500">
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] font-medium tracking-tight">
            © {new Date().getFullYear()} {brandProfile.name}. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="hover:text-neutral-900 dark:hover:text-neutral-200 underline underline-offset-2 transition-colors"
            >
              Edit Brand Details
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleShareEntirePage}
              className="hover:text-neutral-900 dark:hover:text-neutral-200 underline underline-offset-2 transition-colors"
            >
              View Hub QR
            </button>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 inset-x-0 mx-auto w-fit max-w-sm z-50 px-4 py-2.5 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-medium shadow-xl flex items-center gap-2 border border-neutral-800 dark:border-neutral-200"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={qrModalState.isOpen}
        onClose={() => setQrModalState((prev) => ({ ...prev, isOpen: false }))}
        title={qrModalState.title}
        url={qrModalState.url}
        subtitle={qrModalState.subtitle}
        onCopyUrl={handleCopyLink}
      />

      {/* Live Brand Edit Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentProfile={brandProfile}
        onSave={handleSaveProfile}
        onReset={handleResetProfile}
      />
    </div>
  );
}
