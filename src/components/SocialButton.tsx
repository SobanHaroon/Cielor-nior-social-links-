import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Mail, ArrowUpRight, Copy, Check, QrCode } from 'lucide-react';
import { SocialLinkItem } from '../types.ts';
import {
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
  WhatsAppIcon,
  GoogleReviewIcon,
  StarSolidIcon,
} from './Icons.tsx';

interface SocialButtonProps {
  item: SocialLinkItem;
  onCopy: (text: string, label: string) => void;
  onOpenQR: (item: SocialLinkItem) => void;
  index: number;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  item,
  onCopy,
  onOpenQR,
  index,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCopy(item.url, item.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQRClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenQR(item);
  };

  const renderIcon = () => {
    switch (item.id) {
      case 'instagram':
        return <InstagramIcon className="w-5 h-5 text-neutral-900 dark:text-neutral-100 transition-transform duration-200 group-hover:scale-110" />;
      case 'tiktok':
        return <TikTokIcon className="w-5 h-5 text-neutral-900 dark:text-neutral-100 transition-transform duration-200 group-hover:scale-110" />;
      case 'facebook':
        return <FacebookIcon className="w-5 h-5 text-neutral-900 dark:text-neutral-100 transition-transform duration-200 group-hover:scale-110" />;
      case 'website':
        return <Globe className="w-5 h-5 text-neutral-900 dark:text-neutral-100 transition-transform duration-200 group-hover:scale-110" />;
      case 'whatsapp':
        return <WhatsAppIcon className="w-5 h-5 text-neutral-900 dark:text-neutral-100 transition-transform duration-200 group-hover:scale-110" />;
      case 'google_review':
        return <GoogleReviewIcon className="w-5 h-5 text-neutral-900 dark:text-neutral-100 transition-transform duration-200 group-hover:scale-110" />;
      case 'email':
        return <Mail className="w-5 h-5 text-neutral-900 dark:text-neutral-100 transition-transform duration-200 group-hover:scale-110" />;
      default:
        return <Globe className="w-5 h-5 text-neutral-900 dark:text-neutral-100" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="relative group w-full"
    >
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${item.title}: ${item.handleOrInfo}`}
        className={`
          flex items-center justify-between w-full px-5 py-4 rounded-xl
          bg-white dark:bg-neutral-900/90
          border border-neutral-200 dark:border-neutral-800
          hover:border-neutral-400 dark:hover:border-neutral-600
          hover:bg-neutral-50/70 dark:hover:bg-neutral-800/60
          hover:-translate-y-0.5 active:translate-y-0
          shadow-xs hover:shadow-md
          transition-all duration-200 ease-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-100
          ${item.isPrimaryHighlight ? 'ring-1 ring-neutral-300 dark:ring-neutral-700 bg-neutral-50/50 dark:bg-neutral-900' : ''}
        `}
      >
        {/* Left: Platform glyph and titles */}
        <div className="flex items-center gap-4 min-w-0 pr-3">
          <div
            className={`
              w-11 h-11 shrink-0 rounded-lg flex items-center justify-center
              border border-neutral-200/80 dark:border-neutral-800
              bg-neutral-100/60 dark:bg-neutral-950/60
              group-hover:border-neutral-400/80 dark:group-hover:border-neutral-700
              group-hover:bg-neutral-100 dark:group-hover:bg-neutral-950
              transition-colors duration-200
            `}
          >
            {renderIcon()}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
                {item.title}
              </span>

              {item.id === 'google_review' && (
                <div className="flex items-center text-amber-500 gap-0.5 shrink-0" aria-label="5 stars">
                  {[...Array(5)].map((_, i) => (
                    <StarSolidIcon key={i} className="w-3.5 h-3.5" />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
              <span className="font-mono text-[11px] truncate">{item.handleOrInfo}</span>
              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
              <span className="truncate hidden sm:inline text-neutral-400 dark:text-neutral-500">
                {item.subtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Interactive Actions (Copy, QR, External Arrow) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyClick}
            title={`Copy ${item.title} link`}
            aria-label={`Copy ${item.title} link`}
            className={`
              p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100
              hover:bg-neutral-100 dark:hover:bg-neutral-800
              transition-all duration-150 active:scale-90
              ${copied ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : ''}
            `}
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {/* Quick QR Code Button */}
          <button
            type="button"
            onClick={handleQRClick}
            title={`View QR code for ${item.title}`}
            aria-label={`View QR code for ${item.title}`}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-150 active:scale-90"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Direct Outbound Arrow */}
          <div className="pl-1 text-neutral-400 group-hover:text-neutral-900 dark:text-neutral-600 dark:group-hover:text-neutral-200 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </a>
    </motion.div>
  );
};
