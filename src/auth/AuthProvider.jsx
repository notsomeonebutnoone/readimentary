/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ClerkProvider, SignIn, UserButton, useAuth, useClerk, useUser } from '@clerk/react';

const AuthContext = createContext(null);
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function normalizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '',
    fullName: user.fullName || user.username || '',
    imageUrl: user.imageUrl || ''
  };
}

function useDialogFocus(open, focusRef) {
  useEffect(() => {
    if (!open) return undefined;
    const returnFocusTo = document.activeElement;
    const frame = requestAnimationFrame(() => focusRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      if (returnFocusTo instanceof HTMLElement) returnFocusTo.focus();
    };
  }, [open, focusRef]);
}

function handleDialogKeyDown(event, close) {
  if (event.key === 'Escape') {
    event.preventDefault();
    close();
    return;
  }
  if (event.key !== 'Tab') return;
  const controls = [...event.currentTarget.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]
    .filter((element) => !element.disabled && element.tabIndex >= 0 && element.getAttribute('aria-hidden') !== 'true');
  if (!controls.length) return event.preventDefault();
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function ClerkAuthBridge({ children }) {
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const clerk = useClerk();
  const [authOpen, setAuthOpen] = useState(false);
  const dialogRef = useRef(null);

  const openAuth = useCallback(() => setAuthOpen(true), []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);
  useDialogFocus(authOpen, dialogRef);
  const value = useMemo(() => ({
    configured: true,
    isLoaded: authLoaded && userLoaded,
    isSignedIn: Boolean(isSignedIn),
    user: isSignedIn ? normalizeUser(user) : null,
    getToken,
    openAuth,
    closeAuth,
    signOut: () => clerk.signOut({ redirectUrl: '/' })
  }), [authLoaded, userLoaded, isSignedIn, user, getToken, openAuth, closeAuth, clerk]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {authOpen && !isSignedIn && (
        <div
          ref={dialogRef}
          tabIndex={-1}
          onKeyDown={(event) => handleDialogKeyDown(event, closeAuth)}
          className="fixed inset-0 z-[300] flex items-center justify-center overflow-y-auto bg-black/90 p-4 backdrop-blur-md focus:outline-none"
          role="dialog"
          aria-modal="true"
          aria-label="Get started with Readimentary"
        >
          <button type="button" tabIndex={-1} className="absolute inset-0 cursor-default" onClick={closeAuth} aria-label="Close authentication" />
          <div className="relative z-10 max-h-[calc(100vh-2rem)] max-w-full overflow-y-auto rounded-2xl">
            <SignIn
              routing="virtual"
              transferable
              fallbackRedirectUrl="/"
              appearance={{
                variables: { colorPrimary: '#f59e0b', colorBackground: '#111111', colorText: '#ffffff', borderRadius: '0.9rem' },
                elements: { cardBox: 'shadow-2xl', footerActionLink: 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500' }
              }}
            />
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

function UnconfiguredAuthProvider({ children }) {
  const [authOpen, setAuthOpen] = useState(false);
  const closeButtonRef = useRef(null);
  useDialogFocus(authOpen, closeButtonRef);
  const value = useMemo(() => ({
    configured: false,
    isLoaded: true,
    isSignedIn: false,
    user: null,
    getToken: async () => null,
    openAuth: () => setAuthOpen(true),
    closeAuth: () => setAuthOpen(false),
    signOut: async () => {}
  }), []);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {authOpen && (
        <div onKeyDown={(event) => handleDialogKeyDown(event, () => setAuthOpen(false))} className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="auth-unavailable-title">
          <button type="button" tabIndex={-1} className="absolute inset-0 cursor-default" onClick={() => setAuthOpen(false)} aria-label="Close authentication" />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-amber-500/25 bg-zinc-950 p-7 shadow-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">Authentication unavailable</p>
            <h2 id="auth-unavailable-title" className="mt-3 text-2xl font-bold text-white">Get Started is not configured yet.</h2>
            <p className="mt-3 text-sm leading-6 text-white/55">The site owner must add a Clerk publishable key before accounts can be created or signed in.</p>
            {import.meta.env.DEV && <p className="mt-4 rounded-xl bg-white/5 p-3 font-mono text-xs text-white/55">Set VITE_CLERK_PUBLISHABLE_KEY in .env.</p>}
            <button ref={closeButtonRef} type="button" onClick={() => setAuthOpen(false)} className="mt-6 w-full rounded-xl border border-white/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500">Close</button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function AppAuthProvider({ children }) {
  if (!publishableKey) return <UnconfiguredAuthProvider>{children}</UnconfiguredAuthProvider>;
  return (
    <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
      <ClerkAuthBridge>{children}</ClerkAuthBridge>
    </ClerkProvider>
  );
}

export function AccountMenu() {
  const auth = useAppAuth();
  if (!auth.configured || !auth.isSignedIn) return null;
  return <UserButton showName appearance={{ elements: { userButtonBox: 'text-white', userButtonOuterIdentifier: 'text-white/70 text-xs' } }} />;
}

export function useAppAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAppAuth must be used within AppAuthProvider.');
  return value;
}
