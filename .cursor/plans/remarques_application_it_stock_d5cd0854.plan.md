---
name: Remarques application IT Stock
overview: "Application des retours utilisateur sur l'API (it-stock-api) et le frontend (it-stock-control) : impressions PDF (garantie en mois, suppression Remarque, refonte fiche Affectation, logo), s\\u00e9paration Nom/Pr\\u00e9nom de l'emprunteur (avec migration BDD), et ajout d'une barre de recherche dans l'Atelier."
todos:
  - id: garantie_pdf
    content: "Afficher la garantie en mois (durée totale) dans les PDF état du stock et fiche matériel : ajouter warrantyStartDateRaw au type/data service et helper formatWarrantyMonths."
    status: pending
  - id: remarque
    content: Supprimer la colonne Remarque (th + td + méthode buildRemark) de stock-assets-pdf.service.ts.
    status: pending
  - id: affectation
    content: "Fiche Affectation : supprimer le bloc bas de page RESPONSABLE IT / Service et corriger la résolution du logo (LOGO_PATHS)."
    status: pending
  - id: cstdid_logo
    content: Retirer CST DID dans les 6 services PDF, déposer le logo officiel dans src/modules/pdf/image.png et copier l'image dans dist via le Dockerfile API.
    status: pending
  - id: emprunteur_back
    content: "Séparer borrowerName en borrowerFirstName + borrowerLastName : schema Prisma, migration avec backfill, DTO, service, filtre, PDF, Swagger."
    status: pending
  - id: emprunteur_front
    content: "Frontend emprunteur : types, service API, DrawerScreenLoan (2 champs), affichage et recherche dans ScreenLoans.tsx."
    status: pending
  - id: atelier_search
    content: Ajouter une barre de recherche client dans Workshop.tsx (technicien, matériel, incident, action, dates).
    status: pending
  - id: doc_emprunts
    content: Rédiger l'explication du fonctionnement de la partie Matériels empruntés pour l'utilisateur.
    status: pending
isProject: false
---

## Contexte technique

- Les PDF sont g\u00e9n\u00e9r\u00e9s c\u00f4t\u00e9 API dans `it-stock-api/src/modules/pdf/services/...` (HTML -> Puppeteer).
- La garantie est stock\u00e9e en dates (`warrantyStartDate` / `warrantyEndDate`) dans `prisma/schema.prisma`.
- L'emprunteur n'a qu'un seul champ `borrowerName` (mod\u00e8le `ScreenLoan`).
- Aucun fichier logo n'existe dans le repo et le `Dockerfile` de l'API ne copie aucune image dans `dist` : c'est pourquoi le logo imprim\u00e9 est vide.

Choix valid\u00e9s : garantie en **dur\u00e9e totale en mois**, **uniquement dans les PDF** ; champ Remarque **supprim\u00e9** ; **s\u00e9paration Nom + Pr\u00e9nom** (migration) ; suppression du bloc \u00ab RESPONSABLE IT / Service \u00bb et de \u00ab CST DID \u00bb partout ; logo officiel fourni par l'utilisateur.

## 1. Garantie affich\u00e9e en mois (PDF uniquement)

- [it-stock-api/.../assets/stock-assets-pdf.types.ts](it-stock-api/src/modules/pdf/services/assets/stock-assets-pdf.types.ts) : ajouter `warrantyStartDateRaw: Date | null` dans le type `assets[]`.
- [stock-assets-pdf-data.service.ts](it-stock-api/src/modules/pdf/services/assets/stock-assets-pdf-data.service.ts) : alimenter `warrantyStartDateRaw: asset.warrantyStartDate ?? null`.
- [stock-assets-pdf.service.ts](it-stock-api/src/modules/pdf/services/assets/stock-assets-pdf.service.ts) : remplacer la cellule `formatDate(row.warrantyEndDateRaw)` par un nouveau helper `formatWarrantyMonths(start, end)` retournant `\"24 mois\"` (calcul en mois entre d\u00e9but et fin ; repli sur `entryDateRaw` si d\u00e9but absent, `N/A` si fin absente).
- [asset-detail-pdf.service.ts](it-stock-api/src/modules/pdf/services/asset-detail-pdf.service.ts) : dans la section `Garantie`, remplacer les cellules `Debut garantie` / `Fin garantie` (dates) par une cellule `Duree garantie` en mois ; conserver `Etat garantie` et `Observation`.

## 2. Suppression du champ Remarque (impression \u00e9tat du stock)

