/** Port: hands a CSV to the user (a download on the web, the share sheet on a phone). */
export interface FileExporter {
  exportCsv(fileName: string, content: string): Promise<void>;
}
