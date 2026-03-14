'use client';

import { useEffect, useState } from 'react';
import { LoginForm } from './login-form';

export function LoginFormShell() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="login-form-skeleton" aria-hidden="true" />;
  }

  return <LoginForm />;
}
