import fs from 'fs';
import path from 'path';
import os from 'os';
import { getSupabaseAdmin } from '../src/lib/supabase.js';

export class SecureStorageEnclave {
  private vaultDir: string;

  constructor() {
    const isServerless = Boolean(
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT ||
      process.env.NODE_ENV === 'production' && !fs.existsSync(path.join(process.cwd(), 'server'))
    );

    if (isServerless) {
      this.vaultDir = path.join(os.tmpdir(), 'nexus-vault', 'secure-content');
    } else {
      this.vaultDir = path.join(process.cwd(), 'server', 'vault', 'secure-content');
    }

    try {
      this.ensureVaultDirectory();
      this.seedDemoFilesIfMissing();
    } catch (err) {
      console.warn('[Vault Initialization Notice]: Filesystem setup notice:', err);
    }
  }

  private ensureVaultDirectory() {
    try {
      if (!fs.existsSync(this.vaultDir)) {
        fs.mkdirSync(this.vaultDir, { recursive: true });
      }
    } catch (err) {
      console.warn('[Vault Directory Creation]:', err);
    }
  }

  private seedDemoFilesIfMissing() {
    try {
      // 1. Seed Demo HTML
      const htmlDir = path.join(this.vaultDir, 'vault', 'html');
      if (!fs.existsSync(htmlDir)) {
        fs.mkdirSync(htmlDir, { recursive: true });
      }
      const htmlPath = path.join(htmlDir, 'cloud-hardening-handbook.html');
      if (!fs.existsSync(htmlPath)) {
      const demoHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cloud Security Hardening Handbook</title>
  <style>
    :root {
      --bg: #090d16;
      --card: #0f172a;
      --border: #1e293b;
      --text: #f1f5f9;
      --muted: #94a3b8;
      --accent: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.15);
      --success: #10b981;
      --warning: #f59e0b;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 32px 24px;
      max-width: 900px;
      margin: 0 auto;
    }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: rgba(56, 189, 248, 0.1);
      color: var(--accent);
      border: 1px solid rgba(56, 189, 248, 0.3);
      margin-bottom: 12px;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #fff;
    }
    p.subtitle {
      color: var(--muted);
      font-size: 15px;
      margin: 0;
    }
    .section {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    h2 {
      font-size: 18px;
      color: #fff;
      margin-top: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      font-size: 14px;
    }
    th, td {
      text-align: left;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
    }
    th {
      color: var(--muted);
      font-weight: 600;
      background: rgba(15, 23, 42, 0.6);
    }
    .tag-pass {
      color: var(--success);
      font-weight: 600;
    }
    .tag-req {
      color: var(--warning);
      font-weight: 600;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      background: rgba(0,0,0,0.4);
      padding: 2px 6px;
      border-radius: 4px;
      color: #38bdf8;
      font-size: 13px;
    }
    pre {
      background: #030712;
      border: 1px solid var(--border);
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: monospace;
      font-size: 13px;
      color: #e2e8f0;
    }
    .callout {
      border-left: 4px solid var(--accent);
      padding: 12px 16px;
      background: rgba(56, 189, 248, 0.05);
      border-radius: 0 8px 8px 0;
      margin: 16px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <header>
    <div class="badge">NEXUS SECURE ENCLAVE</div>
    <h1>Cloud Infrastructure Hardening Standard (v4.2)</h1>
    <p class="subtitle">Mandatory architecture specifications for all perimeter workloads and distributed microservices.</p>
  </header>

  <div class="section">
    <h2>1. TLS & Cipher Suite Requirements</h2>
    <p>All ingress and egress termination layers must enforce minimum TLS 1.3 or high-assurance TLS 1.2 with perfect forward secrecy (PFS). Legacy RC4, 3DES, and CBC suites are blocked at proxy ingress.</p>
    
    <table>
      <thead>
        <tr>
          <th>Protocol</th>
          <th>Cipher Suite Specification</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>TLS 1.3</td>
          <td><code>TLS_AES_256_GCM_SHA384</code></td>
          <td><span class="tag-pass">MANDATORY</span></td>
        </tr>
        <tr>
          <td>TLS 1.3</td>
          <td><code>TLS_CHACHA20_POLY1305_SHA256</code></td>
          <td><span class="tag-pass">MANDATORY</span></td>
        </tr>
        <tr>
          <td>TLS 1.2</td>
          <td><code>ECDHE-RSA-AES256-GCM-SHA384</code></td>
          <td><span class="tag-req">APPROVED FALLBACK</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>2. Defense-in-Depth IAM Boundary Configuration</h2>
    <p>Zero static long-lived credentials in runtime containers. Utilize short-lived OIDC workload identity federations with 15-minute lease horizons.</p>
    
    <div class="callout">
      <strong>Incident Directive #89:</strong> Any service account key detected in commit history or build artifact logs triggers an immediate automated quarantine and token invalidation cycle.
    </div>

    <pre><code># Sample Hardened Ingress CSP Header
Content-Security-Policy: default-src 'self'; \
  script-src 'self'; \
  frame-ancestors 'none'; \
  object-src 'none'; \
  block-all-mixed-content;</code></pre>
  </div>

  <div class="section">
    <h2>3. Audit Log Ingestion Protocol</h2>
    <p>All privileged IAM events, vault reads, and administrative policy updates must stream asynchronously to tamper-evident WORM (Write Once, Read Many) cloud storage buckets with cryptographic hashing.</p>
  </div>
</body>
</html>`;
      fs.writeFileSync(htmlPath, demoHtml, 'utf-8');
    }

    // 2. Seed Demo PDF
    const docDir = path.join(this.vaultDir, 'vault', 'documents');
    fs.mkdirSync(docDir, { recursive: true });
    const pdfPath = path.join(docDir, 'security-protocols-guide.pdf');
    if (!fs.existsSync(pdfPath)) {
      // Standard minimal valid PDF 1.4 binary structure
      const samplePdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
/Contents 5 0 R /Resources << /Font << /F1 6 0 R >> >> >>
endobj
4 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
/Contents 7 0 R /Resources << /Font << /F1 6 0 R >> >> >>
endobj
5 0 obj
<< /Length 215 >>
stream
BT
/F1 24 Tf
50 720 Td
(NEXUS - Enterprise Security Protocols) Tj
/F1 12 Tf
0 -40 Td
(CONFIDENTIAL ORGANIZATIONAL SPECIFICATION) Tj
0 -30 Td
(Section 1: Zero-Trust Perimeter Governance) Tj
0 -20 Td
(All ingress traffic must pass through authenticated gateway enclaves.) Tj
0 -20 Td
(Encrypted at rest with AES-256-GCM. Range streaming active.) Tj
ET
endstream
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
7 0 obj
<< /Length 175 >>
stream
BT
/F1 20 Tf
50 720 Td
(Section 2: Incident Response Runbook) Tj
/F1 12 Tf
0 -40 Td
(Page 2: Containment & Secret Rotation Sequence) Tj
0 -25 Td
(1. Isolate compromised workload subnet immediately.) Tj
0 -20 Td
(2. Rotate service account and database credentials.) Tj
ET
endstream
endobj
xref
0 8
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000125 00000 n 
0000000244 00000 n 
0000000363 00000 n 
0000000632 00000 n 
0000000709 00000 n 
trailer
<< /Size 8 /Root 1 0 R >>
startxref
938
%%EOF`;
      fs.writeFileSync(pdfPath, samplePdf, 'utf-8');
    }

    // 3. Seed Demo Video
    const videoDir = path.join(this.vaultDir, 'vault', 'videos');
    fs.mkdirSync(videoDir, { recursive: true });
    const videoPath = path.join(videoDir, 'zero-trust-training.mp4');
    if (!fs.existsSync(videoPath)) {
      // Create valid minimal MP4 file container headers
      const ftyp = Buffer.from([
        0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, // size 24, "ftyp"
        0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00, // "isom", minor version 512
        0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32  // compatible brands
      ]);
      const moov = Buffer.from([
        0x00, 0x00, 0x00, 0x20, 0x6d, 0x6f, 0x6f, 0x76, // size 32, "moov"
        0x00, 0x00, 0x00, 0x18, 0x6d, 0x76, 0x68, 0x64, // "mvhd"
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0xe8
      ]);
      const mdatHeader = Buffer.from([
        0x00, 0x01, 0x00, 0x00, 0x6d, 0x64, 0x61, 0x74  // size 65536, "mdat"
      ]);
      const payload = Buffer.alloc(65536 - 8);
      // Fill with safe deterministic video payload pattern
      for (let i = 0; i < payload.length; i++) {
        payload[i] = (i * 37) % 256;
      }
      const totalBuffer = Buffer.concat([ftyp, moov, mdatHeader, payload]);
      fs.writeFileSync(videoPath, totalBuffer);
    }
    } catch (err) {
      console.warn('[Vault Seed Warning]: Failed to seed demo files on filesystem:', err);
    }
  }

