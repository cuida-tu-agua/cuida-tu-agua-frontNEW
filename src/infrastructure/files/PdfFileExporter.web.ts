import { AppError } from '../../domain/common/AppError';
import { PdfExporter } from '../../domain/files/PdfExporter';

/** If the browser never reports that printing ended, the hidden frame is removed after this long. */
const CLEANUP_FALLBACK_MS = 60_000;

/**
 * Web adapter. expo-print on the web only prints the page that is open, so the report is loaded in a hidden
 * frame and that frame is printed: in the browser dialog the user chooses "Guardar como PDF". The browser
 * suggests the document title as the file name, so the title is the descriptive name while the dialog is open.
 */
export class PdfFileExporter implements PdfExporter {
  exportPdf(fileName: string, html: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const title = fileName.replace(/\.pdf$/i, '');
      const previousTitle = document.title;
      const frame = document.createElement('iframe');
      frame.setAttribute('aria-hidden', 'true');
      frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';

      let cleaned = false;
      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        document.title = previousTitle;
        frame.parentNode?.removeChild(frame);
      };

      frame.onload = () => {
        const win = frame.contentWindow;
        if (!win) {
          cleanup();
          reject(new AppError('unavailable', 'No se pudo preparar el PDF en este navegador.'));
          return;
        }
        document.title = title;
        win.document.title = title;
        win.addEventListener('afterprint', cleanup, { once: true });
        setTimeout(cleanup, CLEANUP_FALLBACK_MS);
        win.focus();
        win.print();
        resolve();
      };

      frame.srcdoc = html;
      document.body.appendChild(frame);
    });
  }
}

export const pdfFileExporter: PdfExporter = new PdfFileExporter();
