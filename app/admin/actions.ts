
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { clearAdminSession, requireAdmin } from '@/lib/admin-session';

const projectSchema = z.object({
  title: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  summary: z.string().trim().min(5).max(300),
  description: z.string().trim().min(10).max(10000),
  status: z.enum(['IDEA', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']),
  technologies: z.string().max(500).optional(),
  repositoryUrl: z.string().trim().url().optional().or(z.literal('')),
  liveDemoUrl: z.string().trim().url().optional().or(z.literal('')),
  featured: z.string().optional(),
  publicationStatus: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
});

const achievementSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().trim().min(2).max(80),
  organization: z.string().trim().max(160).optional(),
  issueDate: z.string().optional(),
  description: z.string().trim().min(5).max(10000),
  verificationUrl: z.string().trim().url().optional().or(z.literal('')),
  publicationStatus: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
});

const str = (fd: FormData, k: string) =>
  String(fd.get(k) ?? '').trim();

export async function logoutAction() {
  await requireAdmin();
  await clearAdminSession();
  redirect('/admin/login');
}

export async function saveProjectAction(fd: FormData) {
  await requireAdmin();

  const parsed = projectSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid project data');
  }

  const d = parsed.data;
  const id = str(fd, 'id');

  const screenshotMediaIds = fd.getAll('screenshotMediaIds').map(String).filter(Boolean);

  const screenshotAssets = screenshotMediaIds.length
    ? await prisma.mediaAsset.findMany({
        where: {
          id: { in: screenshotMediaIds },
          contentType: { startsWith: 'image/' }
        }
      })
    : [];

  if (screenshotAssets.length !== screenshotMediaIds.length) {
    throw new Error('One or more project screenshots are invalid.');
  }

  const data = {
    title: d.title,
    slug: d.slug,
    summary: d.summary,
    description: d.description,
    status: d.status,
    screenshotMediaIds,
    technologies: (d.technologies || '').split(',').map(s => s.trim()).filter(Boolean),
    repositoryUrl: d.repositoryUrl || null,
    liveDemoUrl: d.liveDemoUrl || null,
    featured: d.featured === 'on',
    publicationStatus: d.publicationStatus,
    publishedAt: d.publicationStatus === 'PUBLISHED' ? new Date() : null
  };

  if (id) {
    await prisma.project.update({ where: { id }, data });
  } else {
    await prisma.project.create({ data });
  }

  revalidatePath('/');
  revalidatePath('/projects');
  revalidatePath('/admin/projects');
  redirect('/admin/projects');
}

export async function deleteProjectAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, 'id');
  if (!id) throw new Error('Missing project id');

  await prisma.project.delete({ where: { id } });

  revalidatePath('/projects');
  revalidatePath('/');
  redirect('/admin/projects');
}

export async function saveAchievementAction(fd: FormData) {
  await requireAdmin();

  const parsed = achievementSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid achievement data');
  }

  const d = parsed.data;
  const id = str(fd, 'id');

  const certificateMediaId = str(fd, 'certificateMediaId') || null;
  const supportingMediaIds = fd.getAll('supportingMediaIds').map(String).filter(Boolean);
  const attachedIds = [
    ...(certificateMediaId ? [certificateMediaId] : []),
    ...supportingMediaIds
  ];

  if (attachedIds.length) {
    const found = await prisma.mediaAsset.findMany({
      where: { id: { in: attachedIds } }
    });

    if (found.length !== new Set(attachedIds).size) {
      throw new Error('One or more achievement files are invalid.');
    }
  }

  const data = {
    title: d.title,
    slug: d.slug,
    category: d.category,
    organization: d.organization || null,
    certificateMediaId,
    supportingMediaIds,
    issueDate: d.issueDate ? new Date(d.issueDate) : null,
    description: d.description,
    verificationUrl: d.verificationUrl || null,
    publicationStatus: d.publicationStatus,
    publishedAt: d.publicationStatus === 'PUBLISHED' ? new Date() : null
  };

  if (id) {
    await prisma.achievement.update({ where: { id }, data });
  } else {
    await prisma.achievement.create({ data });
  }

  revalidatePath('/');
  revalidatePath('/achievements');
  revalidatePath('/admin/achievements');
  redirect('/admin/achievements');
}

