
/**
 * Extrai o ID de um vídeo do YouTube a partir de uma URL.
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

/**
 * Gera a URL de embed do YouTube.
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Gera a URL da thumbnail do YouTube.
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Gera a URL de preview direta do Google Drive.
 */
export function getDrivePreviewUrl(url: string): string {
  if (!url) return '';
  if (url.includes('drive.google.com/file/d/')) {
    const id = url.match(/\/d\/([^/]+)/)?.[1];
    return `https://lh3.googleusercontent.com/d/${id}`;
  }
  return url;
}