- [stock-assets-pdf.service.ts](it-stock-api/src/modules/pdf/services/assets/stock-assets-pdf.service.ts) : retirer le `<th>Remarque</th>`, la cellule `<td>${this.buildRemark(...)}</td>` et la m\u00e9thode `buildRemark` (et le param\u00e8tre `generatedAt` de `buildRow` s'il devient inutile). KPI \u00ab GARANTIE <= 90J \u00bd conserv\u00e9.

## 3. Fiche Affectation imprim\u00e9e

- [assignment-sheet-pdf.service.ts](it-stock-api/src/modules/pdf/services/assignments/assignment-sheet-pdf.service.ts) :
  - Supprimer enti\u00e8rement le bloc bas de page `.info` (\u00ab RESPONSABLE IT / Service / Date impression \u00bd) et la constante `SERVICE_NAME` ; r\u00e9ajuster la zone `.bottom` (la `status-box` reste seule).
  - Corriger la r\u00e9solution du logo : remplacer le `LOCAL_LOGO_PATH` unique (chemin erron\u00e9 `dist/modules/pdf/services/image.png`) par le m\u00eame tableau `LOGO_PATHS` que les autres services (`src/modules/pdf/image.png`).

## 4. Suppression de \u00ab CST DID \u00bd partout + logo officiel

- Retirer la mention `CST DID` (constante `SERVICE_NAME = 'CST DID'`) dans les 6 services PDF : stock-assets, screen-loans, asset-detail, suppliers, incidents, assignments. Concr\u00e8tement, supprimer les lignes `Service: CST DID` et les `<span>${SERVICE_NAME}</span>` des pieds de page (on conserve la date).
- Logo : d\u00e9poser le fichier officiel fourni dans `it-stock-api/src/modules/pdf/image.png`.
- [it-stock-api/Dockerfile](it-stock-api/Dockerfile) : ajouter la copie de l'image vers le runtime, ex. apr\u00e8s le build `COPY --from=builder /app/src/modules/pdf/image.png ./dist/modules/pdf/image.png` (sinon le logo reste introuvable en production).

## 5. Emprunteur : s\u00e9paration Nom + Pr\u00e9nom (BDD)

Backend :
- [prisma/schema.prisma](it-stock-api/prisma/schema.prisma) : dans `ScreenLoan`, remplacer `borrowerName String` par `borrowerLastName String` + `borrowerFirstName String`.
- Nouvelle migration Prisma : ajouter les 2 colonnes, **backfill** (`borrowerLastName = borrowerName`, `borrowerFirstName = ''`) puis supprimer `borrowerName`.
- [dto/create-screen-loan.dto.ts](it-stock-api/src/modules/screen-loans/dto/create-screen-loan.dto.ts) : valider `borrowerFirstName` + `borrowerLastName` (au moins le nom requis).
- [screen-loans.service.ts](it-stock-api/src/modules/screen-loans/screen-loans.service.ts) : `createLoan` (data + payload `historyEvent`), `listLoans` (filtre nom).
- [dto/filter-screen-loans.dto.ts](it-stock-api/src/modules/screen-loans/dto/filter-screen-loans.dto.ts) : adapter le filtre `borrowerName` (recherche sur les 2 champs).
- [screen-loans-pdf.service.ts](it-stock-api/src/modules/pdf/services/screen-loans/screen-loans-pdf.service.ts) : type interne + affichage `Emprunteur` = `\"Pr\u00e9nom Nom\"` (liste + fiche), et `computeMetrics` (set des emprunteurs).
- Mettre \u00e0 jour la doc Swagger dans [screen-loans.controller.ts](it-stock-api/src/modules/screen-loans/screen-loans.controller.ts).

Frontend :
- [src/types.ts](it-stock-control/src/types.ts) : `ScreenLoan` -> `borrowerFirstName` / `borrowerLastName`.
- [api/services/screen-loans.service.ts](it-stock-control/src/api/services/screen-loans.service.ts) : `CreateScreenLoanPayload`.
- [components/drawers/DrawerScreenLoan.tsx](it-stock-control/src/components/drawers/DrawerScreenLoan.tsx) : 2 champs \u00ab Nom \u00bd et \u00ab Pr\u00e9nom \u00bd.
- [pages/ScreenLoans.tsx](it-stock-control/src/pages/ScreenLoans.tsx) : colonne \u00ab Emprunteur \u00bd affiche Nom + Pr\u00e9nom ; recherche `filteredLoans` inclut les 2 champs.

## 6. Atelier : barre de recherche

- [pages/Workshop.tsx](it-stock-control/src/pages/Workshop.tsx) : ajouter un \u00e9tat `searchTerm`, un `<Input>` de recherche, et un `filteredRepairs` (useMemo) filtrant c\u00f4t\u00e9 client par technicien (`technicianName`), mat\u00e9riel (inventaire/marque/mod\u00e8le), incident/direction, action et dates format\u00e9es d'entr\u00e9e/sortie. La table it\u00e8re sur `filteredRepairs`.

## 7. Fonctionnement \u00ab Mat\u00e9riels emprunt\u00e9s \u00bd (explication)

Aucun changement de code requis : explication du flux fournie \u00e0 l'utilisateur (mat\u00e9riel \u00e9ligible = `EN_STOCK_NON_AFFECTE` non d\u00e9j\u00e0 pr\u00eat\u00e9 -> enregistrement -> passage `EN_PRET` + historique -> suivi/retards -> \u00ab Marquer retourn\u00e9 \u00bd -> retour `EN_STOCK_NON_AFFECTE` -> impression fiche/liste).

## V\u00e9rifications finales

- Lint front (`it-stock-control`) sur les fichiers modifi\u00e9s.
- Build TypeScript API + `prisma generate` ; ex\u00e9cuter la migration sur la base de dev.
- Test impression : \u00e9tat du stock (garantie en mois, sans Remarque), fiche Affectation (logo + sans bloc Responsable/CST DID), emprunts (Nom + Pr\u00e9nom).