export async function deleteAchievementAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, 'id');
  if (!id) throw new Error('Missing achievement id');

  await prisma.achievement.delete({ where: { id } });

  revalidatePath('/achievements');
  redirect('/admin/achievements');
}

export async function updateMessageAction(fd: FormData) {
  await requireAdmin();

  const id = str(fd, 'id');
  const status = str(fd, 'status');

  if (!['NEW', 'READ', 'REPLIED', 'ARCHIVED'].includes(status)) {
    throw new Error('Invalid status');
  }

  await prisma.contactMessage.update({
    where: { id },
    data: {
      status: status as 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED',
      readAt: status === 'READ' ? new Date() : undefined
    }
  });

  revalidatePath('/admin/messages');
  redirect('/admin/messages');
}

// CREATIVE ENTRY SCHEMA
const creativeSchema = z.object({
  type: z.enum(['SINGING', 'GUITAR', 'TABLA']),
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  recordedAt: z.string().optional(),
  language: z.string().max(80).optional(),
  genre: z.string().max(80).optional(),
  taal: z.string().max(80).optional(),
  accompanyingInstruments: z.string().max(300).optional(),
  externalMediaUrl: z.string().trim().url().optional().or(z.literal('')),
  mediaAssetId: z.string().optional(),
  coverMediaId: z.string().optional(),
  description: z.string().max(5000).optional(),
  learningStage: z.string().max(100).optional(),
  publicationStatus: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
});

export async function saveCreativeAction(fd: FormData) {
  await requireAdmin();

  const parsed = creativeSchema.safeParse(Object.fromEntries(fd.entries()));

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid creative entry');
  }

  const d = parsed.data;
  const id = str(fd, 'id');

  const accompanyingInstruments = (d.accompanyingInstruments ?? '')
    .split(',')
    .map(instrument => instrument.trim())
    .filter(Boolean);

  const data = {
    type: d.type,
    title: d.title,
    slug: d.slug,
    recordedAt: d.recordedAt ? new Date(d.recordedAt) : null,
    language: d.language || null,
    genre: d.genre || null,
    taal: d.taal || null,
    accompanyingInstruments,
    externalMediaUrl: d.externalMediaUrl || null,
    mediaAssetId: d.mediaAssetId || null,
    coverMediaId: d.coverMediaId || null,
    description: d.description || null,
    learningStage: d.learningStage || null,
    publicationStatus: d.publicationStatus,
    publishedAt: d.publicationStatus === 'PUBLISHED' ? new Date() : null
  };

  if (id) {
    await prisma.creativeEntry.update({
      where: { id },
      data
    });
  } else {
    await prisma.creativeEntry.create({
      data
    });
  }

  revalidatePath('/creative');
  revalidatePath('/creative/singing');
  revalidatePath('/creative/guitar');
  revalidatePath('/creative/tabla');

  redirect('/admin/creative');
}

export async function deleteCreativeAction(fd: FormData) {
  await requireAdmin();

  const id = str(fd, 'id');
  if (!id) throw new Error('Missing entry id');

  await prisma.creativeEntry.delete({ where: { id } });

  revalidatePath('/creative');
  redirect('/admin/creative');
}

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  headline: z.string().trim().min(5).max(200),
  biography: z.string().trim().min(20).max(5000),
  college: z.string().trim().min(2).max(200),
  degree: z.string().trim().min(2).max(200),
  academicStatus: z.string().trim().min(2).max(200),
  expectedGraduation: z.string().trim().max(100).optional(),
  contactEmail: z.string().trim().email().optional().or(z.literal('')),
  availabilityLabel: z.string().trim().max(120).optional()
});

export async function saveProfileAction(fd: FormData) {
  await requireAdmin();

  const parsed = profileSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid profile data');
  }

  const d = parsed.data;
  const portraitMediaId = str(fd, 'portraitMediaId') || null;

  if (portraitMediaId) {
    const portrait = await prisma.mediaAsset.findUnique({
      where: { id: portraitMediaId }
    });

    if (!portrait || !portrait.contentType.startsWith('image/')) {
      throw new Error('Choose a valid portrait image.');
    }
  }

  const data = {
    fullName: d.fullName,
    headline: d.headline,
    biography: d.biography,
    college: d.college,
    degree: d.degree,
    academicStatus: d.academicStatus,
    portraitMediaId,
    expectedGraduation: d.expectedGraduation || null,
    contactEmail: d.contactEmail || null,
    availabilityLabel: d.availabilityLabel || null
  };

  const existing = await prisma.profile.findFirst();

  if (existing) {
    await prisma.profile.update({ where: { id: existing.id }, data });
  } else {
    await prisma.profile.create({ data });
  }

  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/experience');
  redirect('/admin/profile');
}

const skillSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(80),
  level: z.enum(['Learning', 'Basic', 'Developing', 'Comfortable', 'Proficient']),
  explanation: z.string().max(1000).optional(),
  evidenceUrl: z.string().trim().url().optional().or(z.literal('')),
  visible: z.string().optional()
});

export async function saveSkillAction(fd: FormData) {
  await requireAdmin();

  const parsed = skillSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid skill');
  }

  const d = parsed.data;
  const id = str(fd, 'id');

  const data = {
    name: d.name,
    category: d.category,
    level: d.level,
    explanation: d.explanation || null,
    evidenceUrl: d.evidenceUrl || null,
    visible: d.visible === 'on'
  };

  if (id) {
    await prisma.skill.update({ where: { id }, data });
  } else {
    await prisma.skill.create({ data });
  }

  revalidatePath('/');
  revalidatePath('/admin/skills');
  redirect('/admin/skills');
}

export async function deleteSkillAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, 'id');

  await prisma.skill.delete({ where: { id } });

  revalidatePath('/');
  redirect('/admin/skills');
}

const gallerySchema = z.object({
  title: z.string().trim().min(2).max(160),
  eventName: z.string().trim().max(160).optional(),
  date: z.string().optional(),
  category: z.string().trim().min(2).max(100),
  description: z.string().max(5000).optional(),
  altText: z.string().trim().min(2).max(300),
  externalUrl: z.string().trim().url().optional().or(z.literal('')),
  publicationStatus: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  sortOrder: z.coerce.number().int().min(0).default(0)
});

export async function saveGalleryAction(fd: FormData) {
  await requireAdmin();

  const parsed = gallerySchema.safeParse(
    Object.fromEntries(fd.entries())
  );

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? 'Invalid gallery entry'
    );
  }

  const d = parsed.data;
  const id = str(fd, 'id');
  const imageMediaId = str(fd, 'imageMediaId');

  if (!imageMediaId) {
    throw new Error('Please upload a gallery image.');
  }

  const image = await prisma.mediaAsset.findUnique({
    where: { id: imageMediaId },
    select: { id: true, contentType: true }
  });

  if (!image || !image.contentType.startsWith('image/')) {
    throw new Error('Please select a valid uploaded image.');
  }

  const data = {
    title: d.title,
    imageMediaId,
    eventName: d.eventName || null,
    date: d.date ? new Date(d.date) : null,
    category: d.category,
    description: d.description || null,
    altText: d.altText,
    externalUrl: d.externalUrl || null,
    publicationStatus: d.publicationStatus,
    sortOrder: d.sortOrder,
    publishedAt:
      d.publicationStatus === 'PUBLISHED' ? new Date() : null
  };

  if (id) {
    await prisma.galleryItem.update({
      where: { id },
      data
    });
  } else {
    await prisma.galleryItem.create({
      data
    });
  }

  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');
  redirect('/admin/gallery');
}

export async function deleteGalleryAction(fd: FormData) {
  await requireAdmin();

  const id = str(fd, 'id');

  if (!id) {
    throw new Error('Gallery item ID is missing.');
  }

  await prisma.galleryItem.delete({
    where: { id }
  });

  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');
  redirect('/admin/gallery');
}

export async function setCurrentResumeAction(fd: FormData) {
  await requireAdmin();

  const mediaAssetId = str(fd, 'mediaAssetId');
  const publish = str(fd, 'published') === 'on';

  const asset = await prisma.mediaAsset.findUnique({
    where: { id: mediaAssetId }
  });

  if (!asset || asset.contentType !== 'application/pdf') {
    throw new Error('Choose a PDF from the media library');
  }

  await prisma.$transaction([
    prisma.resumeAsset.updateMany({ data: { published: false } }),
    prisma.resumeAsset.create({
      data: {
        mediaAssetId,
        label: 'Current résumé',
        published: publish
      }
    })
  ]);

  revalidatePath('/');
  revalidatePath('/admin/resume');
  redirect('/admin/resume');
}

