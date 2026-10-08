import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { AppError } from '../../domain/common/AppError';
import { FileExporter } from '../../domain/files/FileExporter';

/** Phone adapter (iOS and Android): writes the CSV in the cache folder and opens the share sheet. */
export class CsvFileExporter implements FileExporter {
  async exportCsv(fileName: string, content: string): Promise<void> {
    if (!(await Sharing.isAvailableAsync())) {
      throw new AppError('unavailable', 'Este dispositivo no permite compartir archivos.');
    }
    const file = new File(Paths.cache, fileName);
    if (file.exists) file.delete();
    file.create();
    file.write(content);
    await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text', dialogTitle: 'Exportar consumo' });
  }
}

export const csvFileExporter: FileExporter = new CsvFileExporter();
