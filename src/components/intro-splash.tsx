
'use client';

import { useEffect, useState } from 'react';

export function IntroSplash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show the intro on every full page load and refresh.
    setVisible(true);

    const done = window.setTimeout(() => {
      setVisible(false);
    }, 1900);

    return () => window.clearTimeout(done);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="intro-splash"
      aria-label="Welcome to Preet Majumdar's portfolio"
    >
      <div className="intro-orbit" aria-hidden="true" />

      <p className="eyebrow mono">A PERSONAL PORTFOLIO</p>

      <h1>
        Welcome to
        <br />
        <span>Preet Majumdar's</span>
        <br />
        Portfolio.
      </h1>

      <div className="intro-progress">
        <i />
      </div>

      <p className="intro-caption">
        TECHNOLOGY · LEADERSHIP · CREATIVE WORK
      </p>
    </div>
  );
}
