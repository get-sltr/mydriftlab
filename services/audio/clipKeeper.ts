/**
 * ClipKeeper — manages the lifecycle of audio clip segments.
 *
 * During a recording session, AudioRecorder produces 5-minute segments.
 * ClipKeeper decides which to keep (segments with detected events) and
 * which to discard (clean segments with no events).
 *
 * Clips auto-delete after 10 days. Users can export/share before expiry.
 *
 * Storage layout:
 *   Paths.document/clips/{YYYY-MM-DD}_{sessionId}/
 *     segment_000.m4a
 *     segment_001.m4a
 *     manifest.json
 */

import { Paths, File, Directory } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const CLIPS_DIR_NAME = 'clips';
const MAX_AGE_DAYS = 10;

export interface SegmentMeta {
  file: string;
  startMs: number;
  endMs: number;
  eventIds: string[];
}

export interface ClipManifest {
  sessionId: string;
  date: string;
  segments: SegmentMeta[];
}

function getClipsDir(): Directory {
  return new Directory(Paths.document, CLIPS_DIR_NAME);
}

export class ClipKeeper {
  private sessionId: string;
  private date: string;
  private sessionDir: Directory;
  private segmentIndex = 0;
  private currentSegmentEventIds: string[] = [];
  private manifest: ClipManifest;

  constructor(sessionId: string, date: string) {
    this.sessionId = sessionId;
    this.date = date;
    this.sessionDir = new Directory(
      getClipsDir(),
      `${date}_${sessionId}`,
    );
    this.manifest = { sessionId, date, segments: [] };
  }

  async init(): Promise<void> {
    try {
      const clipsDir = getClipsDir();
      if (!clipsDir.exists) {
        clipsDir.create({ intermediates: true });
      }
      if (!this.sessionDir.exists) {
        this.sessionDir.create({ intermediates: true });
      }
    } catch {
      // Best effort
    }
  }

  /** Mark the current in-progress segment as having an event worth keeping. */
  flagCurrentSegment(eventId: string): void {
    this.currentSegmentEventIds.push(eventId);
  }

  /**
   * Called when AudioRecorder finishes a segment.
   * Moves flagged segments to permanent storage, deletes clean ones.
   */
  async receiveSegment(
    uri: string,
    startMs: number,
    endMs: number,
  ): Promise<void> {
    const hasFlaggedEvents = this.currentSegmentEventIds.length > 0;

    if (hasFlaggedEvents) {
      const filename = `segment_${String(this.segmentIndex).padStart(3, '0')}.m4a`;
      const srcFile = new File(uri);
      const destFile = new File(this.sessionDir, filename);

      try {
        srcFile.move(destFile);
      } catch {
        // If move fails, try copy then delete
        try {
          srcFile.copy(destFile);
          srcFile.delete();
        } catch {
          // Best effort
        }
      }

      this.manifest.segments.push({
        file: filename,
        startMs,
        endMs,
        eventIds: [...this.currentSegmentEventIds],
      });
    } else {
      // Clean segment — discard it
      try {
        const srcFile = new File(uri);
        if (srcFile.exists) srcFile.delete();
      } catch {
        // Best effort
      }
    }

    this.segmentIndex++;
    this.currentSegmentEventIds = [];
  }

  /** Finalize the session: write manifest. Call after the last segment. */
  async finalize(): Promise<void> {
    if (this.manifest.segments.length > 0) {
      try {
        const manifestFile = new File(this.sessionDir, 'manifest.json');
        manifestFile.create({ intermediates: true, overwrite: true });
        manifestFile.write(JSON.stringify(this.manifest, null, 2));
      } catch {
        // Best effort
      }
    } else {
      // No clips kept — remove the empty session directory
      try {
        if (this.sessionDir.exists) this.sessionDir.delete();
      } catch {
        // Best effort
      }
    }
  }

  // ── Static methods ────────────────────────────────────────────

  /** Delete all clip folders older than MAX_AGE_DAYS. Run on app launch. */
  static async cleanup(): Promise<void> {
    try {
      const clipsDir = getClipsDir();
      if (!clipsDir.exists) return;

      const entries = clipsDir.list();
      const now = Date.now();
      const maxAgeMs = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

      for (const entry of entries) {
        if (!(entry instanceof Directory)) continue;
        // Folder format: YYYY-MM-DD_sessionId
        const dateStr = entry.name.split('_')[0];
        const folderDate = new Date(dateStr).getTime();

        if (!isNaN(folderDate) && now - folderDate > maxAgeMs) {
          try {
            entry.delete();
          } catch {
            // Skip individual deletion failures
          }
        }
      }
    } catch {
      // Non-critical — silently ignore cleanup failures
    }
  }

  /** Share/export a clip file via the native share sheet. */
  static async exportClip(filePath: string): Promise<void> {
    const available = await Sharing.isAvailableAsync();
    if (!available) return;
    await Sharing.shareAsync(filePath, {
      mimeType: 'audio/mp4',
      UTI: 'public.mpeg-4-audio',
    });
  }

  /** Get all clips for a given session. */
  static async getClipsForSession(
    sessionId: string,
  ): Promise<ClipManifest | null> {
    try {
      const clipsDir = getClipsDir();
      if (!clipsDir.exists) return null;

      const entries = clipsDir.list();
      const match = entries.find(
        (e): e is Directory =>
          e instanceof Directory && e.name.includes(sessionId),
      );
      if (!match) return null;

      const manifestFile = new File(match, 'manifest.json');
      if (!manifestFile.exists) return null;

      const raw = await manifestFile.text();
      const manifest: ClipManifest = JSON.parse(raw);

      // Resolve full file URIs
      manifest.segments = manifest.segments.map((seg) => ({
        ...seg,
        file: new File(match, seg.file).uri,
      }));

      return manifest;
    } catch {
      return null;
    }
  }

  /** Total bytes used by all clip folders. */
  static async getStorageUsage(): Promise<number> {
    try {
      const clipsDir = getClipsDir();
      if (!clipsDir.exists) return 0;
      return clipsDir.size ?? 0;
    } catch {
      return 0;
    }
  }

  /** Days remaining before a session's clips expire. */
  static daysUntilExpiry(sessionDate: string): number {
    const created = new Date(sessionDate).getTime();
    const expiresAt = created + MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    const remaining = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
    return Math.max(0, remaining);
  }
}
