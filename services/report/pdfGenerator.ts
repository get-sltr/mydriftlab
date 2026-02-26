/**
 * PDF Report Generator — creates comprehensive sleep reports for doctor sharing.
 *
 * Uses expo-print to render HTML → PDF, then expo-sharing to share.
 * The report is designed to be clinical-grade: clear data presentation,
 * proper units, severity scales, and medical disclaimers.
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Paths, File, Directory } from 'expo-file-system';
import type {
  SleepSession,
  EnvironmentEvent,
  Insight,
  BreathTrendSummary,
  SleepEfficiencyData,
  CBTIProgram,
} from '../../lib/types';
import { eventCategories } from '../../lib/eventCategories';

export interface ReportData {
  session: SleepSession;
  events: EnvironmentEvent[];
  restScore: number;
  summary: string;
  insights: Insight[];
  breathTrend: BreathTrendSummary | null;
  sleepEfficiency: SleepEfficiencyData | null;
  cbtiProgram: CBTIProgram | null;
  userName?: string;
}

/** Generate a PDF file and return the local file URI. */
export async function generatePdf(data: ReportData): Promise<string> {
  const html = buildHtml(data);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  // Move to a friendlier filename in our report directory
  const reportsDir = new Directory(Paths.document, 'reports');
  if (!reportsDir.exists) {
    reportsDir.create({ intermediates: true });
  }

  const dateStr = data.session.startedAt.split('T')[0];
  const filename = `MyDriftLAB_Report_${dateStr}.pdf`;
  const dest = new File(reportsDir, filename);

  try {
    const src = new File(uri);
    if (dest.exists) dest.delete();
    src.move(dest);
    return dest.uri;
  } catch {
    // If move fails, return the original URI
    return uri;
  }
}

/** Generate PDF and open the native share sheet. */
export async function shareReport(data: ReportData): Promise<void> {
  const pdfUri = await generatePdf(data);
  const available = await Sharing.isAvailableAsync();
  if (!available) return;
  await Sharing.shareAsync(pdfUri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Share Sleep Report',
  });
}

// ── HTML Builder ──────────────────────────────────────────────

