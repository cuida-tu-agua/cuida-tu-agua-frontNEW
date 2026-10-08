import { PdfFileExporter } from '../PdfFileExporter.web';

interface FakeFrame {
  style: { cssText: string };
  srcdoc: string;
  onload: (() => void) | null;
  parentNode: { removeChild: jest.Mock } | null;
  setAttribute: jest.Mock;
  contentWindow: {
    document: { title: string };
    addEventListener: jest.Mock;
    focus: jest.Mock;
    print: jest.Mock;
  } | null;
}

let frame: FakeFrame;
let doc: { title: string; createElement: jest.Mock; body: { appendChild: jest.Mock } };

beforeEach(() => {
  jest.useFakeTimers();
  frame = {
    style: { cssText: '' },
    srcdoc: '',
    onload: null,
    parentNode: { removeChild: jest.fn() },
    setAttribute: jest.fn(),
    contentWindow: { document: { title: '' }, addEventListener: jest.fn(), focus: jest.fn(), print: jest.fn() },
  };
  doc = {
    title: 'Cuida Tu Agua',
    createElement: jest.fn(() => frame),
    // the browser fires "load" once the frame is in the page
    body: { appendChild: jest.fn(() => frame.onload?.()) },
  };
  Object.assign(globalThis, { document: doc });
});

afterEach(() => jest.useRealTimers());

describe('PdfFileExporter (web)', () => {
  it('loads the report in a hidden frame and prints that frame, not the page', async () => {
    await new PdfFileExporter().exportPdf('reporte-consumo-casa.pdf', '<html>reporte</html>');

    expect(doc.createElement).toHaveBeenCalledWith('iframe');
    expect(frame.srcdoc).toBe('<html>reporte</html>');
    expect(frame.contentWindow!.print).toHaveBeenCalledTimes(1);
  });

  it('shows the descriptive name as the title while the print dialog is open', async () => {
    await new PdfFileExporter().exportPdf('reporte-consumo-casa.pdf', '<html></html>');

    expect(doc.title).toBe('reporte-consumo-casa');
    expect(frame.contentWindow!.document.title).toBe('reporte-consumo-casa');
  });

  it('restores the page title and removes the frame when printing ends', async () => {
    await new PdfFileExporter().exportPdf('reporte-consumo-casa.pdf', '<html></html>');

    const [event, onAfterPrint] = frame.contentWindow!.addEventListener.mock.calls[0];
    expect(event).toBe('afterprint');
    onAfterPrint();

    expect(doc.title).toBe('Cuida Tu Agua');
    expect(frame.parentNode!.removeChild).toHaveBeenCalledWith(frame);
  });

  it('cleans up anyway if the browser never says printing ended', async () => {
    await new PdfFileExporter().exportPdf('reporte-consumo-casa.pdf', '<html></html>');

    jest.advanceTimersByTime(60_000);
    expect(doc.title).toBe('Cuida Tu Agua');
    expect(frame.parentNode!.removeChild).toHaveBeenCalledTimes(1);
  });

  it('fails clearly when the frame cannot be used', async () => {
    frame.contentWindow = null;
    await expect(new PdfFileExporter().exportPdf('reporte.pdf', '<html></html>')).rejects.toThrow('No se pudo preparar el PDF');
    expect(frame.parentNode!.removeChild).toHaveBeenCalled();
  });
});
