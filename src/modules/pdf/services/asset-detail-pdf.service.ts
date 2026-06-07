import { readFile } from 'fs/promises';
import path from 'path';
import { launchPdfBrowser } from './shared/pdf-browser';

const SERVICE_NAME = 'CST DID';
const EXPIRY_ALERT_DAYS = 90;
const LOGO_PATHS = [
  process.env.LOGO_PATH,
  path.resolve(process.cwd(), 'src/modules/pdf/image.png'),
  path.resolve(__dirname, '..', 'image.png'),
].filter((value): value is string => Boolean(value));

type AssetDetailPdfPayload = {
  id: number;
  inventoryNumber: string;
  serial_number: string | null;
  type: string;
  brand: string;
  model: string;
  entryDate: Date;
  supplier: string;
  warrantyStartDate: Date | null;
  warrantyEndDate: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  currentStatus?: string;
  currentAssignment: {
    id: number;
    department: string;
    user: unknown;
    startDate: Date;
    endDate: Date | null;
    createdAt: Date;
  } | null;
  history: Array<{
    id: number;
    type: string;
    payload: unknown;
    createdAt: Date;
  }>;
  incidentsWithRepairs: Array<{
    id: number;
    description: string;
    reportedAt: Date;
    department: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    repairs: Array<{
      id: number;
      technicianName: string | null;
      workshopEntryDate: Date;
      workshopExitDate: Date | null;
      action: string | null;
      cost: unknown;
      status: string;
      outcome: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }>;
};

type UserInfo = {
  name: string;
  role: string;
  service: string;
};

export class AssetDetailPdfService {
  async generateAssetDetailSheet(asset: AssetDetailPdfPayload): Promise<Buffer> {
    const generatedAt = new Date();
    const logoSrc = await this.getLogoSrc();
    const html = this.buildHtml(asset, generatedAt, logoSrc);

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

  private buildHtml(asset: AssetDetailPdfPayload, generatedAt: Date, logoSrc: string): string {
    const warranty = this.buildWarrantySummary(asset, generatedAt);
    const assignment = this.buildAssignmentBlock(asset);
    const incidentsRows = this.buildIncidentsRows(asset);
    const historyRows = this.buildHistoryRows(asset);

    return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 14mm 10mm; }

  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #111;
    margin: 0;
    font-size: 11px;
    line-height: 1.35;
  }

  .header {
    text-align: center;
    margin-bottom: 12px;
  }

  .header-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 16px;
  }

  .header-left,
  .header-right {
    font-weight: bold;
    font-size: 12px;
    line-height: 1.5;
  }

  .header-left { text-align: left; }
  .header-right { text-align: right; }

  .logo {
    width: 68px;
    height: 68px;
    object-fit: contain;
  }

  .divider {
    border-bottom: 2px solid #111;
    margin: 12px 0 14px;
  }

  .title {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .subtitle {
    text-align: center;
    font-size: 11px;
    margin-bottom: 16px;
  }

  .section {
    margin-top: 14px;
    page-break-inside: avoid;
  }

  .section-title {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 6px;
    text-transform: uppercase;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-top: 1px solid #222;
    border-left: 1px solid #222;
  }

  .cell {
    min-height: 28px;
    border-right: 1px solid #222;
    border-bottom: 1px solid #222;
    padding: 6px 8px;
  }

  .label {
    display: block;
    color: #555;
    font-size: 9px;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .value {
    font-weight: bold;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  th, td {
    border: 1px solid #222;
    padding: 5px 6px;
    vertical-align: top;
    word-break: break-word;
  }

  th {
    background: #f1f3f5;
    font-size: 10px;
    text-align: left;
  }

  .status {
    display: inline-block;
    border: 1px solid #222;
    padding: 2px 6px;
    font-weight: bold;
    font-size: 10px;
  }

  .EN_STOCK_NON_AFFECTE { background: #e6f4ea; }
  .AFFECTE, .EN_SERVICE { background: #e7f1ff; }
  .EN_REPARATION, .EN_PANNE, .EN_PRET { background: #fff3cd; }
  .HORS_SERVICE { background: #f8d7da; }

  .note {
    border: 1px solid #222;
    padding: 8px;
    min-height: 34px;
  }

  .footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    border-top: 1px solid #222;
    padding-top: 4px;
    display: flex;
    justify-content: space-between;
    font-size: 9px;
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
      <div>
        <img src="${logoSrc}" class="logo" />
      </div>
      <div class="header-right">
        ASSEMBLEE NATIONALE<br>
        DIRECTION DES SYSTEMES D'INFORMATION
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <div class="title">FICHE MATERIEL</div>
  <div class="subtitle">
    N fiche: MAT-${this.escapeHtml(asset.inventoryNumber)} |
    Date impression: ${this.escapeHtml(this.formatDateTime(generatedAt))}
  </div>

  <div class="section">
    <div class="section-title">Identification du materiel</div>
    <div class="grid">
      ${this.infoCell("Numero d'inventaire", asset.inventoryNumber)}
      ${this.infoCell('Numero de serie', asset.serial_number ?? 'N/A')}
      ${this.infoCell('Type', asset.type)}
      ${this.infoCell('Marque / Modele', `${asset.brand} / ${asset.model}`)}
      ${this.infoCell('Fournisseur', asset.supplier)}
      ${this.infoCell('Date entree stock', this.formatDate(asset.entryDate))}
      ${this.infoCell('Statut actuel', this.statusBadge(asset.currentStatus ?? asset.status), true)}
      ${this.infoCell('Cree le', this.formatDateTime(asset.createdAt))}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Garantie</div>
    <div class="grid">
      ${this.infoCell('Debut garantie', this.formatDate(asset.warrantyStartDate))}
      ${this.infoCell('Fin garantie', this.formatDate(asset.warrantyEndDate))}
      ${this.infoCell('Etat garantie', warranty.status)}
      ${this.infoCell('Observation', warranty.note)}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Affectation courante</div>
    <div class="grid">
      ${this.infoCell('Beneficiaire', assignment.name)}
      ${this.infoCell('Poste', assignment.role)}
      ${this.infoCell('Service', assignment.service)}
      ${this.infoCell('Date affectation', assignment.assignedAt)}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Incidents et reparations</div>
    <table>
      <thead>
        <tr>
          <th style="width: 18%;">Date</th>
          <th style="width: 18%;">Service</th>
          <th style="width: 14%;">Statut</th>
          <th>Description</th>
          <th style="width: 22%;">Derniere reparation</th>
        </tr>
      </thead>
      <tbody>
        ${incidentsRows}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Historique</div>
    <table>
      <thead>
        <tr>
          <th style="width: 20%;">Date</th>
          <th style="width: 22%;">Evenement</th>
          <th>Detail</th>
        </tr>
      </thead>
      <tbody>
        ${historyRows}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Observation</div>
    <div class="note">&nbsp;</div>
  </div>

  <div class="footer">
    <span>${SERVICE_NAME}</span>
    <span>${this.escapeHtml(asset.inventoryNumber)}</span>
  </div>
</body>
</html>`;
  }

  private infoCell(label: string, value: string, html = false): string {
    return `
<div class="cell">
  <span class="label">${this.escapeHtml(label)}</span>
  <span class="value">${html ? value : this.escapeHtml(value)}</span>
</div>`;
  }

  private buildAssignmentBlock(asset: AssetDetailPdfPayload): {
    name: string;
    role: string;
    service: string;
    assignedAt: string;
  } {
    if (!asset.currentAssignment) {
      return {
        name: 'N/A',
        role: 'N/A',
        service: 'N/A',
        assignedAt: 'N/A',
      };
    }

    const user = this.parseUser(asset.currentAssignment.user);

    return {
      name: user.name,
      role: user.role,
      service: user.service === 'N/A' ? asset.currentAssignment.department : user.service,
      assignedAt: this.formatDateTime(asset.currentAssignment.startDate),
    };
  }

  private buildWarrantySummary(
    asset: AssetDetailPdfPayload,
    now: Date,
  ): { status: string; note: string } {
    if (!asset.warrantyEndDate) {
      return {
        status: 'N/A',
        note: 'Aucune date de fin de garantie renseignee.',
      };
    }

    const diffMs = asset.warrantyEndDate.getTime() - now.getTime();
    const remainingDays = Math.ceil(diffMs / 86400000);

    if (remainingDays < 0) {
      return {
        status: 'Expiree',
        note: `Garantie expiree depuis ${Math.abs(remainingDays)} jour(s).`,
      };
    }

    if (remainingDays <= EXPIRY_ALERT_DAYS) {
      return {
        status: 'Expire bientot',
        note: `Garantie restante: ${remainingDays} jour(s).`,
      };
    }

    return {
      status: 'Valide',
      note: `Garantie restante: ${remainingDays} jour(s).`,
    };
  }

  private buildIncidentsRows(asset: AssetDetailPdfPayload): string {
    if (asset.incidentsWithRepairs.length === 0) {
      return `
<tr>
  <td colspan="5">Aucun incident enregistre pour ce materiel.</td>
</tr>`;
    }

    return asset.incidentsWithRepairs
      .map((incident) => {
        const latestRepair = this.getLatestRepair(incident.repairs);

        return `
<tr>
  <td>${this.escapeHtml(this.formatDateTime(incident.reportedAt))}</td>
  <td>${this.escapeHtml(incident.department)}</td>
  <td>${this.statusBadge(incident.status)}</td>
  <td>${this.escapeHtml(incident.description)}</td>
  <td>${this.buildRepairSummary(latestRepair)}</td>
</tr>`;
      })
      .join('');
  }

  private buildHistoryRows(asset: AssetDetailPdfPayload): string {
    if (asset.history.length === 0) {
      return `
<tr>
  <td colspan="3">Aucun historique enregistre pour ce materiel.</td>
</tr>`;
    }

    return asset.history
      .slice(0, 12)
      .map(
        (event) => `
<tr>
  <td>${this.escapeHtml(this.formatDateTime(event.createdAt))}</td>
  <td>${this.escapeHtml(event.type.replace(/_/g, ' '))}</td>
  <td>${this.escapeHtml(this.describeHistory(event.type, event.payload))}</td>
</tr>`,
      )
      .join('');
  }

  private buildRepairSummary(
    repair: AssetDetailPdfPayload['incidentsWithRepairs'][number]['repairs'][number] | null,
  ): string {
    if (!repair) return 'N/A';

    const parts = [
      `Statut: ${repair.status.replace(/_/g, ' ')}`,
      `Entree: ${this.formatDate(repair.workshopEntryDate)}`,
      repair.workshopExitDate ? `Sortie: ${this.formatDate(repair.workshopExitDate)}` : null,
      repair.technicianName ? `Technicien: ${repair.technicianName}` : null,
      repair.action ? `Action: ${repair.action}` : null,
      repair.outcome ? `Resultat: ${repair.outcome.replace(/_/g, ' ')}` : null,
      repair.cost != null ? `Cout: ${this.formatMoney(repair.cost)}` : null,
    ].filter((value): value is string => Boolean(value));

    return parts.map((value) => this.escapeHtml(value)).join('<br>');
  }

  private describeHistory(type: string, payload: unknown): string {
    const data = this.asRecord(payload);

    if (type === 'STATUS_CHANGED') {
      const from = this.readString(data, 'from') ?? 'N/A';
      const to = this.readString(data, 'to') ?? 'N/A';
      return `${from.replace(/_/g, ' ')} -> ${to.replace(/_/g, ' ')}`;
    }

    if (type === 'ASSIGNMENT_CREATED') {
      const user = this.parseUser(data);
      const department = this.readString(data, 'department') ?? user.service;
      return `Affectation: ${user.name} / ${department}`;
    }

    if (type === 'ASSIGNMENT_ENDED') {
      const user = this.parseUser(data);
      return `Fin affectation: ${user.name}`;
    }

    if (type === 'INCIDENT_REPORTED') {
      const department = this.readString(data, 'department') ?? 'N/A';
      const description = this.readString(data, 'description') ?? 'N/A';
      return `${department} - ${description}`;
    }

    if (type === 'REPAIR_STARTED') {
      const technicianName = this.readString(data, 'technicianName') ?? 'N/A';
      return `Entree atelier - technicien: ${technicianName}`;
    }

    if (type === 'REPAIR_FINISHED') {
      const outcome = this.readString(data, 'outcome') ?? 'N/A';
      return `Sortie atelier - resultat: ${outcome.replace(/_/g, ' ')}`;
    }

    if (type === 'ASSET_CREATED') {
      return 'Creation du materiel';
    }

    return this.safeJson(payload);
  }

  private getLatestRepair(
    repairs: AssetDetailPdfPayload['incidentsWithRepairs'][number]['repairs'],
  ): AssetDetailPdfPayload['incidentsWithRepairs'][number]['repairs'][number] | null {
    if (repairs.length === 0) return null;

    const sorted = [...repairs].sort(
      (a, b) => b.workshopEntryDate.getTime() - a.workshopEntryDate.getTime(),
    );

    return sorted[0];
  }

  private statusBadge(status: string): string {
    const normalizedStatus = status || 'N/A';
    return `<span class="status ${this.escapeAttribute(normalizedStatus)}">${this.escapeHtml(
      normalizedStatus.replace(/_/g, ' '),
    )}</span>`;
  }

  private parseUser(input: unknown): UserInfo {
    const data = this.asRecord(input);

    const firstName = this.readString(data, 'prenom', 'firstName');
    const lastName = this.readString(data, 'nom', 'lastName');
    const combinedName = [firstName, lastName].filter(Boolean).join(' ').trim();
    const fullName =
      combinedName ||
      this.readString(data, 'name', 'fullName', 'username') ||
      this.readStringArray(data, 'names', 'fullNames', 'beneficiaries').join(', ') ||
      'N/A';

    return {
      name: fullName,
      role: this.readString(data, 'poste', 'position', 'role', 'jobTitle') ?? 'N/A',
      service: this.readString(data, 'service', 'department') ?? 'N/A',
    };
  }

  private readString(record: Record<string, unknown>, ...keys: string[]): string | null {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }

    return null;
  }

  private readStringArray(record: Record<string, unknown>, ...keys: string[]): string[] {
    for (const key of keys) {
      const value = record[key];
      if (Array.isArray(value)) {
        const normalized = value
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean);

        if (normalized.length > 0) return normalized;
      }
    }

    return [];
  }

  private asRecord(input: unknown): Record<string, unknown> {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
    return input as Record<string, unknown>;
  }

  private safeJson(input: unknown): string {
    try {
      return JSON.stringify(input) ?? 'N/A';
    } catch {
      return 'N/A';
    }
  }

  private formatMoney(value: unknown): string {
    const candidate =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number(value)
          : typeof (value as { toNumber?: () => number })?.toNumber === 'function'
            ? (value as { toNumber: () => number }).toNumber()
            : Number(String(value));

    if (!Number.isFinite(candidate)) {
      return String(value);
    }

    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(candidate);
  }

  private formatDate(date?: Date | null): string {
    if (!date) return 'N/A';

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  private formatDateTime(date?: Date | null): string {
    if (!date) return 'N/A';

    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  private async getLogoSrc(): Promise<string> {
    for (const logoPath of LOGO_PATHS) {
      try {
        const file = await readFile(logoPath);
        return `data:image/png;base64,${file.toString('base64')}`;
      } catch {
        continue;
      }
    }

    return '';
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

  private escapeAttribute(value: string): string {
    return value.replace(/[^a-zA-Z0-9_-]/g, '_');
  }
}
