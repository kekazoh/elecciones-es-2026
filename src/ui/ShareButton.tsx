/**
 * Botón para compartir el resultado. Si el dispositivo permite compartir
 * archivos (móviles, sobre todo), abre el menú del sistema con la imagen, que
 * es la única forma de llegar a Instagram. Si no, muestra un panel con enlaces
 * a cada red, la imagen para descargar y el enlace para copiar.
 */
import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { createPortal } from 'react-dom';
import type { Report } from '../engine/report';
import { appUrl, renderShareImage, shareFileName, shareLinks, shareText } from './share';

export function ShareButton({ report, className, label = 'Compartir mi resultado' }: { report: Report; className?: string; label?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);

  // La imagen se prepara de antemano: Safari solo deja llamar a navigator.share
  // justo tras el toque, sin esperas de por medio.
  useEffect(() => {
    let alive = true;
    renderShareImage(report)
      .then((blob) => alive && setFile(new File([blob], shareFileName(report), { type: 'image/png' })))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [report]);

  const onClick = async () => {
    if (file && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: `${shareText(report)} ${appUrl()}` });
        return;
      } catch (e) {
        if ((e as DOMException).name === 'AbortError') return;
      }
    }
    setOpen(true);
  };

  return (
    <>
      <button className={className} onClick={onClick}>
        {label}
      </button>
      {open && createPortal(<ShareSheet report={report} file={file} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

function ShareSheet({ report, file, onClose }: { report: Report; file: File | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState<string>();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    closeRef.current?.focus();
    // En fase de captura, para que Escape no llegue también al resumen animado.
    const onKey = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText(report)} ${appUrl()}`);
      setCopied(true);
    } catch {
      window.prompt('Copia el enlace:', appUrl());
    }
  };

  const download = () => {
    if (!preview || !file) return;
    const a = document.createElement('a');
    a.href = preview;
    a.download = file.name;
    a.click();
  };

  // Los eventos de un portal suben por el árbol de React: que no lleguen al resumen.
  const stop = (e: SyntheticEvent) => e.stopPropagation();

  return (
    <div className="share-backdrop" onClick={onClose} onPointerDown={stop} onPointerUp={stop}>
      <div className="share-sheet" role="dialog" aria-modal="true" aria-labelledby="share-title" onClick={stop}>
        <div className="share-head">
          <h2 id="share-title">Comparte tu resultado</h2>
          <button ref={closeRef} className="share-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="share-body">
          {preview ? (
            <img className="share-preview" src={preview} alt={shareText(report)} />
          ) : (
            <div className="share-preview" aria-hidden="true" />
          )}
          <div className="share-options">
            <div className="share-links">
              {shareLinks(report).map((l) => (
                <a key={l.id} className={`share-link share-${l.id}`} href={l.href} target="_blank" rel="noreferrer">
                  {l.label}
                </a>
              ))}
            </div>
            <button className="share-action" onClick={download} disabled={!file}>
              Descargar imagen
            </button>
            <p className="share-hint">Para Instagram, descarga la imagen y súbela a tu historia.</p>
            <button className="share-action" onClick={copy}>
              {copied ? 'Enlace copiado' : 'Copiar enlace'}
            </button>
          </div>
        </div>
        <p className="share-privacy">La imagen se genera en tu navegador. No guardamos tus respuestas.</p>
      </div>
    </div>
  );
}
