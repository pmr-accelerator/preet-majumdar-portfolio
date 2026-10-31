'use client';

import { useEffect, useState } from 'react';

export function IntroSplash() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => {
      setExiting(true);
    }, 1900);

    const removeTimer = window.setTimeout(() => {
      setVisible(false);
    }, 2800);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`intro-splash${exiting ? ' intro-splash-exit' : ''}`}
      role="status"
      aria-label="Welcome to Preet Majumdar's portfolio"
    >
      <div className="intro-orbit" aria-hidden="true" />

      <div className="intro-content">
        <p className="eyebrow mono">A PERSONAL PORTFOLIO</p>

        <h1>
          Welcome to
          <br />
          <span>Preet Majumdar&apos;s</span>
          <br />
          Portfolio
        </h1>

        <div className="intro-progress">
          <i />
        </div>

        <p className="intro-caption">
          TECHNOLOGY · LEADERSHIP · CREATIVE WORK
        </p>
      </div>
    </div>
  );
}