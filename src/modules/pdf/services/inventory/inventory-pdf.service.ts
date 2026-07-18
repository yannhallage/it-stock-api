import { readFile } from 'fs/promises';
import path from 'path';
import { InventoryColumnKey } from '../../../stocks/dto/filter-assets.dto';
import { launchPdfBrowser } from '../shared/pdf-browser';
import { InventoryPrintView } from './inventory-pdf.types';

const LOCAL_LOGO_PATH = process.env.LOGO_PATH || path.resolve(process.cwd(), 'src/modules/pdf/image.png');

const COLUMN_LABELS: Record<InventoryColumnKey, string> = {
  inventoryNumber: 'Inventaire',
  type: 'Type',
  brandModel: 'Marque / Modèle',
  firstName: 'Prénom',
  lastName: 'Nom',
  direction: 'Direction',
  status: 'État',
  entryDate: 'Date entrée',
  warranty: 'Garantie',
  supplier: 'Fournisseur',
  serialNumber: 'N° série',
  location: 'Emplacement',
};

export class InventoryPdfService {
  async generateInventorySheet(data: InventoryPrintView): Promise<Buffer> {
    const logoSrc = await this.getLogoSrc();
    const html = this.buildHtml(data, logoSrc);

    const browser = await launchPdfBrowser();
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        landscape: data.columns.length > 8,
        printBackground: true,
        margin: { top: '12mm', right: '8mm', bottom: '16mm', left: '8mm' },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private buildHtml(data: InventoryPrintView, logoSrc: string): string {
    const headers = data.columns
      .map((col) => `<th>${this.escapeHtml(COLUMN_LABELS[col])}</th>`)
      .join('');

    const rows = (data.assets.length ? data.assets : [null])
      .map((row, index) => {
        if (!row) {
          return `<tr><td colspan="${data.columns.length + 1}" class="center">Aucun matériel</td></tr>`;
        }
        const cells = data.columns
          .map((col) => {
            if (col === 'status') {
              const status = row.status.replace(/_/g, ' ');
              return `<td class="center"><span class="status ${row.status}">${this.escapeHtml(status)}</span></td>`;
            }
            if (col === 'entryDate') {
              return `<td class="center">${this.escapeHtml(row.entryDate)}</td>`;
            }
            const value = String(row[col] ?? '—');
            return `<td>${this.escapeHtml(value)}</td>`;
          })
          .join('');
        return `<tr><td class="num">${index + 1}</td>${cells}</tr>`;
      })
      .join('');

    const filters = data.filters
      .map((filter) => `<span class="filter-chip">${this.escapeHtml(filter)}</span>`)
      .join('');

    return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<style>
  body { font-family: "Times New Roman", serif; font-size: 10px; color: #000; margin: 0; padding-bottom: 28px; }
  .header-row { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; margin-bottom: 8px; }
  .header-left, .header-right { font-weight: bold; font-size: 12px; line-height: 1.4; }
  .header-right { text-align: right; }
  .logo { width: 64px; height: 64px; object-fit: contain; }
  .title { text-align: center; font-weight: bold; text-decoration: underline; font-size: 14px; margin: 10px 0 6px; }
  .filters { text-align: center; margin-bottom: 8px; }
  .filter-chip { display: inline-block; border: 1px solid #000; padding: 2px 6px; margin: 0 2px 3px; font-size: 9px; }
  .kpis { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  .kpis td { border: 1px solid #000; padding: 5px; text-align: center; }
  .kpi-label { font-size: 9px; }
  .kpi-value { font-size: 16px; font-weight: bold; }
  table.data { width: 100%; border-collapse: collapse; table-layout: fixed; }
  table.data th, table.data td { border: 1px solid #000; padding: 3px; word-break: break-word; font-size: 9px; }
  table.data th { background: #f2f2f2; }
  .num, .center { text-align: center; }
  .status { padding: 1px 4px; font-weight: bold; border: 1px solid #000; }
  .EN_STOCK_NON_AFFECTE { background: #e6f4ea; }
  .AFFECTE { background: #e7f1ff; }
  .EN_PRET { background: #ede9fe; }
  .EN_PANNE { background: #fee2e2; }
  .EN_REPARATION { background: #fff3cd; }
  .EN_SERVICE { background: #dcfce7; }
  .HORS_SERVICE { background: #e5e7eb; }
  .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 9px; border-top: 1px solid #000; padding-top: 3px; }
</style>
</head>
<body>
<div class="header-row">
  <div class="header-left">REPUBLIQUE DE CÔTE D’IVOIRE<br>Union – Discipline – Travail</div>
  <div>${logoSrc ? `<img src="${logoSrc}" class="logo" />` : ''}</div>
  <div class="header-right">ASSEMBLEE NATIONALE<br>DIRECTION DES SYSTEMES D’INFORMATION</div>
</div>
<div class="title">${this.escapeHtml(data.title.toUpperCase())}</div>
<div class="filters">${filters}</div>
<table class="kpis"><tr>
  <td><div class="kpi-label">TOTAL</div><div class="kpi-value">${data.summary.total}</div></td>
  <td><div class="kpi-label">AFFECTÉS</div><div class="kpi-value">${data.summary.assigned}</div></td>
  <td><div class="kpi-label">EN STOCK</div><div class="kpi-value">${data.summary.inStock}</div></td>
  <td><div class="kpi-label">EN PANNE</div><div class="kpi-value">${data.summary.broken}</div></td>
  <td><div class="kpi-label">RÉPARATION</div><div class="kpi-value">${data.summary.inRepair}</div></td>
  <td><div class="kpi-label">HORS SERVICE</div><div class="kpi-value">${data.summary.outOfService}</div></td>
</tr></table>
<table class="data">
<thead><tr><th>#</th>${headers}</tr></thead>
<tbody>${rows}</tbody>
</table>
<div class="footer"><span>${this.escapeHtml(data.printedAt)}</span></div>
</body>
</html>`;
  }

  private async getLogoSrc(): Promise<string> {
    try {
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
}
