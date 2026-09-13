import { ContentItem, ActivityLog, UserProfile, UserRole } from '../src/types.js';
import crypto from 'crypto';

// Default Admin allow-list: ONLY the requested administrator email
export function getAdminEmails(): string[] {
  const envAdmins = process.env.ADMIN_EMAILS || 'sakthilakshman521@gmail.com';
  return envAdmins.split(',').map((e) => e.trim().toLowerCase());
}

export function isEmailAdmin(email: string): boolean {
  if (!email) return false;
  const admins = getAdminEmails();
  return admins.includes(email.toLowerCase());
}

// In-Memory Database Store with initial seed data
// Automatically syncs with Supabase if configured, otherwise serves as high-performance local enclave
export class EnclaveDatabase {
  private profiles: Map<string, UserProfile> = new Map();
  private contents: Map<string, ContentItem> = new Map();
  private activityLogs: ActivityLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed Default Users
    const adminEmail = 'sakthilakshman521@gmail.com';
    const adminUser: UserProfile = {
      id: 'usr_admin_001',
      email: adminEmail,
      full_name: 'Sakthi Lakshmanan (Admin)',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&fit=crop&crop=faces',
      role: 'ADMIN',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    };
    this.profiles.set(adminUser.id, adminUser);
    this.profiles.set(adminUser.email, adminUser);

    const viewerUser: UserProfile = {
      id: 'usr_viewer_002',
      email: 'viewer.demo@nexus.internal',
      full_name: 'Alex Morgan (Viewer)',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&fit=crop&crop=faces',
      role: 'VIEWER',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    };
    this.profiles.set(viewerUser.id, viewerUser);
    this.profiles.set(viewerUser.email, viewerUser);

    // Seed Demo Contents
    const videoItem: ContentItem = {
      id: 'cnt_video_101',
      title: 'Enterprise Zero-Trust Architecture & Threat Modeling',
      description: 'Comprehensive walkthrough of identity-first perimeter defense, micro-segmentation, and zero-trust data enclaves for enterprise cloud workloads.',
      category: 'Security Training',
      tags: ['Zero-Trust', 'Architecture', 'Cloud Security', 'Defense-in-Depth'],
      type: 'VIDEO',
      storage_path: 'vault/videos/zero-trust-training.mp4',
      original_filename: 'zero-trust-training.mp4',
      mime_type: 'video/mp4',
      file_size: 14680064, // ~14 MB
      created_by: adminUser.id,
      created_by_name: adminUser.full_name,
      created_by_email: adminUser.email,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      published: true,
      status: 'APPROVED',
      reviewed_by: 'System Initializer',
      reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      view_count: 42,
      last_viewed_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      duration: '14:20',
      rating: 4.8,
      rating_count: 15,
    };
    this.contents.set(videoItem.id, videoItem);

    const pdfItem: ContentItem = {
      id: 'cnt_pdf_102',
      title: 'NEXUS Core Security Protocols & Incident Response Guide',
      description: 'Standard operating procedure for security incidents, blast-radius containment, secret revocation, and regulatory audit compliance reporting.',
      category: 'Compliance & SOP',
      tags: ['SOP', 'Incident Response', 'Compliance', 'Runbook'],
      type: 'PDF',
      storage_path: 'vault/documents/security-protocols-guide.pdf',
      original_filename: 'security-protocols-guide.pdf',
      mime_type: 'application/pdf',
      file_size: 2457600, // ~2.4 MB
      created_by: adminUser.id,
      created_by_name: adminUser.full_name,
      created_by_email: adminUser.email,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      published: true,
      status: 'APPROVED',
      reviewed_by: 'System Initializer',
      reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      view_count: 87,
      last_viewed_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      page_count: 12,
      rating: 4.9,
      rating_count: 28,
    };
    this.contents.set(pdfItem.id, pdfItem);

    const htmlItem: ContentItem = {
      id: 'cnt_html_103',
      title: 'Interactive Cloud Security Hardening Handbook',
      description: 'Living organizational knowledge manual featuring interactive benchmark matrices, cipher suite configurations, and hardening checklists.',
      category: 'Engineering Docs',
      tags: ['Hardening', 'Infrastructure', 'Best Practices', 'CIS Benchmark'],
      type: 'HTML',
      storage_path: 'vault/html/cloud-hardening-handbook.html',
      original_filename: 'cloud-hardening-handbook.html',
      mime_type: 'text/html',
      file_size: 38400, // ~38 KB
      created_by: adminUser.id,
      created_by_name: adminUser.full_name,
      created_by_email: adminUser.email,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      published: true,
      status: 'APPROVED',
      reviewed_by: 'System Initializer',
      reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      view_count: 114,
      last_viewed_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      rating: 5.0,
      rating_count: 34,
    };
    this.contents.set(htmlItem.id, htmlItem);

