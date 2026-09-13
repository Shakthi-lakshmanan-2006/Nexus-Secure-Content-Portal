import crypto from 'crypto';
import path from 'path';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create server-side DOMPurify instance with isolated JSDOM window
const domWindow = new JSDOM('').window;
const DOMPurify = createDOMPurify(domWindow as unknown as Window & typeof globalThis);

/**
 * Robust HTML Sanitization for Enterprise Content Enclave
 * Strips executable scripts, event handlers, javascript: pseudo-protocols,
 * external framing, and dangerous object tags while preserving semantic tags,
 * typography, tables, code blocks, SVG diagrams, and inline CSS formatting.
 */
export function sanitizeUploadedHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') {
    return '';
  }

  const clean = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'html', 'head', 'body', 'meta', 'title', 'style',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption',
      'ul', 'ol', 'li', 'dl', 'dt', 'dd',
      'pre', 'code', 'kbd', 'samp', 'var', 'blockquote', 'hr', 'br',
      'a', 'b', 'strong', 'i', 'em', 'mark', 'small', 'del', 'ins', 'sub', 'sup',
      'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'text', 'g',
      'img', 'figure', 'figcaption', 'details', 'summary', 'section', 'article', 'aside', 'nav', 'header', 'footer'
    ],
    ALLOWED_ATTR: [
      'class', 'id', 'style', 'title', 'lang', 'dir',
      'href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'loading',
      'viewBox', 'd', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
      'colspan', 'rowspan', 'headers', 'scope', 'open'
    ],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'applet', 'base', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'formaction'],
    ALLOW_DATA_ATTR: false,
    RETURN_TRUSTED_TYPE: false,
  });

  return clean.toString();
}

/**
 * Generate cryptographically random, path-safe storage paths
 * Prevents directory traversal attacks (e.g. `../../etc/passwd`)
 */
export function generateSafeStoragePath(category: string, originalFilename: string, ext: string): string {
  // Normalize clean extension (must begin with dot)
  const cleanExt = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
  
  // Clean category (alphanumeric and hyphens only)
  const cleanCategory = category.toLowerCase().replace(/[^a-z0-9-_]/g, '-').slice(0, 30) || 'general';
  
  // Random unique UUID + 8 random hex bytes
  const uniqueId = `${crypto.randomUUID()}-${crypto.randomBytes(4).toString('hex')}`;
  
  return `content/${cleanCategory}/${uniqueId}${cleanExt}`;
}

/**
 * Verify that a resolved path stays strictly within the vault enclave root
 */
export function isPathInsideVault(vaultRoot: string, targetPath: string): boolean {
  const relative = path.relative(vaultRoot, targetPath);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}
