import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { BrandProfile } from '../types.ts';
import { DEFAULT_BRAND_PROFILE } from '../data/defaultProfile.ts';

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId to getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const BRAND_PROFILE_DOC_PATH = 'brand_profiles';
export const BRAND_PROFILE_DOC_ID = 'main_profile';

/**
 * Real-time listener for the global brand profile across all devices
 */
export function subscribeToBrandProfile(
  onUpdate: (profile: BrandProfile) => void,
  onError?: (error: unknown) => void
) {
  const profileRef = doc(db, BRAND_PROFILE_DOC_PATH, BRAND_PROFILE_DOC_ID);
  return onSnapshot(
    profileRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as BrandProfile;
        if (data && data.name && Array.isArray(data.links)) {
          onUpdate(data);
        }
      }
    },
    (err) => {
      console.warn('Firestore subscription error (falling back to local cache):', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Fetch the brand profile once
 */
export async function fetchBrandProfile(): Promise<BrandProfile | null> {
  try {
    const profileRef = doc(db, BRAND_PROFILE_DOC_PATH, BRAND_PROFILE_DOC_ID);
    const snap = await getDoc(profileRef);
    if (snap.exists()) {
      return snap.data() as BrandProfile;
    }
  } catch (err) {
    console.warn('Failed to fetch brand profile from Firestore:', err);
  }
  return null;
}

/**
 * Save brand profile to Firestore to persist across all devices permanently
 */
export async function saveBrandProfileToCloud(profile: BrandProfile): Promise<boolean> {
  try {
    const profileRef = doc(db, BRAND_PROFILE_DOC_PATH, BRAND_PROFILE_DOC_ID);
    await setDoc(profileRef, {
      name: profile.name,
      tagline: profile.tagline || '',
      location: profile.location || '',
      monogram: profile.monogram || 'AS',
      logoUrl: profile.logoUrl || '',
      links: profile.links || DEFAULT_BRAND_PROFILE.links,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('Failed to save brand profile to Firestore:', err);
    throw err;
  }
}
