import { FileExporter } from '../../domain/files/FileExporter';

/** Web adapter: builds a Blob and clicks a temporary link, so the browser downloads the file. */
export class CsvFileExporter implements FileExporter {
  async exportCsv(fileName: string, content: string): Promise<void> {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const csvFileExporter: FileExporter = new CsvFileExporter();
