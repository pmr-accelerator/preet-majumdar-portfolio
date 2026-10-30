
'use client';

import { useState } from 'react';

type Asset = {
  publicUrl: string | null;
  contentType: string;
  originalName: string;
  altText: string | null;
};

export function MediaDisplay({
  asset,
  externalUrl,
  cover,
  title,
}: {
  asset?: Asset | null;
  externalUrl?: string | null;
  cover?: Asset | null;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);

  const url = asset?.publicUrl || externalUrl || '';
  const type = asset?.contentType || '';

  if (asset && url && type.startsWith('image/')) {
    return (
      <a className="media-visual" href={url} target="_blank" rel="noreferrer">
        <img src={url} alt={asset.altText || title} loading="lazy" />
      </a>
    );
  }

  const clean = url.split('?')[0].toLowerCase();
  const uploadedVideo = Boolean(asset && type.startsWith('video/'));
  const videoFile = uploadedVideo || /\.(mp4|webm|mov)$/.test(clean);

  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{6,})/
  );

  const facebookVideo = /(?:facebook\.com|fb\.watch)\//i.test(url);

  const isVideo =
    videoFile || Boolean(youtube) || facebookVideo;

  if (isVideo) {
    if (cover?.publicUrl && !playing) {
      return (
        <button
          type="button"
          className="media-visual media-launch"
          onClick={() => setPlaying(true)}
          aria-label={`Play ${title}`}
        >
          <img
            src={cover.publicUrl}
            alt={cover.altText || `${title} thumbnail`}
            loading="lazy"
          />
          <span className="media-play-button" aria-hidden="true">
            ▶
          </span>
        </button>
      );
    }

    if (youtube) {
      return (
        <div className="media-visual media-embed">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtube[1]}?autoplay=1`}
            title={title}
            loading="lazy"
            allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      );
    }

    if (facebookVideo) {
      return (
        <div className="media-visual media-embed">
          <iframe
            src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&autoplay=1`}
            title={title}
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />
          <a
            className="media-link"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            Open original Facebook video ↗
          </a>
        </div>
      );
    }

    return (
      <div className="media-visual">
        <video
          controls
          autoPlay={playing}
          preload="metadata"
          playsInline
          src={url}
        >
          {uploadedVideo && type ? (
            <source src={url} type={type} />
          ) : null}
        </video>
      </div>
    );
  }

  if (asset && url && type.startsWith('audio/')) {
    return (
      <div className="media-audio">
        <span className="media-icon">♫</span>
        <audio controls preload="none" src={url} />
      </div>
    );
  }

  if (asset && url && type === 'application/pdf') {
    return (
      <a className="media-document" href={url} target="_blank" rel="noreferrer">
        <span className="media-icon">PDF</span>
        <span>
          <strong>Open document</strong>
          <small>{asset.originalName}</small>
        </span>
        <b>↗</b>
      </a>
    );
  }

  if (url) {
    if (/\.(mp3|m4a|wav|ogg)$/.test(clean)) {
      return (
        <div className="media-audio">
          <span className="media-icon">♫</span>
          <audio controls preload="none" src={url} />
        </div>
      );
    }

    if (/\.pdf$/.test(clean)) {
      return (
        <a className="media-document" href={url} target="_blank" rel="noreferrer">
          <span className="media-icon">PDF</span>
          <span>
            <strong>Open document</strong>
            <small>PDF document</small>
          </span>
          <b>↗</b>
        </a>
      );
    }

    if (/\.(jpg|jpeg|png|webp|gif)$/.test(clean)) {
      return (
        <a className="media-visual" href={url} target="_blank" rel="noreferrer">
          <img src={url} alt={title} loading="lazy" />
        </a>
      );
    }

    return (
      <a className="media-link" href={url} target="_blank" rel="noreferrer">
        <span className="media-icon">↗</span>
        <span>
          <strong>View original media</strong>
          <small>Opens the original post or recording</small>
        </span>
      </a>
    );
  }

  return (
    <div className="media-placeholder" aria-hidden="true">
      <span>PM</span>
    </div>
  );
}
