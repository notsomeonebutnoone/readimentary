import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppAuthProvider, useAppAuth } from './AuthProvider';

function AuthEntry() {
  const auth = useAppAuth();
  return <button type="button" onClick={auth.openAuth}>Get Started</button>;
}

describe('unconfigured authentication boundary', () => {
  it('remains signed out and gives the modal accessible focus handling', async () => {
    render(<AppAuthProvider><AuthEntry /></AppAuthProvider>);

    const trigger = screen.getByRole('button', { name: 'Get Started' });
    trigger.focus();
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog', { name: 'Get Started is not configured yet.' })).toBeInTheDocument();
    const close = screen.getByRole('button', { name: 'Close' });
    await waitFor(() => expect(close).toHaveFocus());
    fireEvent.keyDown(close, { key: 'Tab' });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    expect(close).toHaveFocus();

    fireEvent.keyDown(close, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
