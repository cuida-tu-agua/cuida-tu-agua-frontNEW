import { CsvFileExporter } from '../CsvFileExporter.web';

const link = { href: '', download: '', click: jest.fn() };
const body = { appendChild: jest.fn(), removeChild: jest.fn() };

beforeEach(() => {
  link.href = '';
  link.download = '';
  link.click.mockClear();
  body.appendChild.mockClear();
  body.removeChild.mockClear();
  Object.assign(globalThis, { document: { createElement: jest.fn(() => link), body } });
  URL.createObjectURL = jest.fn(() => 'blob:csv');
  URL.revokeObjectURL = jest.fn();
});

describe('CsvFileExporter (web)', () => {
  it('downloads the CSV with the given name', async () => {
    await new CsvFileExporter().exportCsv('consumo.csv', 'a;b');

    expect(link.download).toBe('consumo.csv');
    expect(link.href).toBe('blob:csv');
    expect(link.click).toHaveBeenCalledTimes(1);
  });

  it('puts the content in a CSV blob', async () => {
    await new CsvFileExporter().exportCsv('consumo.csv', 'a;b');

    const blob = (URL.createObjectURL as jest.Mock).mock.calls[0][0] as Blob;
    expect(blob.type).toContain('text/csv');
    expect(blob.size).toBe(3);
  });

  it('cleans up the temporary link and the blob URL', async () => {
    await new CsvFileExporter().exportCsv('consumo.csv', 'a;b');

    expect(body.appendChild).toHaveBeenCalledWith(link);
    expect(body.removeChild).toHaveBeenCalledWith(link);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:csv');
  });
});
