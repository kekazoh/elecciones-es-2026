/**
 * Compartir el resultado. Todo ocurre en el navegador: la imagen se dibuja en
 * un <canvas> y se entrega al sistema (Web Share API) o se descarga; nunca se
 * envía nada a un servidor nuestro.
 */
import type { Report } from '../engine/report';
import { INK, PAPER, textOn } from './colors';

/** Dirección pública de la app, sin la ruta de una preview de PR (`/pr-<n>/`). */
export function appUrl(): string {
  return new URL(import.meta.env.BASE_URL.replace(/pr-\d+\/$/, ''), window.location.origin).href;
}

const pct = (x: number) => Math.round(x * 100);

export function shareText(report: Report): string {
  const rec = report.recommended;
  return `Mi partido más afín en la Brújula electoral es ${rec.party.shortName}, con un ${pct(rec.affinity)} % de coincidencia. ¿Y el tuyo?`;
}

export interface ShareLink {
  id: string;
  label: string;
  href: string;
}

export function shareLinks(report: Report): ShareLink[] {
  const text = shareText(report);
  const url = appUrl();
  const q = encodeURIComponent;
  return [
    { id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${q(`${text} ${url}`)}` },
    { id: 'telegram', label: 'Telegram', href: `https://t.me/share/url?url=${q(url)}&text=${q(text)}` },
    { id: 'x', label: 'X', href: `https://x.com/intent/post?text=${q(text)}&url=${q(url)}` },
    { id: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${q(url)}` },
  ];
}

// --- Imagen ---------------------------------------------------------------

/** Formato historia (9:16): es el que mejor encaja en Instagram y WhatsApp. */
const W = 1080;
const H = 1920;
const PAD = 90;
const FONT = '"Archivo Variable", Archivo, system-ui, sans-serif';

type Ctx = CanvasRenderingContext2D & { letterSpacing?: string; fontStretch?: string };

function setFont(ctx: Ctx, weight: number, size: number, stretch: 'normal' | 'condensed' | 'extra-condensed' = 'normal') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  if ('fontStretch' in ctx) ctx.fontStretch = stretch;
}

function setSpacing(ctx: Ctx, px: number) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`;
}

/** Mayor tamaño (hasta `max`) con el que `text` cabe en `width`. */
function fitSize(ctx: Ctx, text: string, width: number, max: number, weight: number, stretch: 'normal' | 'extra-condensed') {
  setFont(ctx, weight, max, stretch);
  const w = ctx.measureText(text).width;
  return w <= width ? max : Math.floor((max * width) / w);
}

function wrap(ctx: Ctx, text: string, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function withAlpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export async function renderShareImage(report: Report): Promise<Blob> {
  // El canvas no espera a las fuentes web: hay que cargarlas antes de dibujar.
  await Promise.all(
    ['900', '850', '750', '600'].map((w) => document.fonts?.load(`${w} 100px ${FONT}`).catch(() => undefined)),
  );

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d') as Ctx | null;
  if (!ctx) throw new Error('Canvas no disponible');

  const rec = report.recommended;
  const party = rec.party;
  const bg = party.color;
  const fg = textOn(bg);
  ctx.textBaseline = 'alphabetic';

  // Fondo y rayos que salen de la esquina (como la diapositiva de la revelación).
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.translate(W, 0);
  ctx.fillStyle = withAlpha(fg, 0.06);
  for (let k = 0; k < 9; k++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const a0 = Math.PI / 2 + (k * Math.PI) / 18;
    const a1 = a0 + Math.PI / 36;
    ctx.lineTo(Math.cos(a0) * H * 2, Math.sin(a0) * H * 2);
    ctx.lineTo(Math.cos(a1) * H * 2, Math.sin(a1) * H * 2);
    ctx.fill();
  }
  ctx.restore();

  // Cabecera.
  ctx.fillStyle = fg;
  setFont(ctx, 850, 34, 'condensed');
  setSpacing(ctx, 3);
  ctx.fillText('BRÚJULA ELECTORAL', PAD, PAD + 30);
  ctx.fillRect(PAD, PAD + 54, W - PAD * 2, 4);

  // Etiqueta.
  let y = 400;
  setFont(ctx, 750, 38);
  setSpacing(ctx, 5);
  const label = 'MI PARTIDO MÁS AFÍN ES';
  const lw = ctx.measureText(label).width;
  ctx.fillStyle = fg;
  ctx.fillRect(PAD, y - 50, lw + 36, 68);
  ctx.fillStyle = bg;
  ctx.fillText(label, PAD + 18, y);

  // Nombre del partido.
  setSpacing(ctx, 0);
  const name = party.shortName.toUpperCase();
  const size = fitSize(ctx, name, W - PAD * 2, 400, 900, 'extra-condensed');
  y += 40 + size * 0.82;
  ctx.fillStyle = fg;
  ctx.fillText(name, PAD - size * 0.03, y);

  if (party.name !== party.shortName) {
    setFont(ctx, 600, 40);
    ctx.globalAlpha = 0.85;
    for (const line of wrap(ctx, party.name, W - PAD * 2).slice(0, 2)) {
      y += 54;
      ctx.fillText(line, PAD, y);
    }
    ctx.globalAlpha = 1;
  }

  // Porcentaje.
  y += 230;
  setFont(ctx, 900, 230, 'extra-condensed');
  const score = `${pct(rec.affinity)}%`;
  ctx.fillText(score, PAD - 6, y);
  const sw = ctx.measureText(score).width;
  setFont(ctx, 600, 44);
  ctx.fillText('de', PAD + sw + 24, y - 64);
  ctx.fillText('coincidencia', PAD + sw + 24, y - 12);

  // Tarjeta con el podio.
  const podium = report.ranking.slice(0, 3);
  const cardTop = H - 700;
  const cardH = 140 + podium.length * 92;
  ctx.fillStyle = fg;
  ctx.fillRect(PAD + 16, cardTop + 16, W - PAD * 2, cardH);
  ctx.fillStyle = PAPER;
  ctx.fillRect(PAD, cardTop, W - PAD * 2, cardH);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.strokeRect(PAD, cardTop, W - PAD * 2, cardH);

  ctx.fillStyle = INK;
  setFont(ctx, 750, 30);
  setSpacing(ctx, 4);
  ctx.fillText(`MI PODIO · ${report.measuresRated} MEDIDAS VALORADAS`, PAD + 40, cardTop + 72);
  setSpacing(ctx, 0);

  const nameW = 200;
  const pctW = 130;
  const barX = PAD + 40 + nameW;
  const barMax = W - PAD * 2 - 80 - nameW - pctW;
  const maxAff = Math.max(...podium.map((r) => r.affinity), 0.01);
  podium.forEach((r, i) => {
    const rowY = cardTop + 130 + i * 92;
    ctx.fillStyle = INK;
    setFont(ctx, 850, fitSize(ctx, r.party.shortName.toUpperCase(), nameW - 20, 46, 850, 'extra-condensed'), 'extra-condensed');
    ctx.fillText(r.party.shortName.toUpperCase(), PAD + 40, rowY + 46);
    ctx.fillStyle = r.party.color;
    ctx.fillRect(barX, rowY + (i === 0 ? 0 : 8), Math.max(8, (barMax * r.affinity) / maxAff), i === 0 ? 62 : 46);
    ctx.fillStyle = INK;
    setFont(ctx, 850, 46, 'extra-condensed');
    ctx.textAlign = 'right';
    ctx.fillText(`${pct(r.affinity)}%`, W - PAD - 40, rowY + 46);
    ctx.textAlign = 'left';
  });

  // Pie.
  ctx.fillStyle = fg;
  setFont(ctx, 850, 52, 'condensed');
  ctx.fillText('¿Y tú? Haz el test en', PAD, H - PAD - 70);
  setFont(ctx, 600, 40);
  const host = appUrl().replace(/^https?:\/\//, '').replace(/\/$/, '');
  ctx.fillText(host, PAD, H - PAD - 10);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo generar la imagen'))), 'image/png'),
  );
}

export function shareFileName(report: Report): string {
  const slug = report.recommended.party.shortName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase();
  return `brujula-electoral-${slug}.png`;
}
