import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { FocusSession, UserProgress, UserSettings } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying the firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Google Auth Provider configured with prompt to select account
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Operation Types for error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.warn('Firebase client is offline or network unreachable.');
    }
  }
}
testConnection();

export interface AuthErrorResult {
  code: string;
  message: string;
}

/**
 * Sign in with Google Popup and comprehensive error handling
 */
export async function signInWithGoogle(): Promise<{
  user: FirebaseUser | null;
  error?: AuthErrorResult;
}> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user };
  } catch (err: any) {
    console.error('Google Sign In Error:', err);
    const errorCode = err?.code || 'unknown';
    let userMessage = 'Đăng nhập không thành công. Vui lòng thử lại.';

    if (errorCode === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'hiện tại';
      userMessage = `Tên miền "${currentHost}" chưa được cấp quyền trong Firebase Console. Vui lòng truy cập Firebase Console > Authentication > Settings > Authorized Domains và thêm domain này vào.`;
    } else if (errorCode === 'auth/api-key-not-valid') {
      userMessage = 'Khóa API Firebase không hợp lệ (api-key-not-valid). Vui lòng kiểm tra lại cấu hình firebase-applet-config.json.';
    } else if (errorCode === 'auth/popup-closed-by-user') {
      userMessage = 'Cửa sổ đăng nhập Google đã bị đóng trước khi hoàn tất. Vui lòng bấm đăng nhập lại.';
    } else if (errorCode === 'auth/popup-blocked') {
      userMessage = 'Trình duyệt đã chặn cửa sổ bật lên (pop-up). Vui lòng cấp quyền cho phép pop-up trên trình duyệt và thử lại.';
    } else if (errorCode === 'auth/cancelled-popup-request') {
      userMessage = 'Yêu cầu mở pop-up trước đó đã bị hủy.';
    } else if (err?.message) {
      userMessage = `Lỗi đăng nhập: ${err.message}`;
    }

    return {
      user: null,
      error: {
        code: errorCode,
        message: userMessage,
      },
    };
  }
}

/**
 * Sign out and purge local storage & session storage
 */
export async function logOutFromApp(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Error signing out:', err);
  } finally {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
  }
}

/**
 * Load or initialize user profile from Firestore
 */
export async function fetchUserProfile(
  userId: string,
  userGoogleData?: { email?: string | null; displayName?: string | null; photoURL?: string | null }
): Promise<UserProgress | null> {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        focusPoints: data.focusPoints ?? 45,
        totalPointsEarned: data.totalPointsEarned ?? 45,
        currentStreak: data.currentStreak ?? 1,
        longestStreak: data.longestStreak ?? 1,
        lastActiveDate: data.lastActiveDate ?? null,
        ownedItemIds: Array.isArray(data.ownedItemIds)
          ? data.ownedItemIds
          : ['window_sunny', 'theme_green', 'desk_coffee_mug'],
        roomSetup: data.roomSetup ?? {
          deskItem: 'desk_coffee_mug',
          wallItem: null,
          floorItem: null,
          shelfItem: null,
          petItem: null,
          windowView: 'sunny',
          lampOn: true,
        },
        sessions: [], // Sessions loaded separately from subcollection
        streakRewardsClaimed: Array.isArray(data.streakRewardsClaimed)
          ? data.streakRewardsClaimed
          : [],
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Save / sync user progress in Firestore
 */
export async function saveUserProfile(
  userId: string,
  progress: UserProgress,
  googleInfo?: { email?: string | null; displayName?: string | null; photoURL?: string | null }
): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const payload = {
      userId,
      focusPoints: progress.focusPoints,
      totalPointsEarned: progress.totalPointsEarned,
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      lastActiveDate: progress.lastActiveDate ?? null,
      ownedItemIds: progress.ownedItemIds,
      roomSetup: progress.roomSetup,
      streakRewardsClaimed: progress.streakRewardsClaimed,
      email: googleInfo?.email ?? auth.currentUser?.email ?? null,
      displayName: googleInfo?.displayName ?? auth.currentUser?.displayName ?? null,
      photoURL: googleInfo?.photoURL ?? auth.currentUser?.photoURL ?? null,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userDocRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save completed or abandoned focus session to user subcollection
 */
export async function saveFocusSessionToDb(
  userId: string,
  session: FocusSession
): Promise<void> {
  const path = `users/${userId}/sessions/${session.id}`;
  try {
    const sessionDocRef = doc(db, 'users', userId, 'sessions', session.id);
    await setDoc(sessionDocRef, {
      ...session,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Fetch focus sessions from user subcollection
 */
export async function fetchUserSessionsFromDb(userId: string): Promise<FocusSession[]> {
  const path = `users/${userId}/sessions`;
  try {
    const sessionsColl = collection(db, 'users', userId, 'sessions');
    const q = query(sessionsColl, orderBy('startTime', 'desc'), limit(100));
    const querySnapshot = await getDocs(q);

    const sessions: FocusSession[] = [];
    querySnapshot.forEach((docSnap) => {
      sessions.push(docSnap.data() as FocusSession);
    });
    return sessions;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Save user settings to Firestore
 */
export async function saveUserSettingsToDb(
  userId: string,
  settings: UserSettings
): Promise<void> {
  const path = `users/${userId}/settings/preferences`;
  try {
    const settingsDocRef = doc(db, 'users', userId, 'settings', 'preferences');
    await setDoc(settingsDocRef, settings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch user settings from Firestore
 */
export async function fetchUserSettingsFromDb(userId: string): Promise<UserSettings | null> {
  const path = `users/${userId}/settings/preferences`;
  try {
    const settingsDocRef = doc(db, 'users', userId, 'settings', 'preferences');
    const snap = await getDoc(settingsDocRef);
    if (snap.exists()) {
      return snap.data() as UserSettings;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}
