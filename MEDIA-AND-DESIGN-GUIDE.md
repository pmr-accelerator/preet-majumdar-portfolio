# Media management and visual updates

## Upload workflow
1. Configure the six S3-compatible storage variables in Render (see `.env.example`).
2. Deploy the project.
3. Sign in at `/admin` and open **Media library**.
4. Upload an image, MP4, supported audio file, or PDF (maximum 12 MB).
5. In **Creative entries**, select the uploaded media file. Optionally select an image as its cover/thumbnail and/or paste an Instagram, Facebook, or YouTube URL.
6. In **Drama productions**, select a poster image and paste either a YouTube/social URL or the public URL of an uploaded video.
7. Set the entry to Published. Drafts remain private.

## Thumbnail behaviour
- Images display as their own thumbnail.
- Videos display a native video player; add a separate uploaded image as the cover/thumbnail in Creative entries.
- Audio displays an audio player with a designed audio tile.
- PDFs display a document tile and open in a new tab.
- YouTube URLs are embedded where supported. Instagram/Facebook links open the original post because their embed availability depends on platform permissions and post privacy.

## Future updates
- Routine text/media changes are made in the admin dashboard and do not require a code deployment.
- Layout, styling, feature, or behaviour changes require a GitHub commit and Render deployment.
- Keep large media in the configured object storage, not the Render app filesystem.
- Intro animation is shown once per browser session, lasts about 1.9 seconds, and respects reduced-motion preferences.
