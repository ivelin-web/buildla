const DEFAULT_ALLOWED_EXTENSIONS = ['.pdf'];

const rawAllowedExtensions = process.env.NEXT_PUBLIC_ALLOWED_UPLOAD_EXTENSIONS;

const normalizeExtension = (extension: string) => {
  const trimmed = extension.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }
  return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
};

export const ALLOWED_UPLOAD_EXTENSIONS = (
  rawAllowedExtensions?.split(',').map(normalizeExtension).filter((ext): ext is string => Boolean(ext)) ??
  DEFAULT_ALLOWED_EXTENSIONS
);

export const ALLOWED_UPLOAD_ACCEPT_ATTRIBUTE = ALLOWED_UPLOAD_EXTENSIONS.join(',');

export const ALLOWED_UPLOAD_FORMAT_LABEL = ALLOWED_UPLOAD_EXTENSIONS
  .map((extension) => extension.replace('.', '').toUpperCase())
  .join(', ');

const extensionToMimeTypes: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.heic': ['image/heic', 'image/heif'],
  '.heif': ['image/heif', 'image/heic'],
  '.webp': ['image/webp'],
};

const ALLOWED_UPLOAD_MIME_TYPES = new Set(
  ALLOWED_UPLOAD_EXTENSIONS
    .flatMap((extension) => extensionToMimeTypes[extension] ?? [])
    .map((mime) => mime.toLowerCase())
);

export function isAllowedFileType(file: File) {
  const fileName = file.name ?? '';
  const extension = `.${fileName.split('.').pop()?.toLowerCase() ?? ''}`;

  if (extension && ALLOWED_UPLOAD_EXTENSIONS.includes(extension)) {
    return true;
  }

  if (file.type) {
    const mimeType = file.type.toLowerCase();
    if (ALLOWED_UPLOAD_MIME_TYPES.has(mimeType)) {
      return true;
    }
  }

  return false;
}

export function getReadableFileType(file: File) {
  const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
  if (!extension || extension === '.') {
    return 'FILE';
  }
  return extension.replace('.', '').toUpperCase();
}