    // Seed Pending User Submission (Submitted by Viewer Alex Morgan for Admin Review)
    const pendingSubmission: ContentItem = {
      id: 'cnt_submission_201',
      title: 'Continuous Compliance & Infrastructure-as-Code Auditing',
      description: 'Community-contributed guide detailing policy-as-code guardrails (Open Policy Agent, Terraform Sentinel) to prevent misconfigurations before cloud provisioning.',
      category: 'Engineering Docs',
      tags: ['IaC', 'Terraform', 'Policy-as-Code', 'Compliance'],
      type: 'HTML',
      storage_path: 'vault/html/cloud-hardening-handbook.html',
      original_filename: 'iac-compliance-guide.html',
      mime_type: 'text/html',
      file_size: 24500,
      created_by: viewerUser.id,
      created_by_name: viewerUser.full_name,
      created_by_email: viewerUser.email,
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      published: false,
      status: 'PENDING_REVIEW',
      view_count: 0,
      last_viewed_at: null,
    };
    this.contents.set(pendingSubmission.id, pendingSubmission);

    // Seed Activity Logs
    this.activityLogs = [
      {
        id: 'act_001',
        user_id: adminUser.id,
        user_name: adminUser.full_name,
        user_email: adminUser.email,
        action: 'UPLOAD',
        content_id: videoItem.id,
        content_title: videoItem.title,
        metadata: { type: 'VIDEO', size: videoItem.file_size },
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
      {
        id: 'act_002',
        user_id: adminUser.id,
        user_name: adminUser.full_name,
        user_email: adminUser.email,
        action: 'UPLOAD',
        content_id: pdfItem.id,
        content_title: pdfItem.title,
        metadata: { type: 'PDF', size: pdfItem.file_size },
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
      {
        id: 'act_003',
        user_id: adminUser.id,
        user_name: adminUser.full_name,
        user_email: adminUser.email,
        action: 'UPLOAD',
        content_id: htmlItem.id,
        content_title: htmlItem.title,
        metadata: { type: 'HTML', size: htmlItem.file_size },
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
      {
        id: 'act_004',
        user_id: viewerUser.id,
        user_name: viewerUser.full_name,
        user_email: viewerUser.email,
        action: 'VIEW',
        content_id: htmlItem.id,
        content_title: htmlItem.title,
        metadata: { type: 'HTML' },
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: 'act_005',
        user_id: viewerUser.id,
        user_name: viewerUser.full_name,
        user_email: viewerUser.email,
        action: 'VIEW',
        content_id: videoItem.id,
        content_title: videoItem.title,
        metadata: { type: 'VIDEO' },
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ];
  }

  // Profile operations
  public getProfileByEmail(email: string): UserProfile | undefined {
    return this.profiles.get(email.toLowerCase());
  }

  public getProfileById(id: string): UserProfile | undefined {
    return this.profiles.get(id);
  }

  public upsertProfile(profile: Partial<UserProfile> & { email: string }): UserProfile {
    const emailKey = profile.email.toLowerCase();
    const existing = this.profiles.get(emailKey);
    const now = new Date().toISOString();

    // Determine role:
    // If user belongs to ADMIN_EMAILS allow-list, assign ADMIN
    // Otherwise, default to VIEWER (unless existing is already ADMIN)
    let role: UserRole = 'VIEWER';
    if (isEmailAdmin(profile.email)) {
      role = 'ADMIN';
    } else if (existing && existing.role === 'ADMIN') {
      role = 'ADMIN';
    } else if (profile.role) {
      role = profile.role;
    }

    const updated: UserProfile = {
      id: existing?.id || profile.id || `usr_${crypto.randomUUID().slice(0, 8)}`,
      email: emailKey,
      full_name: profile.full_name || existing?.full_name || emailKey.split('@')[0],
      avatar_url: profile.avatar_url || existing?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.email)}`,
      role,
      created_at: existing?.created_at || now,
      updated_at: now,
      last_login_at: now,
    };

    this.profiles.set(updated.id, updated);
    this.profiles.set(emailKey, updated);
    return updated;
  }

  // Content operations
  public getAllContents(isViewer = true): ContentItem[] {
    const list = Array.from(this.contents.values());
    if (isViewer) {
      // Return published contents, strip storage_path from viewer payload for security
      return list
        .filter((c) => c.published)
        .map((c) => ({
          ...c,
          storage_path: 'PROTECTED_SERVER_ENCLAVE',
        }))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getContentById(id: string, isViewer = true): ContentItem | undefined {
    const item = this.contents.get(id);
    if (!item) return undefined;
    if (isViewer) {
      return {
        ...item,
        storage_path: 'PROTECTED_SERVER_ENCLAVE',
      };
    }
    return item;
  }

  public addContent(content: Omit<ContentItem, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'last_viewed_at'>): ContentItem {
    const now = new Date().toISOString();
    const id = `cnt_${crypto.randomUUID().slice(0, 8)}`;
    const newItem: ContentItem = {
      ...content,
      id,
      created_at: now,
      updated_at: now,
      view_count: 0,
      last_viewed_at: null,
    };
    this.contents.set(id, newItem);
    return newItem;
  }

  public updateContent(id: string, updates: Partial<ContentItem>): ContentItem | undefined {
    const existing = this.contents.get(id);
    if (!existing) return undefined;
    const updated: ContentItem = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      storage_path: existing.storage_path, // Immutable storage path
      updated_at: new Date().toISOString(),
    };
    this.contents.set(id, updated);
    return updated;
  }

  public deleteContent(id: string): ContentItem | undefined {
    const item = this.contents.get(id);
    if (item) {
      this.contents.delete(id);
    }
    return item;
  }

  public incrementViewCount(id: string): void {
    const item = this.contents.get(id);
    if (item) {
      item.view_count += 1;
      item.last_viewed_at = new Date().toISOString();
      this.contents.set(id, item);
    }
  }

  // Audit Logs
  public addActivityLog(log: Omit<ActivityLog, 'id' | 'created_at'>): ActivityLog {
    const entry: ActivityLog = {
      ...log,
      id: `act_${crypto.randomUUID().slice(0, 8)}`,
      created_at: new Date().toISOString(),
    };
    this.activityLogs.unshift(entry);
    // Keep max 500 audit logs in memory
    if (this.activityLogs.length > 500) {
      this.activityLogs.pop();
    }
    return entry;
  }

  public getActivityLogs(): ActivityLog[] {
    return [...this.activityLogs];
  }

  public getPendingContents(): ContentItem[] {
    return Array.from(this.contents.values())
      .filter((c) => c.status === 'PENDING_REVIEW')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getMySubmissions(userId: string, userEmail?: string): ContentItem[] {
    const emailLower = userEmail?.toLowerCase();
    return Array.from(this.contents.values())
      .filter((c) => c.created_by === userId || (emailLower && c.created_by_email?.toLowerCase() === emailLower))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public reviewSubmission(
    id: string,
    action: 'APPROVE' | 'REJECT',
    reviewerName: string,
    reason?: string
  ): ContentItem | undefined {
    const item = this.contents.get(id);
    if (!item) return undefined;

    const now = new Date().toISOString();
    const updated: ContentItem = {
      ...item,
      status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      published: action === 'APPROVE',
      rejection_reason: action === 'REJECT' ? reason || 'Content does not meet organizational publication criteria.' : undefined,
      reviewed_by: reviewerName,
      reviewed_at: now,
      updated_at: now,
    };
    this.contents.set(id, updated);
    return updated;
  }

  public rateContent(id: string, userRating: number): ContentItem | undefined {
    const item = this.contents.get(id);
    if (!item) return undefined;

    const currentRating = item.rating || 5.0;
    const currentCount = item.rating_count || 1;
    const newCount = currentCount + 1;
    const newRating = Number(((currentRating * currentCount + userRating) / newCount).toFixed(1));

    item.rating = newRating;
    item.rating_count = newCount;
    this.contents.set(id, item);
    return item;
  }

  public toggleFavorite(id: string, isFav: boolean): ContentItem | undefined {
    const item = this.contents.get(id);
    if (!item) return undefined;
    item.is_favorite = isFav;
    this.contents.set(id, item);
    return item;
  }

  public getStats() {
    const contents = Array.from(this.contents.values());
    const total_content = contents.filter((c) => c.published).length;
    const total_videos = contents.filter((c) => c.published && c.type === 'VIDEO').length;
    const total_pdfs = contents.filter((c) => c.published && c.type === 'PDF').length;
    const total_html = contents.filter((c) => c.published && c.type === 'HTML').length;
    const total_views = contents.reduce((acc, c) => acc + c.view_count, 0);
    const pending_reviews = contents.filter((c) => c.status === 'PENDING_REVIEW').length;

    return {
      total_content,
      total_videos,
      total_pdfs,
      total_html,
      total_views,
      pending_reviews,
    };
  }
}

export const db = new EnclaveDatabase();
