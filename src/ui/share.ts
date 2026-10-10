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

type Ctx = CanvasRenderingContext2D;

/**
 * Estilo de texto. El estrechado y el espaciado entre letras se hacen a mano
 * (escalado horizontal y letra a letra) en vez de con `ctx.fontStretch` y
 * `ctx.letterSpacing`: Safari en iOS no los aplica igual al medir que al
 * dibujar y el nombre del partido acababa saliéndose de la imagen.
 */
interface TextStyle {
  weight: number;
  size: number;
  /** Factor de estrechado horizontal (1 = normal). */
  condense?: number;
  /** Espacio extra entre letras, en px. */
  track?: number;
}

function setFont(ctx: Ctx, s: TextStyle) {
  ctx.font = `${s.weight} ${s.size}px ${FONT}`;
}

/** Ancho sin estrechar, con el espaciado entre letras. */
function rawWidth(ctx: Ctx, text: string, s: TextStyle): number {
  setFont(ctx, s);
  if (!s.track) return ctx.measureText(text).width;
  const chars = [...text];
  return chars.reduce((w, ch) => w + ctx.measureText(ch).width, 0) + s.track * (chars.length - 1);
}

function measure(ctx: Ctx, text: string, s: TextStyle): number {
  return rawWidth(ctx, text, s) * (s.condense ?? 1);
}

/** Dibuja `text` sin pasar nunca de `maxWidth` (lo estrecha si hace falta). Devuelve el ancho final. */
function draw(ctx: Ctx, text: string, x: number, y: number, s: TextStyle, maxWidth = Infinity, align: 'left' | 'right' = 'left'): number {
  const raw = rawWidth(ctx, text, s);
  let sx = s.condense ?? 1;
  if (raw * sx > maxWidth) sx = maxWidth / raw;
  const w = raw * sx;
  ctx.save();
  ctx.translate(align === 'right' ? x - w : x, y);
  ctx.scale(sx, 1);
  ctx.textAlign = 'left';
  if (!s.track) ctx.fillText(text, 0, 0);
  else {
    let cx = 0;
    for (const ch of text) {
      ctx.fillText(ch, cx, 0);
      cx += ctx.measureText(ch).width + s.track;
    }
  }
  ctx.restore();
  return w;
}

/** Mayor tamaño (hasta `max`) con el que `text` cabe en `width`. */
function fitSize(ctx: Ctx, text: string, width: number, s: TextStyle): number {
  const w = measure(ctx, text, s);
  return w <= width ? s.size : Math.floor((s.size * width) / w);
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

  const inner = W - PAD * 2;
  const COND = 0.78;

  // Cabecera.
  ctx.fillStyle = fg;
  draw(ctx, 'BRÚJULA ELECTORAL', PAD, PAD + 30, { weight: 850, size: 34, condense: 0.9, track: 3 }, inner);
  ctx.fillRect(PAD, PAD + 54, inner, 4);

  // Etiqueta.
  let y = 400;
  const labelStyle = { weight: 750, size: 38, track: 5 };
  const label = 'MI PARTIDO MÁS AFÍN ES';
  const lw = Math.min(measure(ctx, label, labelStyle), inner - 36);
  ctx.fillRect(PAD, y - 50, lw + 36, 68);
  ctx.fillStyle = bg;
  draw(ctx, label, PAD + 18, y, labelStyle, lw);

  // Nombre del partido.
  const name = party.shortName.toUpperCase();
  const nameStyle = { weight: 900, size: 400, condense: COND };
  nameStyle.size = Math.min(400, fitSize(ctx, name, inner, nameStyle));
  y += 40 + nameStyle.size * 0.82;
  ctx.fillStyle = fg;
  draw(ctx, name, PAD, y, nameStyle, inner);

  if (party.name !== party.shortName) {
    const sub = { weight: 600, size: 40 };
    setFont(ctx, sub);
    ctx.globalAlpha = 0.85;
    for (const line of wrap(ctx, party.name, inner).slice(0, 2)) {
      y += 54;
      draw(ctx, line, PAD, y, sub, inner);
    }
    ctx.globalAlpha = 1;
  }

  // Porcentaje.
  y += 230;
  const score = `${pct(rec.affinity)}%`;
  const sw = draw(ctx, score, PAD - 6, y, { weight: 900, size: 230, condense: COND }, inner / 2);
  const small = { weight: 600, size: 44 };
  draw(ctx, 'de', PAD + sw + 24, y - 64, small, inner - sw - 24);
  draw(ctx, 'coincidencia', PAD + sw + 24, y - 12, small, inner - sw - 24);

  // Tarjeta con el podio.
  const podium = report.ranking.slice(0, 3);
  const cardTop = H - 700;
  const cardH = 140 + podium.length * 92;
  ctx.fillStyle = fg;
  ctx.fillRect(PAD + 16, cardTop + 16, inner, cardH);
  ctx.fillStyle = PAPER;
  ctx.fillRect(PAD, cardTop, inner, cardH);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.strokeRect(PAD, cardTop, inner, cardH);

  ctx.fillStyle = INK;
  draw(ctx, `MI PODIO · ${report.measuresRated} MEDIDAS VALORADAS`, PAD + 40, cardTop + 72, { weight: 750, size: 30, track: 4 }, inner - 80);

  const nameW = 200;
  const pctW = 130;
  const barX = PAD + 40 + nameW;
  const barMax = inner - 80 - nameW - pctW;
  const maxAff = Math.max(...podium.map((r) => r.affinity), 0.01);
  const rowStyle = { weight: 850, size: 46, condense: COND };
  podium.forEach((r, i) => {
    const rowY = cardTop + 130 + i * 92;
    ctx.fillStyle = INK;
    draw(ctx, r.party.shortName.toUpperCase(), PAD + 40, rowY + 46, rowStyle, nameW - 20);
    ctx.fillStyle = r.party.color;
    ctx.fillRect(barX, rowY + (i === 0 ? 0 : 8), Math.max(8, (barMax * r.affinity) / maxAff), i === 0 ? 62 : 46);
    ctx.fillStyle = INK;
    draw(ctx, `${pct(r.affinity)}%`, W - PAD - 40, rowY + 46, rowStyle, pctW - 10, 'right');
  });

  // Pie.
  ctx.fillStyle = fg;
  draw(ctx, '¿Y tú? Haz el test en', PAD, H - PAD - 70, { weight: 850, size: 52, condense: 0.9 }, inner);
  const host = appUrl().replace(/^https?:\/\//, '').replace(/\/$/, '');
  draw(ctx, host, PAD, H - PAD - 10, { weight: 600, size: 40 }, inner);

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
