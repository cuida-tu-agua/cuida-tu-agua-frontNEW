import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { AppError } from '../../domain/common/AppError';
import { PdfExporter } from '../../domain/files/PdfExporter';

// A4 at 72 points per inch
const A4 = { width: 595, height: 842 };

/** Phone adapter (iOS and Android): prints the HTML to a PDF, gives it its descriptive name and opens the share sheet. */
export class PdfFileExporter implements PdfExporter {
  async exportPdf(fileName: string, html: string): Promise<void> {
    if (!(await Sharing.isAvailableAsync())) {
      throw new AppError('unavailable', 'Este dispositivo no permite compartir archivos.');
    }
    // expo-print saves the PDF with a random name; it is renamed so the user receives "reporte-consumo-casa-...pdf"
    const { uri } = await Print.printToFileAsync({ html, ...A4 });
    const target = new File(Paths.cache, fileName);
    if (target.exists) target.delete();
    new File(uri).move(target);
    await Sharing.shareAsync(target.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Reporte de consumo' });
  }
}

export const pdfFileExporter: PdfExporter = new PdfFileExporter();
