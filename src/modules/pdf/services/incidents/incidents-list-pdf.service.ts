import { readFile } from 'fs/promises';
import path from 'path';
import { IncidentsListPrintView } from './incidents-list-pdf.types';
import { launchPdfBrowser } from '../shared/pdf-browser';

const SERVICE_NAME = 'CST DID';

const LOCAL_LOGO_PATH = process.env.LOGO_PATH || path.resolve(process.cwd(), 'src/modules/pdf/image.png');

type IncidentRow = IncidentsListPrintView['incidents'][number];

type Metrics = {
  total: number;
  ouvert: number;
  clos: number;
  directions: number;
  materiels: number;
};

export class IncidentsListPdfService {
  async generateIncidentsListSheet(data: IncidentsListPrintView): Promise<Buffer> {
    const metrics = this.computeMetrics(data.incidents);
    const logoSrc = await this.getLogoSrc();
    const html = this.buildHtml(data, metrics, logoSrc);

    const browser = await launchPdfBrowser();

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

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

  private buildHtml(data: IncidentsListPrintView, metrics: Metrics, logoSrc: string): string {
    const rows = (data.incidents.length ? data.incidents : [this.emptyRow()])
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

  .header-left {
    text-align: left;
  }

  .header-right {
    text-align: right;
  }

  .logo-wrap {
    text-align: center;
  }

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

  .kpi-label {
    font-size: 10px;
  }

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
    padding: 4px;
    word-break: break-word;
  }

  th {
    background: #f2f2f2;
    font-size: 10px;
  }

  td {
    font-size: 10px;
  }

  .num, .center {
    text-align: center;
  }

  .status {
    padding: 2px 5px;
    font-weight: bold;
    border: 1px solid #000;
  }

  .inc_OUVERT { background: #fff3cd; }
  .inc_CLOS { background: #e6f4ea; }

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
      REPUBLIQUE DE CÔTE D’IVOIRE<br>
      Union – Discipline – Travail
    </div>

    <div class="logo-wrap">
      <img src="${logoSrc}" class="logo" />
    </div>

    <div class="header-right">
      ASSEMBLEE NATIONALE<br>
      DIRECTION DES SYSTEMES D’INFORMATION
    </div>
  </div>

  <div class="meta">
    Service: ${this.escapeHtml(SERVICE_NAME)}<br>
    Date: ${this.formatDate(data.generatedAt)}
  </div>
</div>

<div class="title">${this.escapeHtml(data.title)}</div>

<table class="kpis">
<tr>
<td><div class="kpi-label">TOTAL</div><div class="kpi-value">${metrics.total}</div></td>
<td><div class="kpi-label">OUVERT</div><div class="kpi-value">${metrics.ouvert}</div></td>
<td><div class="kpi-label">CLOS</div><div class="kpi-value">${metrics.clos}</div></td>
<td><div class="kpi-label">DIRECTIONS</div><div class="kpi-value">${metrics.directions}</div></td>
<td><div class="kpi-label">MATERIELS</div><div class="kpi-value">${metrics.materiels}</div></td>
</tr>
</table>

<table>
<thead>
<tr>
<th>#</th>
<th>Inventaire</th>
<th>Type</th>
<th>Marque / Modèle</th>
<th>Direction</th>
<th>Utilisateur</th>
<th>Signalement</th>
<th>Etat incident</th>
<th>Etat materiel</th>
<th>Description</th>
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

  private buildRow(index: number, row: IncidentRow): string {
    const incClass =
      row.incidentStatus === 'Ouvert'
        ? 'inc_OUVERT'
        : row.incidentStatus === 'Clos'
          ? 'inc_CLOS'
          : '';

    return `
<tr>
<td class="num">${index}</td>
<td>${this.escapeHtml(row.inventoryNumber)}</td>
<td>${this.escapeHtml(row.assetType)}</td>
<td>${this.escapeHtml(row.brandModel)}</td>
<td>${this.escapeHtml(row.department)}</td>
<td>${this.escapeHtml(row.utilisateur)}</td>
<td class="center">${row.inventoryNumber === '-' ? '-' : this.formatDate(row.reportedAtRaw)}</td>
<td class="center">
  <span class="status ${incClass}">${this.escapeHtml(row.incidentStatus)}</span>
</td>
<td class="center">${this.escapeHtml(row.assetStatus)}</td>
<td>${this.escapeHtml(row.description)}</td>
</tr>`;
  }

  private computeMetrics(rows: IncidentRow[]): Metrics {
    const ouvert = rows.filter((r) => r.incidentStatus === 'Ouvert').length;
    const clos = rows.filter((r) => r.incidentStatus === 'Clos').length;
    const deptSet = new Set(rows.map((r) => r.department).filter(Boolean));
    /** Distinct inventory numbers (one row = one incident; materiels = rows with real inventory). */
    const invSet = new Set(rows.map((r) => r.inventoryNumber).filter((n) => n !== '-'));

    return {
      total: rows.length,
      ouvert,
      clos,
      directions: deptSet.size,
      materiels: invSet.size,
    };
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
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}/${date.getFullYear()}`;
  }

  private emptyRow(): IncidentRow {
    return {
      index: 0,
      inventoryNumber: '-',
      assetType: '-',
      brandModel: '-',
      department: '-',
      utilisateur: '-',
      reportedAt: '-',
      reportedAtRaw: new Date(0),
      incidentStatus: '-',
      assetStatus: '-',
      description: 'Aucune panne enregistree.',
    };
  }
}
