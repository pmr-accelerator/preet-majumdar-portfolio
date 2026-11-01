import { notFound } from 'next/navigation';
import Link from 'next/link';
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

  const a = await prisma.achievement.findUnique({
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
      select: {
        id: true,
        contentType: true,
        originalName: true,
        altText: true,
        publicUrl: true,
      },
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
            <h2 className="font-semibold text-lg mb-4">
              Certificate / Proof
            </h2>

            <MediaDisplay
              asset={displayAsset(certificate)}
              title={`${a.title} certificate`}
            />
          </section>
        )}

        <section className="border-t border-white/10 pt-6 mt-6">
          <h2 className="font-semibold text-lg mb-3">
            Achievement Details
          </h2>

          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.9 }}>
            {a.description}
          </p>

          {a.subjectArea && (
            <p className="muted mt-3">Subject: {a.subjectArea}</p>
          )}

          {a.verificationUrl && (
            <p className="mt-3">
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
            <p className="muted mt-3">{a.verificationNote}</p>
          )}
        </section>

        {supportingAssets.length > 0 && (
          <section className="border-t border-white/10 pt-6 mt-6">
            <h2 className="font-semibold text-lg mb-4">
              Additional Photographs & Supporting Documents
            </h2>

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

        <div className="border-t border-white/10 pt-5 mt-6">
          <Link
            href="/achievements"
            className="text-sm font-medium hover:text-cyan-300 transition-colors"
          >
            ← Back to achievements
          </Link>
        </div>
      </article>
    </ContentPage>
  );
}