export async function unpublishResumeAction() {
  await requireAdmin();

  await prisma.resumeAsset.updateMany({ data: { published: false } });

  revalidatePath('/');
  redirect('/admin/resume');
}

// EXPERIENCE SCHEMA
const experienceSchema = z.object({
  title: z.string().trim().min(2).max(160),
  organization: z.string().trim().min(2).max(200),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.string().optional(),
  featured: z.string().optional(),
  description: z.string().max(5000).optional(),
  responsibilities: z.string().max(3000).optional(),
  teachingSubjects: z.string().max(1000).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0)
});

export async function saveExperienceAction(fd: FormData) {
  await requireAdmin();

  const parsed = experienceSchema.safeParse(
    Object.fromEntries(fd.entries())
  );

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? 'Invalid experience entry'
    );
  }

  const d = parsed.data;
  const id = str(fd, 'id');

  const data = {
    title: d.title,
    organization: d.organization,
    startDate: d.startDate ? new Date(d.startDate) : null,
    endDate: d.endDate ? new Date(d.endDate) : null,
    current: d.current === 'on',
    featured: d.featured === 'on',
    description: d.description || null,
    responsibilities: (d.responsibilities || '')
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean),
    teachingSubjects: (d.teachingSubjects || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    status: d.status,
    sortOrder: d.sortOrder
  };

  if (id) {
    await prisma.experience.update({
      where: { id },
      data
    });
  } else {
    await prisma.experience.create({
      data
    });
  }

  revalidatePath('/experience');
  revalidatePath('/admin/experience');
  redirect('/admin/experience');
}

export async function deleteExperienceAction(fd: FormData) {
  await requireAdmin();

  const id = str(fd, 'id');
  if (!id) throw new Error('Missing experience entry ID');

  await prisma.experience.delete({ where: { id } });

  revalidatePath('/experience');
  revalidatePath('/admin/experience');
  redirect('/admin/experience');
}

const linkSchema = z.object({
  label: z.string().trim().min(1).max(80),
  url: z.string().trim().url().max(1000),
  visible: z.string().optional()
});

export async function saveSocialLinkAction(fd: FormData) {
  await requireAdmin();

  const parsed = linkSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid link');
  }

  const d = parsed.data;
  const id = str(fd, 'id');

  const data = {
    label: d.label,
    url: d.url,
    visible: d.visible === 'on'
  };

  if (id) {
    await prisma.socialLink.update({ where: { id }, data });
  } else {
    await prisma.socialLink.create({ data });
  }

  revalidatePath('/');
  redirect('/admin/links');
}

export async function deleteSocialLinkAction(fd: FormData) {
  await requireAdmin();

  await prisma.socialLink.delete({ where: { id: str(fd, 'id') } });

  revalidatePath('/');
  redirect('/admin/links');
}

const dramaSchema = z.object({
  title: z.string().trim().min(2).max(160),
  role: z.string().trim().min(2).max(100),
  organization: z.string().trim().min(2).max(200),
  productionDate: z.string().optional(),
  description: z.string().trim().min(5).max(5000),
  videoUrl: z.string().trim().url().optional().or(z.literal('')),
  posterMediaId: z.string().optional(),
  credits: z.string().max(1000).optional(),
  publicationStatus: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
});

export async function saveDramaAction(fd: FormData) {
  await requireAdmin();

  const parsed = dramaSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid production');
  }

  const d = parsed.data;
  const id = str(fd, 'id');

  const data = {
    title: d.title,
    role: d.role,
    organization: d.organization,
    productionDate: d.productionDate ? new Date(d.productionDate) : null,
    description: d.description,
    videoUrl: d.videoUrl || null,
    posterMediaId: d.posterMediaId || null,
    credits: (d.credits || '').split(',').map(s => s.trim()).filter(Boolean),
    publicationStatus: d.publicationStatus,
    publishedAt: d.publicationStatus === 'PUBLISHED' ? new Date() : null
  };

  if (id) {
    await prisma.dramaProduction.update({ where: { id }, data });
  } else {
    await prisma.dramaProduction.create({ data });
  }

  revalidatePath('/creative/drama');
  redirect('/admin/drama');
}

