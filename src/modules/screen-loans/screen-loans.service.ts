import { prisma } from '../../prisma/client';
import { logger } from '../../logger';
import { Prisma } from '@prisma/client';
import { HttpError } from '../../errors/http-error';
import { CreateScreenLoanDto } from './dto/create-screen-loan.dto';
import { ScreenLoanFilterDto } from './dto/filter-screen-loans.dto';

export class ScreenLoansService {
  async createLoan(data: CreateScreenLoanDto) {
    logger.info(
      { assetId: data.assetId, borrowerName: data.borrowerName },
      '[ScreenLoansService] Création emprunt écran demandée',
    );

    const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) {
      return null;
    }

    const existingActive = await prisma.screenLoan.findFirst({
      where: { assetId: data.assetId, returnedAt: null },
    });
    if (existingActive) {
      throw new HttpError(
        400,
        "Un emprunt est déjà en cours pour cet écran (non retourné).",
        'SCREEN_LOAN_ALREADY_ACTIVE',
      );
    }

    try {
      const loan = await prisma.screenLoan.create({
        data: {
          assetId: data.assetId,
          borrowerName: data.borrowerName,
          loanDate: data.loanDate,
          expectedReturnDate: data.expectedReturnDate,
        },
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

      return loan;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          400,
          "Les données fournies pour créer l'emprunt d'écran sont invalides.",
          'SCREEN_LOAN_VALIDATION_ERROR',
        );
      }
      throw error;
    }
  }

  async listLoans(filters: ScreenLoanFilterDto) {
    logger.debug({ filters }, '[ScreenLoansService] Listing emprunts écrans');

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
    logger.info({ id }, '[ScreenLoansService] Retour emprunt écran demandé');

    const existing = await prisma.screenLoan.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }

    if (existing.returnedAt) {
      throw new HttpError(400, 'Cet emprunt est déjà marqué comme retourné.', 'SCREEN_LOAN_ALREADY_RETURNED');
    }

    const updated = await prisma.screenLoan.update({
      where: { id },
      data: { returnedAt: new Date() },
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

    return updated;
  }
}

