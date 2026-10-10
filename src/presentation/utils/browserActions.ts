import { Platform } from 'react-native';
import QRCode from 'qrcode';
import { FactoryDevice, qrPayload } from '../../domain/admin/AdminDevices';

/**
 * Things only a browser can do (the administration is used from the web): save a file, copy text, print the labels.
 * On the phone app they answer false / do nothing and the screen says it is a web function.
 */
const isWeb = (): boolean => Platform.OS === 'web' && typeof document !== 'undefined';

export const canUseBrowserActions = (): boolean => isWeb();

export const downloadTextFile = (fileName: string, content: string, mime = 'text/plain'): boolean => {
  if (!isWeb()) return false;
  const url = URL.createObjectURL(new Blob([content], { type: `${mime};charset=utf-8` }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
};

export const copyText = async (text: string): Promise<boolean> => {
  if (!isWeb()) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const escapeHtml = (text: string): string => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

/** Opens a clean page with one label per device (QR, serial, pairing code) and the print dialog. The token is NOT printed. */
export const printLabels = async (devices: FactoryDevice[]): Promise<boolean> => {
  if (!isWeb()) return false;
  const labels = await Promise.all(
    devices.map(async (d) => {
      const svg = await QRCode.toString(qrPayload(d), { type: 'svg', margin: 0, errorCorrectionLevel: 'M' });
      return `<div class="label"><div class="qr">${svg}</div><div><div class="serial">${escapeHtml(d.serialNumber)}</div><div class="code">Código: ${escapeHtml(d.pairingCode)}</div></div></div>`;
    }),
  );
  const page = window.open('', '_blank');
  if (!page) return false;
  page.document.write(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Etiquetas</title><style>
      body{font-family:Arial,sans-serif;margin:16px}
      .label{display:flex;gap:12px;align-items:center;width:300px;border:1px dashed #888;padding:10px;margin:0 12px 12px 0;float:left;page-break-inside:avoid}
      .qr{width:96px;height:96px}.qr svg{width:100%;height:100%}
      .serial{font:bold 16px monospace}.code{font:14px monospace;margin-top:6px}
    </style></head><body>${labels.join('')}<script>window.onload=function(){window.print()}</script></body></html>`,
  );
  page.document.close();
  return true;
};
