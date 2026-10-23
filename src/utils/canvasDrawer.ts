import { DetectedObject, DetectionSettings } from '../types/detection';
import { getObjectClassColor } from './colors';

export interface DrawOptions {
  width: number;
  height: number;
  highlightCategory?: string | null;
  settings: DetectionSettings;
  searchFilter?: string;
  isCapturing?: boolean;
}

export function drawDetections(
  ctx: CanvasRenderingContext2D,
  detections: DetectedObject[],
  options: DrawOptions
) {
  const { width, height, highlightCategory, settings, searchFilter, isCapturing } = options;

  ctx.clearRect(0, 0, width, height);

  if (!settings.showBoxes && !isCapturing) {
    return;
  }

  const query = (searchFilter || '').trim().toLowerCase();

  detections.forEach((item) => {
    const isFiltered = query.length > 0 && !item.class.toLowerCase().includes(query);
    if (isFiltered) return;

    const isHighlighted =
      highlightCategory && item.class.toLowerCase() === highlightCategory.toLowerCase();
    const isDimmed = highlightCategory && !isHighlighted;

    const [bx, by, bw, bh] = item.bbox;
    // Clamp to canvas bounds
    const x = Math.max(0, Math.min(bx, width - 2));
    const y = Math.max(0, Math.min(by, height - 2));
    const w = Math.min(bw, width - x);
    const h = Math.min(bh, height - y);

    const colorConfig = getObjectClassColor(item.class);
    const color = isDimmed ? 'rgba(148, 163, 184, 0.3)' : colorConfig.hex;
    const alpha = isDimmed ? 0.25 : 1.0;

    ctx.save();
    ctx.globalAlpha = alpha;

    // 1. Box Interior Fill
    if (!isDimmed) {
      ctx.fillStyle = isHighlighted
        ? colorConfig.bg.replace('0.15', '0.28')
        : colorConfig.bg;
      ctx.fillRect(x, y, w, h);
    }

    // 2. Box Border or Tech Brackets
    ctx.strokeStyle = color;
    ctx.lineWidth = isHighlighted ? 2.5 : 2;

    if (settings.boxStyle === 'tech-brackets') {
      // Draw subtle bounding outline
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = isDimmed ? 'rgba(148, 163, 184, 0.2)' : `${color}66`;
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]); // Reset to solid for brackets

      // Corner brackets (L-shapes)
      const bracketLen = Math.min(18, w / 3, h / 3);
      ctx.strokeStyle = color;
      ctx.lineWidth = isHighlighted ? 3 : 2.5;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(x, y + bracketLen);
      ctx.lineTo(x, y);
      ctx.lineTo(x + bracketLen, y);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(x + w - bracketLen, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + bracketLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(x, y + h - bracketLen);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + bracketLen, y + h);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(x + w - bracketLen, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h - bracketLen);
      ctx.stroke();
    } else if (settings.boxStyle === 'minimal') {
      ctx.strokeRect(x, y, w, h);
    } else {
      // Classic smooth rectangle with outer soft glow
      if (isHighlighted) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
      }
      ctx.strokeRect(x, y, w, h);
      ctx.shadowBlur = 0;
    }

    // 3. Label Badge
    if (settings.showLabels || isCapturing) {
      const scorePct = Math.round(item.score * 100);
      const labelText = `${item.class} ${scorePct}%`;

      ctx.font = '600 12px "JetBrains Mono", monospace';
      const textMetrics = ctx.measureText(labelText);
      const textWidth = textMetrics.width;
      const tagHeight = 22;
      const tagWidth = textWidth + 14;

      // Position tag above box, or flip inside if near top edge
      let tagX = x;
      let tagY = y - tagHeight;
      if (tagY < 4) {
        tagY = y + 2;
      }
      if (tagX + tagWidth > width) {
        tagX = Math.max(0, width - tagWidth);
      }

      // Tag background
      ctx.fillStyle = isDimmed ? 'rgba(15, 23, 42, 0.7)' : 'rgba(10, 15, 29, 0.92)';
      ctx.fillRect(tagX, tagY, tagWidth, tagHeight);

      // Tag left accent bar
      ctx.fillStyle = color;
      ctx.fillRect(tagX, tagY, 3, tagHeight);

      // Tag text
      ctx.fillStyle = isDimmed ? 'rgba(203, 213, 225, 0.6)' : '#f8fafc';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, tagX + 8, tagY + tagHeight / 2 + 1);
    }

    ctx.restore();
  });

  // If capturing snapshot, draw metadata stamp on bottom-right
  if (isCapturing) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const banner = `VisionScan AI · ${detections.length} objects · ${timeStr}`;

    ctx.save();
    ctx.font = '500 13px "JetBrains Mono", monospace';
    const textW = ctx.measureText(banner).width;
    const pad = 8;

    ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
    ctx.fillRect(width - textW - pad * 2 - 12, height - 32, textW + pad * 2, 24);

    ctx.fillStyle = '#06b6d4';
    ctx.fillText(banner, width - textW - pad - 12, height - 16);
    ctx.restore();
  }
}
