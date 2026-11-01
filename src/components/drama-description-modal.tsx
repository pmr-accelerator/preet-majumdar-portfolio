'use client';

import { useEffect, useState } from 'react';

type DramaDescriptionModalProps = {
  title: string;
  description: string;
};

export function DramaDescriptionModal({
  title,
  description,
}: DramaDescriptionModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="drama-read-more"
        onClick={() => setIsOpen(true)}
      >
        Read full description
      </button>

      {isOpen && (
        <div
          className="drama-modal-backdrop"
          onClick={() => setIsOpen(false)}
        >
          <section
            className="drama-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drama-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drama-modal-header">
              <h2 id="drama-modal-title">{title}</h2>

              <button
                type="button"
                className="drama-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close description"
              >
                &times;
              </button>
            </div>

            <div className="drama-modal-content">
              <p>{description}</p>
            </div>

            <div className="drama-modal-footer">
              <button
                type="button"
                className="button button-primary"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}