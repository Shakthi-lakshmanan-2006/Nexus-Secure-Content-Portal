import { z } from 'zod';

export const ALLOWED_MIME_TYPES = {
  VIDEO: ['video/mp4', 'video/webm'],
  PDF: ['application/pdf'],
  HTML: ['text/html'],
} as const;

export const ALLOWED_EXTENSIONS = {
  VIDEO: ['.mp4', '.webm'],
  PDF: ['.pdf'],
  HTML: ['.html', '.htm'],
} as const;

export const MAX_FILE_SIZES = {
  VIDEO: 250 * 1024 * 1024, // 250 MB
  PDF: 50 * 1024 * 1024,    // 50 MB
  HTML: 10 * 1024 * 1024,   // 10 MB
};

export const ContentMetadataSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category cannot exceed 50 characters'),
  tags: z
    .array(z.string().min(1).max(30))
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum 10 tags allowed'),
  type: z.enum(['VIDEO', 'PDF', 'HTML']),
});

export const ContentEditSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category cannot exceed 50 characters'),
  tags: z
    .array(z.string().min(1).max(30))
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum 10 tags allowed'),
});

export function validateFileIntegrity(
  file: { originalname: string; mimetype: string; size: number },
  declaredType: 'VIDEO' | 'PDF' | 'HTML'
): { valid: boolean; error?: string } {
  // Check extension
  const ext = '.' + file.originalname.split('.').pop()?.toLowerCase();
  const allowedExts = ALLOWED_EXTENSIONS[declaredType] as readonly string[];
  if (!allowedExts.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file extension "${ext}". Allowed for ${declaredType}: ${allowedExts.join(', ')}`,
    };
  }

  // Check declared MIME against allow-list
  const allowedMimes = ALLOWED_MIME_TYPES[declaredType] as readonly string[];
  if (!allowedMimes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Disallowed MIME type "${file.mimetype}". Allowed: ${allowedMimes.join(', ')}`,
    };
  }

  // Check file size limits
  const maxSize = MAX_FILE_SIZES[declaredType];
  if (file.size > maxSize) {
    const sizeMb = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${sizeMb} MB for ${declaredType} assets.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'Uploaded file is empty (0 bytes).',
    };
  }

  return { valid: true };
}