function buildHtml(data: ReportData): string {
  const {
    session,
    events,
    restScore,
    summary,
    insights,
    breathTrend,
    sleepEfficiency,
    cbtiProgram,
    userName,
  } = data;

  const startDate = new Date(session.startedAt);
  const endDate = session.endedAt ? new Date(session.endedAt) : null;

  const durationMs = endDate
    ? endDate.getTime() - startDate.getTime()
    : 0;
  const durationMin = Math.round(durationMs / 60000);
  const hours = Math.floor(durationMin / 60);
  const mins = durationMin % 60;

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  // Group events by category
  const grouped: Record<string, EnvironmentEvent[]> = {};
  for (const evt of events) {
    if (!grouped[evt.category]) grouped[evt.category] = [];
    grouped[evt.category].push(evt);
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
      color: #1a1a2e;
      line-height: 1.5;
      padding: 40px;
      font-size: 12px;
    }
    .header {
      border-bottom: 3px solid #B8A0D2;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header h1 {
      font-size: 22px;
      color: #1a1a2e;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .header .subtitle {
      font-size: 13px;
      color: #666;
    }
    .header .date-line {
      font-size: 14px;
      color: #333;
      margin-top: 8px;
    }
    .patient-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      font-size: 12px;
      color: #555;
    }

    /* Score section */
    .score-section {
      display: flex;
      align-items: center;
      gap: 24px;
      background: #f8f6fc;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .score-ring {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 5px solid ${scoreColor(restScore)};
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .score-value {
      font-size: 28px;
      font-weight: 700;
      color: ${scoreColor(restScore)};
    }
    .score-details h3 {
      font-size: 16px;
      margin-bottom: 4px;
    }
    .score-details p {
      font-size: 12px;
      color: #555;
    }

    /* Duration bar */
    .duration-bar {
      display: flex;
      justify-content: space-between;
      background: #f4f4f8;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
      font-size: 13px;
    }
    .duration-bar strong { color: #1a1a2e; }

    /* Cards */
    .card {
      background: #fafafa;
      border: 1px solid #e8e8ec;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .card h2 {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #B8A0D2;
      margin-bottom: 12px;
      border-bottom: 1px solid #eee;
      padding-bottom: 6px;
    }

    /* Summary */
    .summary-text {
      font-size: 13px;
      color: #333;
      line-height: 1.6;
    }

    /* Efficiency */
    .efficiency-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .eff-item {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .eff-label { color: #666; font-size: 12px; }
    .eff-value { font-weight: 600; font-size: 12px; }
    .eff-main {
      text-align: center;
      padding: 12px;
      margin-bottom: 12px;
    }
    .eff-main .big-number {
      font-size: 36px;
      font-weight: 700;
    }
    .eff-main .unit {
      font-size: 13px;
      color: #666;
    }

    /* BDI */
    .bdi-section {
      display: flex;
      gap: 20px;
      align-items: flex-start;
    }
    .bdi-score {
      text-align: center;
      min-width: 80px;
    }
    .bdi-score .big-number {
      font-size: 32px;
      font-weight: 700;
    }
    .bdi-score .severity {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
      margin-top: 4px;
    }
    .severity-normal { background: #e6f5f0; color: #2a8f6e; }
    .severity-mild { background: #fef3e2; color: #b8860b; }
    .severity-moderate { background: #fce8e8; color: #c44; }
    .severity-severe { background: #f5d0d0; color: #a22; }
    .bdi-details { flex: 1; }
    .bdi-metric {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 12px;
      border-bottom: 1px solid #f5f5f5;
    }

    /* Movement timeline */
    .timeline-row {
      display: flex;
      height: 12px;
      border-radius: 6px;
      overflow: hidden;
      margin: 12px 0 8px;
    }
    .timeline-band { flex: 1; }
    .legend-row {
      display: flex;
      gap: 16px;
      justify-content: center;
      font-size: 10px;
      color: #888;
    }
    .legend-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 4px;
      margin-right: 4px;
      vertical-align: middle;
    }

    /* Event table */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    th {
      text-align: left;
      padding: 8px 6px;
      border-bottom: 2px solid #e0e0e0;
      color: #555;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.3px;
    }
    td {
      padding: 6px;
      border-bottom: 1px solid #f0f0f0;
    }
    .cat-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 4px;
      margin-right: 6px;
      vertical-align: middle;
    }
    .category-summary {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .cat-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #f4f4f8;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
    }
    .cat-count {
      font-weight: 600;
    }

    /* Insights */
    .insight-item {
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .insight-item:last-child { border-bottom: none; }
    .insight-title {
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 2px;
    }
    .insight-body {
      font-size: 12px;
      color: #555;
    }

    /* CBT-I */
    .cbti-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 12px;
    }

    /* Disclaimer */
    .disclaimer {
      background: #fff5f5;
      border: 1px solid #f0d0d0;
      border-radius: 8px;
      padding: 14px;
      margin-top: 20px;
      font-size: 11px;
      color: #666;
      line-height: 1.5;
    }
    .disclaimer h3 {
      font-size: 12px;
      color: #c44;
      margin-bottom: 6px;
    }

    /* Footer */
    .footer {
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px solid #ddd;
      font-size: 10px;
      color: #999;
      text-align: center;
    }

    @media print {
      body { padding: 20px; }
      .card { break-inside: avoid; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <h1>MyDriftLAB Sleep Report</h1>
    <div class="subtitle">Comprehensive overnight sleep environment analysis</div>
    <div class="date-line">${formatDate(startDate)}</div>
  </div>

  ${userName ? `<div class="patient-info"><span>Patient: ${escapeHtml(userName)}</span><span>Report generated: ${formatDate(new Date())}</span></div>` : `<div class="patient-info"><span></span><span>Report generated: ${formatDate(new Date())}</span></div>`}

  <!-- Rest Score -->
  <div class="score-section">
    <div class="score-ring">
      <span class="score-value">${restScore}</span>
    </div>
    <div class="score-details">
      <h3>Rest Score: ${scoreLabel(restScore)}</h3>
      <p>${summary}</p>
    </div>
  </div>

  <!-- Duration -->
  <div class="duration-bar">
    <span><strong>Duration:</strong> ${hours}h ${String(mins).padStart(2, '0')}m</span>
    <span><strong>Bedtime:</strong> ${formatTime(startDate)}</span>
    <span><strong>Wake:</strong> ${endDate ? formatTime(endDate) : '--'}</span>
  </div>

  ${buildEfficiencySection(sleepEfficiency)}

  ${buildBreathTrendSection(breathTrend)}

  ${buildEventSection(events, grouped)}

  ${buildInsightsSection(insights)}

  ${buildCbtiSection(cbtiProgram)}

  <!-- Disclaimer -->
  <div class="disclaimer">
    <h3>Medical Disclaimer</h3>
    <p>
      This report is generated by MyDriftLAB, a consumer sleep monitoring application.
      Data is collected using the phone's built-in sensors (microphone, ambient light, barometer)
      and optional ultrasonic contactless tracking. This is <strong>not</strong> a medical device
      and has not been cleared by the FDA or any regulatory body.
    </p>
    <p style="margin-top: 6px;">
      The Breathing Disturbance Index (BDI) is an audio-derived estimate and is
      <strong>not equivalent to the Apnea-Hypopnea Index (AHI)</strong> from clinical
      polysomnography. Sleep efficiency data is derived from contactless movement detection,
      not EEG-based sleep staging.
    </p>
    <p style="margin-top: 6px;">
      This report is intended for informational purposes only and should not be used as a
      sole basis for clinical decisions. Always consult a qualified healthcare provider for
      diagnosis and treatment of sleep disorders.
    </p>
  </div>

  <div class="footer">
    MyDriftLAB &mdash; mydriftlab.com &mdash; Sleep Environment Intelligence
  </div>

</body>
</html>`;
}

// ── Section Builders ──────────────────────────────────────────

function buildEfficiencySection(eff: SleepEfficiencyData | null): string {
  if (!eff || eff.totalTimeInBedMinutes <= 0) return '';

  const effColor =
    eff.sleepEfficiency >= 85
      ? '#2a8f6e'
      : eff.sleepEfficiency >= 70
        ? '#b8860b'
        : '#c44';

  const fmtMin = (m: number) => {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return h > 0 ? `${h}h ${min}m` : `${min}m`;
  };

  // Build timeline HTML from movement data
  let timelineHtml = '';
  if (eff.movementTimeline.length > 0) {
    const samples = eff.movementTimeline.slice(-80);
    const bands = samples
      .map((s) => {
        const color =
          s.sleepState === 'deep'
            ? '#B8A0D2'
            : s.sleepState === 'light'
              ? '#d4c8e6'
              : '#D4858A';
        return `<div class="timeline-band" style="background:${color}"></div>`;
      })
      .join('');
    timelineHtml = `
      <div class="timeline-row">${bands}</div>
      <div class="legend-row">
        <span><span class="legend-dot" style="background:#B8A0D2"></span>Deep</span>
        <span><span class="legend-dot" style="background:#d4c8e6"></span>Light</span>
        <span><span class="legend-dot" style="background:#D4858A"></span>Awake</span>
      </div>
    `;
  }

  return `
  <div class="card">
    <h2>Sleep Efficiency</h2>
    <div class="eff-main">
      <div class="big-number" style="color:${effColor}">${eff.sleepEfficiency}%</div>
      <div class="unit">Sleep Efficiency</div>
    </div>
    <div class="efficiency-grid">
      <div class="eff-item"><span class="eff-label">Total Time in Bed</span><span class="eff-value">${fmtMin(eff.totalTimeInBedMinutes)}</span></div>
      <div class="eff-item"><span class="eff-label">Total Sleep Time</span><span class="eff-value">${fmtMin(eff.totalSleepMinutes)}</span></div>
      <div class="eff-item"><span class="eff-label">Sleep Onset Latency</span><span class="eff-value">${eff.sleepOnsetLatencyMinutes}m</span></div>
      <div class="eff-item"><span class="eff-label">Wake After Sleep Onset</span><span class="eff-value">${eff.wakeAfterSleepOnsetMinutes}m</span></div>
    </div>
    ${timelineHtml}
  </div>`;
}

function buildBreathTrendSection(bt: BreathTrendSummary | null): string {
  if (!bt || bt.recordingHours <= 0) return '';

  const severityClass = `severity-${bt.bdiSeverity}`;

  return `
  <div class="card">
    <h2>Breathing Analysis</h2>
    <div class="bdi-section">
      <div class="bdi-score">
        <div class="big-number" style="color:${bdiColor(bt.bdiSeverity)}">${bt.bdi}</div>
        <div>BDI</div>
        <span class="severity ${severityClass}">${bt.bdiSeverity}</span>
      </div>
      <div class="bdi-details">
        <div class="bdi-metric"><span>Average Breathing Rate</span><span>${bt.avgBreathingRate} bpm</span></div>
        <div class="bdi-metric"><span>Min Breathing Rate</span><span>${bt.minBreathingRate} bpm</span></div>
        <div class="bdi-metric"><span>Max Breathing Rate</span><span>${bt.maxBreathingRate} bpm</span></div>
        <div class="bdi-metric"><span>Breathing Regularity</span><span>${Math.round(bt.avgRegularity * 100)}%</span></div>
        <div class="bdi-metric"><span>Total Disturbances</span><span>${bt.disturbanceCount}</span></div>
        <div class="bdi-metric"><span>Disturbance Duration</span><span>${bt.disturbanceMinutes}m</span></div>
        <div class="bdi-metric"><span>Recording Duration</span><span>${bt.recordingHours.toFixed(1)} hours</span></div>
      </div>
    </div>
    <p style="font-size:11px; color:#888; margin-top:12px; font-style:italic;">
      BDI (Breathing Disturbance Index) counts breathing irregularities per hour.
      Scale: 0-5 normal, 5-15 mild, 15-30 moderate, 30+ severe.
      This is an audio-derived estimate, not a clinical AHI measurement.
    </p>
  </div>`;
}

function buildEventSection(
  events: EnvironmentEvent[],
  grouped: Record<string, EnvironmentEvent[]>,
): string {
  if (events.length === 0) return '';

  // Category summary badges
  const badges = Object.entries(grouped)
    .sort(([, a], [, b]) => b.length - a.length)
    .map(([cat, catEvents]) => {
      const info = eventCategories[cat];
      const color = categoryColor(cat);
      return `<div class="cat-badge">
        <span class="cat-dot" style="background:${color}"></span>
        ${info?.label ?? cat}
        <span class="cat-count">${catEvents.length}</span>
      </div>`;
    })
    .join('');

  // Event table rows
  const rows = events
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )
    .map((evt) => {
      const time = new Date(evt.timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      });
      const info = eventCategories[evt.category];
      const color = categoryColor(evt.category);
      const db =
        evt.decibelLevel != null ? `${evt.decibelLevel.toFixed(0)} dB` : '--';
      const dur =
        evt.durationSeconds > 0 ? `${evt.durationSeconds}s` : '--';
      return `<tr>
        <td>${time}</td>
        <td><span class="cat-dot" style="background:${color}"></span>${info?.label ?? evt.category}</td>
        <td>${evt.type}</td>
        <td>${db}</td>
        <td>${dur}</td>
      </tr>`;
    })
    .join('');

  return `
  <div class="card">
    <h2>Event Breakdown (${events.length} total)</h2>
    <div class="category-summary">${badges}</div>
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Category</th>
          <th>Type</th>
          <th>Level</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function buildInsightsSection(insights: Insight[]): string {
  if (insights.length === 0) return '';

  const items = insights
    .map(
      (ins) => `
      <div class="insight-item">
        <div class="insight-title">${escapeHtml(ins.title)}</div>
        <div class="insight-body">${escapeHtml(ins.body)}</div>
      </div>`,
    )
    .join('');

  return `
  <div class="card">
    <h2>Insights &amp; Recommendations</h2>
    ${items}
  </div>`;
}

function buildCbtiSection(program: CBTIProgram | null): string {
  if (!program || program.status !== 'active') return '';

  return `
  <div class="card">
    <h2>Insomnia Fighter (CBT-I) Program</h2>
    <div class="cbti-row"><span>Status</span><span>Active — Week ${program.currentWeek} of 6</span></div>
    <div class="cbti-row"><span>Baseline Sleep Efficiency</span><span>${program.baselineSleepEfficiency}%</span></div>
    <div class="cbti-row"><span>Current Sleep Efficiency</span><span>${program.currentSleepEfficiency}%</span></div>
    <div class="cbti-row"><span>Prescribed Bedtime</span><span>${program.prescribedBedtime}</span></div>
    <div class="cbti-row"><span>Prescribed Wake Time</span><span>${program.prescribedWakeTime}</span></div>
    <div class="cbti-row"><span>Time in Bed Allowed</span><span>${Math.floor(program.timeInBedMinutes / 60)}h ${program.timeInBedMinutes % 60}m</span></div>
    <div class="cbti-row"><span>Diary Entries</span><span>${program.sleepDiary.length}</span></div>
  </div>`;
}

// ── Helpers ──────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function scoreColor(score: number): string {
  if (score >= 80) return '#B8A0D2';
  if (score >= 60) return '#666';
  if (score >= 40) return '#D4858A';
  return '#D4604A';
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Great Night';
  if (score >= 60) return 'Decent Night';
  if (score >= 40) return 'Rough Night';
  return 'Difficult Night';
}

function bdiColor(severity: string): string {
  switch (severity) {
    case 'normal':
      return '#2a8f6e';
    case 'mild':
      return '#b8860b';
    case 'moderate':
      return '#c44';
    case 'severe':
      return '#a22';
    default:
      return '#666';
  }
}

function categoryColor(category: string): string {
  const map: Record<string, string> = {
    noise: '#D4604A',
    climate: '#D4BA6A',
    temperature: '#D4BA6A',
    light: '#7B8FD4',
    humidity: '#6B9FD4',
    partner: '#6BADA0',
    snoring: '#C47ED4',
  };
  return map[category] ?? '#999';
}
