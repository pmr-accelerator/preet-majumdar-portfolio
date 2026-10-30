
import { MediaDisplay } from '@/components/media-display';

type Asset = {
  id: string;
  publicUrl: string | null;
  contentType: string;
  originalName: string;
  altText: string | null;
};

export function PortfolioMediaCard({
  title,
  description,
  asset,
  cover,
  externalUrl,
}: {
  title: string;
  description?: string | null;
  asset?: Asset | null;
  cover?: Asset | null;
  externalUrl?: string | null;
}) {
  return (
    <>
      <h2>{title}</h2>

      {description && <p className="muted">{description}</p>}

      <MediaDisplay
        asset={asset}
        externalUrl={externalUrl}
        cover={cover}
        title={title}
      />
    </>
  );
}
