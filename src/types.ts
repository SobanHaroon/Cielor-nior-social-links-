export type SocialPlatformId =
  | 'instagram'
  | 'tiktok'
  | 'website'
  | 'whatsapp'
  | 'google_review'
  | 'email';

export interface SocialLinkItem {
  id: SocialPlatformId;
  title: string;
  handleOrInfo: string;
  subtitle: string;
  url: string;
  actionLabel: string;
  isPrimaryHighlight?: boolean;
}

export interface BrandProfile {
  name: string;
  tagline: string;
  location: string;
  monogram: string;
  logoUrl?: string;
  links: SocialLinkItem[];
}
