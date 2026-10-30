
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ContentPage } from '@/components/content-page';
import { MediaDisplay } from '@/components/media-display';

export const dynamic = 'force-dynamic';

export default async function AchievementDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const a = await prisma.achievement.findFirst({
    where: {
      slug,
      publicationStatus: 'PUBLISHED',
    },
  });

  if (!a) notFound();

  const mediaIds = [
    ...(a.certificateMediaId ? [a.certificateMediaId] : []),
    ...a.supportingMediaIds,
  ];

  const assets = mediaIds.length
    ? await prisma.mediaAsset.findMany({
        where: { id: { in: mediaIds } },
      })
    : [];

  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));

  const certificate = a.certificateMediaId
    ? assetMap.get(a.certificateMediaId)
    : null;

  const supportingAssets = a.supportingMediaIds
    .map((id) => assetMap.get(id))
    .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset));

  const displayAsset = (asset: (typeof assets)[number]) => ({
    ...asset,
    publicUrl: `/api/media/${asset.id}`,
  });

  return (
    <ContentPage
      index="04 / ACHIEVEMENT"
      title={a.title}
      intro={a.category}
    >
      <article className="card">
        <p className="eyebrow mono">
          {a.organization || 'ORGANIZATION NOT SPECIFIED'}
          {a.issueDate
            ? ` · ${a.issueDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}`
            : ''}
        </p>

        {certificate && (
          <section style={{ marginTop: 20 }}>
            <h2>Certificate / Proof</h2>
            <MediaDisplay
              asset={displayAsset(certificate)}
              title={`${a.title} certificate`}
            />
          </section>
        )}

        {supportingAssets.length > 0 && (
          <section style={{ marginTop: 28 }}>
            <h2>Supporting documents and photographs</h2>

            <div className="content-grid">
              {supportingAssets.map((asset) => (
                <div key={asset.id}>
                  <MediaDisplay
                    asset={displayAsset(asset)}
                    title={asset.altText || asset.originalName}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <div style={{ marginTop: 24 }}>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.9 }}>
            {a.description}
          </p>

          {a.subjectArea && (
            <p className="muted">Subject: {a.subjectArea}</p>
          )}

          {a.verificationUrl && (
            <p>
              <a
                href={a.verificationUrl}
                target="_blank"
                rel="noreferrer"
              >
                View external verification ↗
              </a>
            </p>
          )}

          {a.verificationNote && (
            <p className="muted">{a.verificationNote}</p>
          )}
        </div>
      </article>
    </ContentPage>
  );
}
