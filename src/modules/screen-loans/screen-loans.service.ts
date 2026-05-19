import { prisma } from '../../prisma/client';
import { logger } from '../../logger';
import { AssetStatus, HistoryEventType, Prisma } from '@prisma/client';
import { HttpError } from '../../errors/http-error';
import { CreateScreenLoanDto } from './dto/create-screen-loan.dto';
import { ScreenLoanFilterDto } from './dto/filter-screen-loans.dto';

export class ScreenLoansService {
  async createLoan(data: CreateScreenLoanDto) {
    logger.info(
      { assetId: data.assetId, borrowerName: data.borrowerName },
      '[ScreenLoansService] Création emprunt matériel demandée',
    );

    const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) {
      return null;
    }

    if (asset.status !== AssetStatus.EN_STOCK_NON_AFFECTE) {
      throw new HttpError(
        400,
        'Seul un matériel en stock non affecté peut être prêté.',
        'SCREEN_LOAN_ASSET_NOT_AVAILABLE',
      );
    }

    const existingActive = await prisma.screenLoan.findFirst({
      where: { assetId: data.assetId, returnedAt: null },
    });
    if (existingActive) {
      throw new HttpError(
        400,
        'Un emprunt est déjà en cours pour ce matériel (non retourné).',
        'SCREEN_LOAN_ALREADY_ACTIVE',
      );
    }

    try {
      const loan = await prisma.$transaction(async (tx) => {
        const created = await tx.screenLoan.create({
          data: {
            assetId: data.assetId,
            borrowerName: data.borrowerName,
            borrowerDepartment: data.borrowerDepartment,
            loanDate: data.loanDate,
            expectedReturnDate: data.expectedReturnDate,
            note: data.note,
          },
        });

        await tx.asset.update({
          where: { id: data.assetId },
          data: { status: AssetStatus.EN_PRET },
        });

        await tx.historyEvent.create({
          data: {
            assetId: data.assetId,
            type: HistoryEventType.STATUS_CHANGED,
            payload: {
              from: asset.status,
              to: AssetStatus.EN_PRET,
              screenLoanId: created.id,
              borrowerName: created.borrowerName,
              borrowerDepartment: created.borrowerDepartment,
              note: created.note,
            },
          },
        });

        return tx.screenLoan.findUnique({
          where: { id: created.id },
          include: {
            asset: {
              select: {
                id: true,
                inventoryNumber: true,
                type: true,
                brand: true,
                model: true,
                status: true,
              },
            },
          },
        });
      });

      return loan;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          400,
          "Les données fournies pour créer l'emprunt de matériel sont invalides.",
          'SCREEN_LOAN_VALIDATION_ERROR',
        );
      }
      throw error;
    }
  }

  async listLoans(filters: ScreenLoanFilterDto) {
    logger.debug({ filters }, '[ScreenLoansService] Listing emprunts matériel');

    const where: any = {};

    if (filters.borrowerName) {
      where.borrowerName = { contains: filters.borrowerName, mode: 'insensitive' };
    }

    if (filters.status === 'RETURNED') {
      where.returnedAt = { not: null };
    } else if (filters.status === 'NOT_RETURNED') {
      where.returnedAt = null;
    }

    const loans = await prisma.screenLoan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        asset: {
          select: {
            id: true,
            inventoryNumber: true,
            type: true,
            brand: true,
            model: true,
            status: true,
          },
        },
      },
    });

    return loans;
  }

  async returnLoan(id: number) {
    logger.info({ id }, '[ScreenLoansService] Retour emprunt matériel demandé');

    const existing = await prisma.screenLoan.findUnique({
      where: { id },
      include: { asset: true },
    });
    if (!existing) {
      return null;
    }

    if (existing.returnedAt) {
      throw new HttpError(400, 'Cet emprunt est déjà marqué comme retourné.', 'SCREEN_LOAN_ALREADY_RETURNED');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const returnedAt = new Date();

      await tx.screenLoan.update({
        where: { id },
        data: { returnedAt },
      });

      if (existing.asset.status === AssetStatus.EN_PRET) {
        await tx.asset.update({
          where: { id: existing.assetId },
          data: { status: AssetStatus.EN_STOCK_NON_AFFECTE },
        });

        await tx.historyEvent.create({
          data: {
            assetId: existing.assetId,
            type: HistoryEventType.STATUS_CHANGED,
            payload: {
              from: AssetStatus.EN_PRET,
              to: AssetStatus.EN_STOCK_NON_AFFECTE,
              screenLoanId: existing.id,
              returnedAt: returnedAt.toISOString(),
            },
          },
        });
      }

      return tx.screenLoan.findUnique({
        where: { id },
        include: {
          asset: {
            select: {
              id: true,
              inventoryNumber: true,
              type: true,
              brand: true,
              model: true,
              status: true,
            },
          },
        },
      });
    });

    return updated;
  }
}

