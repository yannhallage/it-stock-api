import { readFile } from 'fs/promises';
import path from 'path';
import { AssetStatus } from '@prisma/client';
import { launchPdfBrowser } from '../shared/pdf-browser';

const LOCAL_LOGO_PATH = process.env.LOGO_PATH || path.resolve(process.cwd(), 'src/modules/pdf/image.png');

export type SignaleticAsset = {
  inventoryNumber: string;
  serialNumber: string | null;
  model: string;
  status: AssetStatus;
  entryDate: Date;
  materialType: { name: string };
  brand: { name: string };
  location: { name: string } | null;
  currentAssignment: {
    user: { firstName: string; lastName: string };
    department: { name: string };
    startDate?: Date;
  } | null;
  lastPhysicalInventoryAt?: Date | null;
};

export class SignaleticSheetPdfService {
  async generateSignaleticSheets(assets: SignaleticAsset[]): Promise<Buffer> {
    const logoSrc = await this.getLogoSrc();
    const sheets = assets.map((asset) => this.buildSheet(asset, logoSrc)).join('<div class="page-break"></div>');
    const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" />
<style>
  body { font-family: "Times New Roman", serif; font-size: 12px; color: #000; margin: 0; }
  .sheet { padding: 8mm; page-break-inside: avoid; }
  .page-break { page-break-after: always; }
  .header-row { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; margin-bottom: 12px; }
  .header-left, .header-right { font-weight: bold; font-size: 12px; line-height: 1.4; }
  .header-right { text-align: right; }
  .logo { width: 70px; height: 70px; object-fit: contain; }
  .title { text-align: center; font-weight: bold; text-decoration: underline; font-size: 16px; margin: 12px 0; }
  table.info { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  table.info th, table.info td { border: 1px solid #000; padding: 8px; text-align: left; }
  table.info th { width: 32%; background: #f2f2f2; }
  .sign-box { border: 1px solid #000; min-height: 90px; margin-top: 10px; padding: 8px; }
  .sign-label { font-weight: bold; margin-bottom: 40px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 18px; }
  .note { margin-top: 14px; border: 1px dashed #000; min-height: 60px; padding: 8px; }
</style></head><body>${sheets || '<div class="sheet">Aucun matériel</div>'}</body></html>`;

    const browser = await launchPdfBrowser();
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '12mm', left: '10mm' },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private buildSheet(asset: SignaleticAsset, logoSrc: string): string {
    const user = asset.currentAssignment
      ? `${asset.currentAssignment.user.lastName} ${asset.currentAssignment.user.firstName}`
      : 'Non affecté';
    const direction = asset.currentAssignment?.department.name ?? '—';
    const printedAt = this.formatDate(new Date());

    return `<div class="sheet">
<div class="header-row">
  <div class="header-left">REPUBLIQUE DE CÔTE D’IVOIRE<br>Union – Discipline – Travail</div>
  <div>${logoSrc ? `<img src="${logoSrc}" class="logo" />` : ''}</div>
  <div class="header-right">ASSEMBLEE NATIONALE<br>DIRECTION DES SYSTEMES D’INFORMATION</div>
</div>
<div class="title">FICHE SIGNALÉTIQUE — INVENTAIRE PHYSIQUE</div>
<table class="info">
  <tr><th>N° inventaire</th><td>${this.escapeHtml(asset.inventoryNumber)}</td></tr>
  <tr><th>N° série</th><td>${this.escapeHtml(asset.serialNumber ?? '—')}</td></tr>
  <tr><th>Type</th><td>${this.escapeHtml(asset.materialType.name)}</td></tr>
  <tr><th>Marque / Modèle</th><td>${this.escapeHtml(`${asset.brand.name} / ${asset.model}`)}</td></tr>
  <tr><th>État</th><td>${this.escapeHtml(asset.status.replace(/_/g, ' '))}</td></tr>
  <tr><th>Date d'entrée</th><td>${this.formatDate(asset.entryDate)}</td></tr>
  <tr><th>Emplacement</th><td>${this.escapeHtml(asset.location?.name ?? '—')}</td></tr>
  <tr><th>Utilisateur</th><td>${this.escapeHtml(user)}</td></tr>
  <tr><th>Direction</th><td>${this.escapeHtml(direction)}</td></tr>
  <tr><th>Dernier inventaire</th><td>${asset.lastPhysicalInventoryAt ? this.formatDate(asset.lastPhysicalInventoryAt) : 'Jamais'}</td></tr>
  <tr><th>Date impression</th><td>${printedAt}</td></tr>
</table>
<div class="note"><strong>Observations terrain :</strong><br><br></div>
<div class="grid-2">
  <div class="sign-box"><div class="sign-label">Signature de l'utilisateur</div>Nom : .........................<br>Date : .... / .... / ........</div>
  <div class="sign-box"><div class="sign-label">Visa inventaire (DSI)</div>Nom : .........................<br>Date : .... / .... / ........</div>
</div>
</div>`;
  }

  private async getLogoSrc(): Promise<string> {
    try {
      const file = await readFile(LOCAL_LOGO_PATH);
      return `data:image/png;base64,${file.toString('base64')}`;
    } catch {
      return '';
    }
  }

  private formatDate(date: Date): string {
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
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