export async function deleteDramaAction(fd: FormData) {
  await requireAdmin();

  await prisma.dramaProduction.delete({ where: { id: str(fd, 'id') } });

  revalidatePath('/creative/drama');
  redirect('/admin/drama');
}


const galleryEventSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  date: z.string().optional(),
  description: z.string().max(5000).optional(),
  category: z.string().trim().min(2).max(100),
  coverMediaId: z.string().optional(),
  publicationStatus: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0)
});

export async function saveGalleryEventAction(fd: FormData) {
  await requireAdmin();

  const parsed = galleryEventSchema.safeParse(
    Object.fromEntries(fd.entries())
  );

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? 'Invalid gallery event'
    );
  }

  const d = parsed.data;
  const id = str(fd, 'id');
  const coverMediaId = d.coverMediaId || null;

  if (coverMediaId) {
    const cover = await prisma.mediaAsset.findUnique({
      where: { id: coverMediaId },
      select: { id: true, contentType: true }
    });

    if (!cover || !cover.contentType.startsWith('image/')) {
      throw new Error('Choose a valid cover photograph.');
    }
  }

  const data = {
    title: d.title,
    slug: d.slug,
    date: d.date ? new Date(d.date) : null,
    description: d.description || null,
    category: d.category,
    coverMediaId,
    publicationStatus: d.publicationStatus,
    sortOrder: d.sortOrder,
    publishedAt:
      d.publicationStatus === 'PUBLISHED' ? new Date() : null
  };

  if (id) {
    await prisma.galleryEvent.update({
      where: { id },
      data
    });
  } else {
    await prisma.galleryEvent.create({
      data
    });
  }

  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');

  redirect('/admin/gallery');
}

export async function deleteGalleryEventAction(fd: FormData) {
  await requireAdmin();

  const id = str(fd, 'id');

  if (!id) {
    throw new Error('Gallery event ID is missing.');
  }

  // The schema's ON DELETE SET NULL preserves its photographs.
  await prisma.galleryEvent.delete({
    where: { id }
  });

  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');

  redirect('/admin/gallery');
}


export async function addGalleryPhotosAction(fd: FormData) {
  await requireAdmin();

  const eventId = str(fd, 'galleryEventId');

  const imageMediaIds = [
    ...new Set(
      fd.getAll('imageMediaIds')
        .map((value) => String(value).trim())
        .filter(Boolean)
    )
  ];

  if (!eventId) {
    throw new Error('Select a gallery event.');
  }

  if (imageMediaIds.length === 0) {
    throw new Error('Upload at least one photograph.');
  }

  if (imageMediaIds.length > 10) {
    throw new Error('You can add up to 10 photographs at a time.');
  }

  const event = await prisma.galleryEvent.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      date: true,
      category: true,
      publicationStatus: true
    }
  });

  if (!event) {
    throw new Error('Gallery event not found.');
  }

  const assets = await prisma.mediaAsset.findMany({
    where: {
      id: { in: imageMediaIds },
      contentType: { startsWith: 'image/' }
    },
    select: {
      id: true,
      originalName: true,
      altText: true
    }
  });

  if (assets.length !== imageMediaIds.length) {
    throw new Error(
      'One or more selected files are missing or are not images.'
    );
  }

  const assetMap = new Map(
    assets.map((asset) => [asset.id, asset])
  );

  const lastPhoto = await prisma.galleryItem.findFirst({
    where: { galleryEventId: event.id },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true }
  });

  const startingOrder = (lastPhoto?.sortOrder ?? -1) + 1;

  await prisma.galleryItem.createMany({
    data: imageMediaIds.map((mediaId, index) => {
      const asset = assetMap.get(mediaId)!;

      return {
        title:
          asset.originalName.replace(/\.[^/.]+$/, '') || event.title,
        imageMediaId: mediaId,
        galleryEventId: event.id,
        eventName: event.title,
        date: event.date,
        category: event.category,
        altText: asset.altText || asset.originalName || event.title,
        publicationStatus: event.publicationStatus,
        sortOrder: startingOrder + index
      };
    })
  });

  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');

  redirect('/admin/gallery');
}

