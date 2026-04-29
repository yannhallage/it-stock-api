import { readFile } from 'fs/promises';
import path from 'path';
import { SupplierPrintView } from './suppliers-pdf.types';
import { launchPdfBrowser } from '../shared/pdf-browser';

const SERVICE_NAME = 'CST DID';
const LOCAL_LOGO_PATH = process.env.LOGO_PATH || path.resolve(process.cwd(), 'src/modules/pdf/image.png');

type SupplierRow = SupplierPrintView['suppliers'][number];

export class SuppliersPdfService {
  async generateSuppliersSheet(data: SupplierPrintView): Promise<Buffer> {
    const logoSrc = await this.getLogoSrc();
    const html = this.buildHtml(data, logoSrc);

    const browser = await launchPdfBrowser();

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 0 });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '14mm',
          right: '10mm',
          bottom: '18mm',
          left: '10mm',
        },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private buildHtml(data: SupplierPrintView, logoSrc: string): string {
    const rows = (data.suppliers.length ? data.suppliers : [this.emptyRow()])
      .map((row, index) => this.buildRow(index + 1, row))
      .join('');

    return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 14mm 10mm; }

  body {
    font-family: "Times New Roman", serif;
    font-size: 11px;
    color: #000;
    margin: 0;
    padding-bottom: 40px;
  }

  .header {
    text-align: center;
    margin-bottom: 10px;
  }

  .header-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    column-gap: 16px;
  }

  .header-left,
  .header-right {
    font-weight: bold;
    font-size: 13px;
    line-height: 1.5;
  }

  .header-left { text-align: left; }
  .header-right { text-align: right; }
  .logo-wrap { text-align: center; }

  .logo {
    width: 70px;
    height: 70px;
    object-fit: contain;
  }

  .meta {
    font-size: 11px;
    margin-top: 6px;
  }

  .title {
    text-align: center;
    font-weight: bold;
    text-decoration: underline;
    font-size: 15px;
    margin: 15px 0;
  }

  .kpis {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
  }

  .kpis td {
    border: 1px solid #000;
    padding: 6px;
    text-align: center;
  }

  .kpi-label { font-size: 10px; }
  .kpi-value {
    font-size: 18px;
    font-weight: bold;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  th, td {
    border: 1px solid #000;
    padding: 5px;
    word-break: break-word;
  }

  th {
    background: #f2f2f2;
    font-size: 10px;
  }

  td { font-size: 10px; }
  .num, .center { text-align: center; }

  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    font-size: 10px;
    border-top: 1px solid #000;
    padding-top: 4px;
    display: flex;
    justify-content: space-between;
  }
</style>
</head>
<body>

<div class="header">
  <div class="header-row">
    <div class="header-left">
      REPUBLIQUE DE COTE D'IVOIRE<br>
      Union - Discipline - Travail
    </div>

    <div class="logo-wrap">
      <img src="${logoSrc}" class="logo" />
    </div>

    <div class="header-right">
      ASSEMBLEE NATIONALE<br>
      DIRECTION DES SYSTEMES D'INFORMATION
    </div>
  </div>

  <div class="meta">
    Service: ${this.escapeHtml(SERVICE_NAME)}<br>
    Date: ${this.formatDate(data.generatedAt)}
  </div>
</div>

<div class="title">LISTE DES FOURNISSEURS</div>

<table class="kpis">
<tr>
<td><div class="kpi-label">TOTAL FOURNISSEURS</div><div class="kpi-value">${data.totalSuppliers}</div></td>
</tr>
</table>

<table>
<thead>
<tr>
<th>#</th>
<th>Nom</th>
<th>Contact</th>
<th>Adresse</th>
<th>Date creation</th>
<th>Archive</th>
</tr>
</thead>
<tbody>
${rows}
</tbody>
</table>

<div class="footer">
  <span>${SERVICE_NAME}</span>
  <span>${this.escapeHtml(data.printedAt)}</span>
</div>

</body>
</html>`;
  }

  private buildRow(index: number, row: SupplierRow): string {
    return `
<tr>
<td class="num">${index}</td>
<td>${this.escapeHtml(row.name)}</td>
<td>${this.escapeHtml(row.contact)}</td>
<td>${this.escapeHtml(row.address)}</td>
<td class="center">${this.formatDate(row.createdAtRaw)}</td>
<td class="center">${this.escapeHtml(row.isArchived)}</td>
</tr>`;
  }

  private async getLogoSrc(): Promise<string> {
    try {
      if (!LOCAL_LOGO_PATH) return '';
      const file = await readFile(LOCAL_LOGO_PATH);
      return `data:image/png;base64,${file.toString('base64')}`;
    } catch {
      return '';
    }
  }

  private escapeHtml(value?: string): string {
    if (!value) return '';
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private formatDate(date?: Date | null): string {
    if (!date) return 'N/A';
    return `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1
    ).padStart(2, '0')}/${date.getFullYear()}`;
  }

  private emptyRow(): SupplierRow {
    return {
      index: 0,
      name: '-',
      contact: '-',
      address: '-',
      createdAt: '-',
      createdAtRaw: null,
      isArchived: '-',
    };
  }
}
