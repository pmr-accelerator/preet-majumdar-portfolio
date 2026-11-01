
'use client';

import { useEffect, useState } from 'react';

export type GalleryPhoto = {
  id: string;
  src: string;
  title: string;
  category: string;
  date: string | null;
  description: string | null;
};

type Props = {
  photos: GalleryPhoto[];
};

export function GalleryPhotoGrid({ photos }: Props) {
  const [selectedPhoto, setSelectedPhoto] =
    useState<GalleryPhoto | null>(null);

  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedPhoto(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedPhoto]);

  if (photos.length === 0) {
    return (
      <div className="card">
        <h2>No published photographs yet.</h2>
        <p className="muted">
          Photographs will appear here once they are published.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="gallery-photo-grid">
        {photos.map((photo) => (
          <button
            type="button"
            className="gallery-photo-card"
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            aria-label={`View photograph: ${photo.title}`}
          >
            <span className="gallery-photo-frame">
              <img
                src={photo.src}
                alt={photo.title}
                loading="lazy"
              />
            </span>

            <span className="gallery-photo-info">
              <span className="eyebrow mono">
                {photo.category}
                {photo.date ? ` · ${photo.date}` : ''}
              </span>

              <strong>{photo.title}</strong>

              {photo.description && (
                <span className="muted gallery-photo-description">
                  {photo.description}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {selectedPhoto && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={selectedPhoto.title}
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            type="button"
            className="gallery-lightbox-close"
            onClick={() => setSelectedPhoto(null)}
            aria-label="Close photograph"
          >
            ×
          </button>

          <div
            className="gallery-lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="gallery-lightbox-image">
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.title}
              />
            </div>

            <div className="gallery-lightbox-details">
              <p className="eyebrow mono">
                {selectedPhoto.category}
                {selectedPhoto.date
                  ? ` · ${selectedPhoto.date}`
                  : ''}
              </p>

              <h2>{selectedPhoto.title}</h2>

              {selectedPhoto.description && (
                <p className="muted">
                  {selectedPhoto.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .gallery-photo-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fill,
            minmax(230px, 1fr)
          );
          gap: 20px;
        }

        .gallery-photo-card {
          display: block;
          width: 100%;
          padding: 0;
          text-align: left;
          color: inherit;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          font: inherit;
          transition: transform .2s ease, border-color .2s ease;
        }

        .gallery-photo-card:hover {
          transform: translateY(-3px);
          border-color: var(--accent);
        }

        .gallery-photo-frame {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: #0b0d0f;
        }

        .gallery-photo-frame img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .gallery-photo-info {
          display: flex;
          flex-direction: column;
          gap: 9px;
          padding: 16px;
        }

        .gallery-photo-info strong {
          font-size: 1rem;
        }

        .gallery-photo-description {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .gallery-lightbox {
          position: fixed;
          inset: 0;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(0, 0, 0, .92);
        }

        .gallery-lightbox-content {
          width: min(100%, 1000px);
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: auto;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 14px;
        }

        .gallery-lightbox-image {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 160px;
          max-height: 65vh;
          padding: 12px;
          background: #080a0c;
        }

        .gallery-lightbox-image img {
          display: block;
          max-width: 100%;
          max-height: 62vh;
          width: auto;
          height: auto;
          object-fit: contain;
        }

        .gallery-lightbox-details {
          padding: 20px;
        }

        .gallery-lightbox-details h2 {
          margin: 8px 0;
        }

        .gallery-lightbox-close {
          position: absolute;
          top: 18px;
          right: 24px;
          width: 44px;
          height: 44px;
          border: 1px solid rgba(255,255,255,.3);
          border-radius: 50%;
          background: #171a1f;
          color: white;
          font-size: 30px;
          line-height: 1;
          cursor: pointer;
        }

        @media (max-width: 760px) {
          .gallery-photo-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .gallery-photo-info {
            padding: 12px;
          }

          .gallery-lightbox {
            padding: 12px;
          }
        }

        @media (max-width: 420px) {
          .gallery-photo-grid {
            gap: 9px;
          }

          .gallery-photo-info {
            padding: 9px;
          }
        }

        @media (max-width: 320px) {
          .gallery-photo-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
