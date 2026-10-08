/** Port: hands a PDF to the user (the print dialog "Save as PDF" on the web, the share sheet on a phone). */
export interface PdfExporter {
  /** `html` is the whole document to turn into a PDF; `fileName` is the name the PDF should have. */
  exportPdf(fileName: string, html: string): Promise<void>;
}
