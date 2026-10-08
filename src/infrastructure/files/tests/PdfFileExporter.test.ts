import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { PdfFileExporter } from '../PdfFileExporter';

const printed = { exists: false, uri: 'file:///cache/Print/random.pdf', delete: jest.fn(), move: jest.fn() };
const target = { exists: false, uri: 'file:///cache/reporte.pdf', delete: jest.fn(), move: jest.fn() };

jest.mock('expo-file-system', () => ({
  File: jest.fn(),
  Paths: { cache: 'CACHE_DIR' },
}));
jest.mock('expo-print', () => ({ printToFileAsync: jest.fn() }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));

const print = Print as unknown as { printToFileAsync: jest.Mock };
const sharing = Sharing as unknown as { isAvailableAsync: jest.Mock; shareAsync: jest.Mock };

beforeEach(() => {
  target.exists = false;
  [printed.delete, printed.move, target.delete, target.move].forEach((m) => m.mockClear());
  // new File(Paths.cache, name) is the target; new File(uri) is the file expo-print wrote
  (File as unknown as jest.Mock).mockReset().mockImplementation((...args: unknown[]) => (args.length === 2 ? target : printed));
  print.printToFileAsync.mockReset().mockResolvedValue({ uri: printed.uri });
  sharing.isAvailableAsync.mockReset().mockResolvedValue(true);
  sharing.shareAsync.mockReset().mockResolvedValue(undefined);
});

describe('PdfFileExporter (phone)', () => {
  it('prints the HTML to a PDF on A4', async () => {
    await new PdfFileExporter().exportPdf('reporte.pdf', '<html></html>');
    expect(print.printToFileAsync).toHaveBeenCalledWith({ html: '<html></html>', width: 595, height: 842 });
  });

  it('gives the PDF its descriptive name and opens the share sheet with it', async () => {
    await new PdfFileExporter().exportPdf('reporte.pdf', '<html></html>');

    expect(File).toHaveBeenCalledWith(Paths.cache, 'reporte.pdf');
    expect(printed.move).toHaveBeenCalledWith(target);
    expect(sharing.shareAsync).toHaveBeenCalledWith('file:///cache/reporte.pdf', expect.objectContaining({ mimeType: 'application/pdf' }));
  });

  it('replaces a PDF with the same name left by a previous export', async () => {
    target.exists = true;
    await new PdfFileExporter().exportPdf('reporte.pdf', '<html></html>');
    expect(target.delete).toHaveBeenCalledTimes(1);
  });

  it('says so when the phone cannot share files, and prints nothing', async () => {
    sharing.isAvailableAsync.mockResolvedValue(false);

    await expect(new PdfFileExporter().exportPdf('reporte.pdf', '<html></html>')).rejects.toThrow('no permite compartir');
    expect(print.printToFileAsync).not.toHaveBeenCalled();
  });
});
