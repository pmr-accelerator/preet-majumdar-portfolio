
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';

export const runtime = 'nodejs';

const limits: Record<string, number> = {
  'image/jpeg': 10,
  'image/png': 10,
  'image/webp': 10,
  'application/pdf': 10,
  'audio/mpeg': 20,
  'audio/mp4': 20,
  'audio/wav': 20,
  'audio/x-wav': 20,
};

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
};

export async function POST(request: Request) {
  await requireAdmin();

  try {
    const form = await request.formData();
    const file = form.get('file');

    if (!(file instanceof File) || !file.size) {
      return NextResponse.json(
        { error: 'Choose a file first.' },
        { status: 400 }
      );
    }

    const max = limits[file.type];

    if (!max) {
      return NextResponse.json(
        {
          error:
            'This file type is not supported. Use JPG, PNG, WebP, PDF, MP3, M4A or WAV.',
        },
        { status: 415 }
      );
    }

    if (file.size > max * 1024 * 1024) {
      return NextResponse.json(
        {
          error: `File is too large. Maximum for this type is ${max} MB.`,
        },
        { status: 413 }
      );
    }

    // Generate the ID that will also be saved as the database primary key.
    const id = globalThis.crypto.randomUUID();
    const ext = extensions[file.type];

    await prisma.mediaAsset.create({
      data: {
        id,
        storageKey: `database/${id}.${ext}`,
        storageProvider: 'database',
        originalName: file.name.slice(0, 255),
        contentType: file.type,
        sizeBytes: file.size,
        publicUrl: `/api/media/${id}`,
        fileData: Buffer.from(await file.arrayBuffer()),
      },
    });

    return NextResponse.json({
      id,
      name: file.name,
      url: `/api/media/${id}`,
    });
  } catch (error) {
    console.error('Media upload error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Upload failed.',
      },
      { status: 500 }
    );
  }
}
