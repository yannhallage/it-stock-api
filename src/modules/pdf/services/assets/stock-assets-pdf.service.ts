import { readFile } from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { StockAssetPrintView } from './stock-assets-pdf.types';

const SERVICE_NAME = 'CST DID';
const EXPIRY_ALERT_DAYS = 90;

const LOCAL_LOGO_PATH = process.env.LOGO_PATH || path.resolve(process.cwd(), 'src/modules/pdf/image.png');

type AssetRow = StockAssetPrintView['assets'][number];

type Metrics = {
  total: number;
  enStock: number;
  affecte: number;
  enReparation: number;
  warrantySoon: number;
};

export class StockAssetsPdfService {
  async generateStockAssetsSheet(data: StockAssetPrintView): Promise<Buffer> {
    const metrics = this.computeMetrics(data.assets, data.generatedAt);
    const logoSrc = await this.getLogoSrc();
    const html = this.buildHtml(data, metrics, logoSrc);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

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

  // ========================= HTML =========================

  private buildHtml(data: StockAssetPrintView, metrics: Metrics, logoSrc: string): string {
    const rows = (data.assets.length ? data.assets : [this.emptyRow()])
      .map((row, index) => this.buildRow(index + 1, row, data.generatedAt))
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

  /* HEADER */
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

  /* KPI */
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

  /* TABLE */
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

  /* STATUS */
  .status {
    padding: 2px 5px;
    font-weight: bold;
    border: 1px solid #000;
  }

  .EN_STOCK { background: #e6f4ea; }
  .AFFECTE { background: #e7f1ff; }
  .EN_REPARATION { background: #fff3cd; }

  /* FOOTER */
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

<!-- HEADER -->
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

<div class="title">ETAT DU STOCK MATERIEL</div>

<!-- KPI -->
<table class="kpis">
<tr>
<td><div class="kpi-label">TOTAL</div><div class="kpi-value">${metrics.total}</div></td>
<td><div class="kpi-label">EN STOCK</div><div class="kpi-value">${metrics.enStock}</div></td>
<td><div class="kpi-label">AFFECTE</div><div class="kpi-value">${metrics.affecte}</div></td>
<td><div class="kpi-label">REPARATION</div><div class="kpi-value">${metrics.enReparation}</div></td>
<td><div class="kpi-label">GARANTIE <= ${EXPIRY_ALERT_DAYS}J</div><div class="kpi-value">${metrics.warrantySoon}</div></td>
</tr>
</table>

<!-- TABLE -->
<table>
<thead>
<tr>
<th>#</th>
<th>Inventaire</th>
<th>Type</th>
<th>Marque / Modèle</th>
<th>Entrée</th>
<th>Garantie</th>
<th>Fournisseur</th>
<th>Etat</th>
<th>Remarque</th>
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

  private buildRow(index: number, row: AssetRow, generatedAt: Date): string {
    const status = (row.status ?? '').replace(/_/g, ' ');

    return `
<tr>
<td class="num">${index}</td>
<td>${this.escapeHtml(row.inventoryNumber)}</td>
<td>${this.escapeHtml(row.type)}</td>
<td>${this.escapeHtml(row.brandModel)}</td>
<td class="center">${this.formatDate(row.entryDateRaw)}</td>
<td class="center">${this.formatDate(row.warrantyEndDateRaw)}</td>
<td>${this.escapeHtml(row.supplier)}</td>
<td class="center">
  <span class="status ${row.status}">${status}</span>
</td>
<td>${this.escapeHtml(this.buildRemark(row, generatedAt))}</td>
</tr>`;
  }

  // ========================= LOGIC =========================

  private computeMetrics(assets: AssetRow[], now: Date): Metrics {
    const enStock = assets.filter(a => a.status === 'EN_STOCK').length;
    const affecte = assets.filter(a => a.status === 'AFFECTE').length;
    const enReparation = assets.filter(a => a.status === 'EN_REPARATION').length;

    const warrantySoon = assets.filter(a => {
      if (!a.warrantyEndDateRaw) return false;
      const diff = a.warrantyEndDateRaw.getTime() - now.getTime();
      return diff > 0 && diff <= EXPIRY_ALERT_DAYS * 86400000;
    }).length;

    return {
      total: assets.length,
      enStock,
      affecte,
      enReparation,
      warrantySoon,
    };
  }

  private buildRemark(row: AssetRow, now: Date): string {
    if (row.status === 'EN_REPARATION') return 'En atelier';
    if (!row.warrantyEndDateRaw) return 'N/A';

    const diff = row.warrantyEndDateRaw.getTime() - now.getTime();

    if (diff < 0) return 'Expirée';
    if (diff <= EXPIRY_ALERT_DAYS * 86400000) return 'A renouveler';

    return 'RAS';
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

  private emptyRow(): AssetRow {
    return {
      index: 0,
      inventoryNumber: '-',
      serialNumber: '-',
      type: '-',
      brandModel: '-',
      supplier: '-',
      status: 'EN_STOCK',
      entryDate: '-',
      warrantyStartDate: '-',
      warrantyEndDate: '-',
      entryDateRaw: null,
      warrantyEndDateRaw: null,
    };
  }
}