  public getAbsoluteVaultPath(storagePath: string): string {
    // Sanitize path to prevent any directory traversal outside vaultDir
    const normalized = path.normalize(storagePath).replace(/^(\.\.[\/\\])+/, '');
    return path.join(this.vaultDir, normalized);
  }

  public async saveFile(fileBuffer: Buffer, storagePath: string): Promise<void> {
    const fullPath = this.getAbsoluteVaultPath(storagePath);
    const parentDir = path.dirname(fullPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    await fs.promises.writeFile(fullPath, fileBuffer);

    // If Supabase Storage is configured, sync to 'secure-content' private bucket as well
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase.storage
          .from('secure-content')
          .upload(storagePath, fileBuffer, {
            upsert: true,
          });
      } catch (err) {
        console.warn('[Supabase Sync Warning]: Could not upload to Supabase storage bucket', err);
      }
    }
  }

  public async deleteFile(storagePath: string): Promise<void> {
    const fullPath = this.getAbsoluteVaultPath(storagePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase.storage.from('secure-content').remove([storagePath]);
      } catch (err) {
        console.warn('[Supabase Delete Warning]: Could not remove from Supabase bucket', err);
      }
    }
  }

  public fileExists(storagePath: string): boolean {
    const fullPath = this.getAbsoluteVaultPath(storagePath);
    return fs.existsSync(fullPath);
  }

  public getFileSize(storagePath: string): number {
    const fullPath = this.getAbsoluteVaultPath(storagePath);
    if (fs.existsSync(fullPath)) {
      return fs.statSync(fullPath).size;
    }
    return 0;
  }

  public readStream(storagePath: string, options?: { start?: number; end?: number }): fs.ReadStream {
    const fullPath = this.getAbsoluteVaultPath(storagePath);
    return fs.createReadStream(fullPath, options);
  }

  public async readFile(storagePath: string): Promise<Buffer> {
    const fullPath = this.getAbsoluteVaultPath(storagePath);
    return await fs.promises.readFile(fullPath);
  }
}

export const storageEnclave = new SecureStorageEnclave();