export async function setGalleryEventCoverAction(fd: FormData) {
  await requireAdmin();

  const eventId = str(fd, 'galleryEventId');
  const imageMediaId = str(fd, 'imageMediaId');

  if (!eventId || !imageMediaId) {
    throw new Error('Event and cover photograph are required.');
  }

  const [event, photo, asset] = await Promise.all([
    prisma.galleryEvent.findUnique({
      where: { id: eventId },
      select: { id: true }
    }),

    prisma.galleryItem.findFirst({
      where: {
        galleryEventId: eventId,
        imageMediaId
      },
      select: { id: true }
    }),

    prisma.mediaAsset.findUnique({
      where: { id: imageMediaId },
      select: { contentType: true }
    })
  ]);

  if (
    !event ||
    !photo ||
    !asset?.contentType.startsWith('image/')
  ) {
    throw new Error(
      'The selected cover must be a photograph belonging to this event.'
    );
  }

  await prisma.galleryEvent.update({
    where: { id: eventId },
    data: { coverMediaId: imageMediaId }
  });

  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');

  redirect('/admin/gallery');
}

export async function deleteGalleryPhotoAction(fd: FormData) {
  await requireAdmin();

  const id = str(fd, 'id');

  if (!id) {
    throw new Error('Photograph ID is missing.');
  }

  const photo = await prisma.galleryItem.findUnique({
    where: { id },
    select: {
      id: true,
      imageMediaId: true,
      galleryEventId: true
    }
  });

  if (!photo) {
    throw new Error('Photograph not found.');
  }

  await prisma.$transaction(async (tx) => {
    await tx.galleryItem.delete({
      where: { id }
    });

    if (photo.galleryEventId) {
      await tx.galleryEvent.updateMany({
        where: {
          id: photo.galleryEventId,
          coverMediaId: photo.imageMediaId
        },
        data: { coverMediaId: null }
      });
    }
  });

  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');

  redirect('/admin/gallery');
}


// ================================
// REVIEW MODERATION ACTIONS
// ================================

export async function moderateReviewAction(fd: FormData) {
  await requireAdmin();

  const id = str(fd, 'id');
  const status = str(fd, 'status');

  if (!id || !['APPROVED', 'REJECTED'].includes(status)) {
    throw new Error('Invalid review moderation request.');
  }

  const review = await prisma.review.findUnique({
    where: { id },
    select: {
      id: true,
      verificationStatus: true,
    },
  });

  if (!review) {
    throw new Error('Review not found.');
  }

  if (review.verificationStatus !== 'VERIFIED') {
    throw new Error('Only email-verified reviews can be moderated.');
  }

  await prisma.review.update({
    where: { id },
    data: {
      status: status as 'APPROVED' | 'REJECTED',
      moderatedAt: new Date(),
    },
  });

  revalidatePath('/');
  revalidatePath('/reviews');
  revalidatePath('/admin');
  revalidatePath('/admin/reviews');

  redirect('/admin/reviews');
}

export async function editReviewAction(fd: FormData) {
  await requireAdmin();

  const id = str(fd, 'id');

  const parsed = z.object({
    name: z.string().trim().min(2).max(100),
    designation: z.string().trim().max(150).optional(),
    rating: z.coerce.number().int().min(1).max(5),
    content: z.string().trim().min(10).max(2000),
    linkedInUrl: z.string().trim().url().optional().or(z.literal('')),
  }).safeParse(Object.fromEntries(fd.entries()));

  if (!id || !parsed.success) {
    throw new Error(
      parsed.success
        ? 'Review ID is missing.'
        : parsed.error.issues[0]?.message ?? 'Invalid review data.'
    );
  }

  await prisma.review.update({
    where: { id },
    data: {
      name: parsed.data.name,
      designation: parsed.data.designation || null,
      rating: parsed.data.rating,
      content: parsed.data.content,
      linkedInUrl: parsed.data.linkedInUrl || null,
    },
  });

  revalidatePath('/');
  revalidatePath('/reviews');
  revalidatePath('/admin/reviews');

  redirect('/admin/reviews');
}

export async function deleteReviewAction(fd: FormData) {
  await requireAdmin();

  const id = str(fd, 'id');

  if (!id) {
    throw new Error('Review ID is missing.');
  }

  await prisma.review.delete({
    where: { id },
  });

  revalidatePath('/');
  revalidatePath('/reviews');
  revalidatePath('/admin');
  revalidatePath('/admin/reviews');

  redirect('/admin/reviews');
}
