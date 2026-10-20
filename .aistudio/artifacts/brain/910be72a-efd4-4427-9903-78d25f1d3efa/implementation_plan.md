# Minimalist Brand Social & Review Hub

A high-aesthetic, responsive single-page social media and profile hub designed for creators, studios, and businesses. Features a centered minimalist brand header, fluid monochrome theme with light/dark mode, interactive buttons for Instagram, TikTok, Website, WhatsApp, Google Reviews, and Email, paired with instant copy-to-clipboard actions, live QR code modal sharing, and an in-app brand customizer.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following directions have been confirmed and integrated into this architecture:
> - **Brand Display**: Centered minimalist brand mark at the top of the page with an intuitive in-app live editor modal (allowing live customization of the brand name, tagline/handle, and target URLs stored safely in client localStorage).
> - **Visual Aesthetics**: Clean, high-contrast monochrome design (deep obsidian black `#09090b` and pure studio white `#ffffff`) with hairline borders, subtle ambient glow, and an instant Light/Dark mode toggle.
> - **Interactivity**: Direct platform navigation complemented by one-click URL copy with animated toast feedback and a dynamic QR code sharing sheet for physical scanning, storefront displays, or mobile sharing.

---

### 1. Overview & Core Concept

- **What It Does**: Provides an ultra-clean, elegant brand landing page featuring direct links and sharing options for all required channels: **Instagram**, **TikTok**, **Official Website**, **WhatsApp**, **Google Review**, and **Email Contact**.
- **Target Audience / Persona**: Modern design studios, luxury retail boutiques, creators, photographers, hospitality venues, and independent professionals looking for a bespoke, anti-slop alternative to generic link-in-bio tools.
- **Key Value**: Delivers an uncluttered, high-conversion social interface with instantaneous feedback, responsive desktop and mobile viewports, and zero third-party branding or tracking bloat.

---

### 2. User Experience & Visual Design

#### Layout & Spatial Rhythm
- **Top Brand Zone**: Centered minimalist wordmark in geometric sans (`Plus Jakarta Sans` / `Outfit`), accompanied by a subtle subtitle/handle (e.g., `@luminstudio · New York`) and a discrete floating corner toolbar for the Theme Toggle (Light/Dark) and Brand Settings Editor.
- **Social Action Grid**: A single-column vertical stack (max-width `540px` on mobile, centered within a spacious `1440px` baseline) engineered with equal height button cards ($56\text{px}$–$64\text{px}$) that feel tactile and responsive.
- **Direct Dual-Action Controls**: Each card provides:
  1. A primary clickable body triggering direct navigation to the external social platform in a safe new tab (`rel="noopener noreferrer"`).
  2. A discreet right-aligned action cluster with a quick-copy button (copies URL with a checkmark badge) and a QR code reveal button.
- **Google Reviews Spotlight**: A highlighted review button featuring real star typography and a direct call to action to boost customer social proof and ratings.

#### Visual Identity & Theme
- **Dominant Palette (Monochrome & Zinc)**:
  - **Dark Mode**: Background `#09090b` (zinc-950), card surface `#18181b` (zinc-900) with hairline border `rgba(255, 255, 255, 0.08)`, text `#f4f4f5` (zinc-100), muted captions `#a1a1aa` (zinc-400).
  - **Light Mode**: Background `#fafafa` (zinc-50), card surface `#ffffff` with hairline border `rgba(0, 0, 0, 0.08)`, text `#09090b` (zinc-950), muted captions `#71717a` (zinc-500).
- **Subtle Micro-Interactions & Hover Animations**:
  - Smooth scale and translation (`hover:-translate-y-0.5 hover:shadow-lg hover:border-zinc-400 dark:hover:border-zinc-500`).
  - Fluid spring physics using `motion` for button press, modal reveal, and clipboard toast alerts.
  - Subtly shifting icon accent glows on mouse enter without garish candy pills or neon gradients.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct Social Links vs. Share Sheet Modal**:
  - *Chosen Approach*: Hybrid architecture. The main card click directly opens the destination profile (Instagram, TikTok, WhatsApp direct chat, Google Review submission, Email mailto). The auxiliary icon opens a dedicated QR share sheet or copies the URL to the clipboard.
  - *Why*: Gives users both instantaneous 1-tap navigation and rapid sharing utility without forcing extra clicks.
- **Decision 2: Live In-App Customizer with Local Persistence**:
  - *Chosen Approach*: Built-in live customizer modal that lets the owner edit the brand name, description, avatar/monogram, and links, saving instantly to `localStorage` with a 1-click "Reset to Defaults" option.
  - *Why*: Eliminates hardcoding lock-in while avoiding heavy backend setup or unnecessary database authentication for a single link hub page.
- **Decision 3: Zero-Pill & Anti-Slop Formatting**:
  - *Chosen Approach*: Unboxed typography with typographic separators (`·`) for social follower counts or handle subtexts, avoiding tacky capsule tags or fake badge sandwiches.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       Top Navigation                        │
│  [Dark/Light Switch]        Brand Wordmark     [Edit Brand] │
└──────────────────────────────┬──────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
   ┌───────────────────────────┐ ┌───────────────────────────┐
   │    Live Brand Context     │ │     Brand Header Card     │
   │   - Brand Name            │ │  - Monogram / Logo Mark   │
   │   - Subtitle / Location   │ │  - Brand Wordmark (H1)    │
   │   - Social URLs & Labels  │ │  - Bio / Tagline          │
   │   - Theme Preference      │ └─────────────┬─────────────┘
   └────────────┬──────────────┘               │
                │                              │
                └──────────────┬───────────────┘
                               │
                               ▼
        ┌─────────────────────────────────────────────┐
        │        Interactive Social Links Stack       │
        │                                             │
        │  [   Instagram            |  Copy |  QR ] │
        │  [   TikTok               |  Copy |  QR ] │
        │  [   Official Website     |  Copy |  QR ] │
        │  [   WhatsApp Direct      |  Copy |  QR ] │
        │  [   Google Review Hub    |  Copy |  QR ] │
        │  [   Email Inquiries      |  Copy |  QR ] │
        └──────────────────────┬──────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
  ┌─────────────────────────┐     ┌─────────────────────────┐
  │   QR Code Share Modal   │     │  Live Brand Edit Modal  │
  │  - SVG QR code display  │     │  - Brand Name input     │
  │  - Download QR button   │     │  - Bio / Tagline input  │
  │  - One-tap URL copy     │     │  - Custom link targets  │
  └─────────────────────────┘     └─────────────────────────┘
```

#### Social Channels & Formats Included
1. **Instagram**: Direct profile deep link (`https://instagram.com/luminstudio`).
2. **TikTok**: Profile link (`https://tiktok.com/@luminstudio`).
3. **Official Website**: Domain link with subtle outbound indicator.
4. **WhatsApp**: `https://wa.me/...` with pre-filled greeting message.
5. **Google Review**: Direct five-star submission link format.
6. **Email**: Structured `mailto:` protocol link with subject and body presets.

#### Libraries & Tooling
- **Styling**: Tailwind CSS v4 with clean CSS variables and dark mode classes.
- **Icons**: `lucide-react` for crisp vector iconography and platform glyphs.
- **Motion**: `motion/react` for micro-interactions, smooth hover transitions, and modal backdrops.
- **QR Code**: Zero-dependency high-res SVG QR generation for fast, offline-capable code generation.
