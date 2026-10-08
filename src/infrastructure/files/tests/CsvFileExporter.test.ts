import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { CsvFileExporter } from '../CsvFileExporter';

const mockFile = { exists: false, uri: 'file:///cache/consumo.csv', delete: jest.fn(), create: jest.fn(), write: jest.fn() };

jest.mock('expo-file-system', () => ({
  File: jest.fn(() => mockFile),
  Paths: { cache: 'CACHE_DIR' },
}));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));

const sharing = Sharing as unknown as { isAvailableAsync: jest.Mock; shareAsync: jest.Mock };

beforeEach(() => {
  mockFile.exists = false;
  mockFile.delete.mockClear();
  mockFile.create.mockClear();
  mockFile.write.mockClear();
  (File as unknown as jest.Mock).mockClear();
  sharing.isAvailableAsync.mockReset().mockResolvedValue(true);
  sharing.shareAsync.mockReset().mockResolvedValue(undefined);
});

describe('CsvFileExporter (phone)', () => {
  it('writes the CSV in the cache folder and opens the share sheet', async () => {
    await new CsvFileExporter().exportCsv('consumo.csv', 'a;b');

    expect(File).toHaveBeenCalledWith(Paths.cache, 'consumo.csv');
    expect(mockFile.create).toHaveBeenCalledTimes(1);
    expect(mockFile.write).toHaveBeenCalledWith('a;b');
    expect(sharing.shareAsync).toHaveBeenCalledWith('file:///cache/consumo.csv', expect.objectContaining({ mimeType: 'text/csv' }));
  });

  it('replaces a file with the same name left by a previous export', async () => {
    mockFile.exists = true;
    await new CsvFileExporter().exportCsv('consumo.csv', 'a;b');
    expect(mockFile.delete).toHaveBeenCalledTimes(1);
  });

  it('says so when the phone cannot share files, and writes nothing', async () => {
    sharing.isAvailableAsync.mockResolvedValue(false);

    await expect(new CsvFileExporter().exportCsv('consumo.csv', 'a;b')).rejects.toThrow('no permite compartir');
    expect(mockFile.write).not.toHaveBeenCalled();
  });
});
