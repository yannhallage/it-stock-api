import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { env } from '../../config/env';
import { logger } from '../../logger';
import { HttpError } from '../../errors/http-error';

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 3600;

type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export class AuthService {
  private buildSession(user: PublicUser) {
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
      },
      env.jwtSecret,
      {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      },
    );

    return {
      user,
      accessToken,
      tokenType: 'Bearer',
      expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    };
  }

  async register(data: RegisterDto) {
    logger.info({ email: data.email }, '[AuthService] Tentative inscription utilisateur');
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      logger.warn({ email: data.email }, '[AuthService] Inscription échouée: utilisateur déjà existant');
      throw new HttpError(
        409,
        'Un utilisateur avec cet email existe déjà.',
        'AUTH_EMAIL_ALREADY_USED',
      );
    }

    logger.debug({ email: data.email }, '[AuthService] Hachage du mot de passe');
    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.info({ id: user.id, email: user.email }, '[AuthService] Utilisateur créé avec succès');

      return this.buildSession(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        logger.warn(
          { email: data.email, err: error },
          '[AuthService] Inscription échouée: email déjà utilisé',
        );
        throw new HttpError(
          409,
          'Un utilisateur avec cet email existe déjà.',
          'AUTH_EMAIL_ALREADY_USED',
        );
      }

      throw error;
    }
  }

  async login(data: LoginDto) {
    logger.info({ email: data.email }, '[AuthService] Tentative connexion utilisateur');
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      logger.warn({ email: data.email }, '[AuthService] Connexion échouée: utilisateur non trouvé');
      throw new HttpError(401, 'Identifiants invalides.', 'AUTH_INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(data.password, user.password);

    if (!isValid) {
      logger.warn({ email: data.email }, '[AuthService] Connexion échouée: mot de passe incorrect');
      throw new HttpError(401, 'Identifiants invalides.', 'AUTH_INVALID_CREDENTIALS');
    }

    logger.info({ id: user.id, email: user.email }, '[AuthService] Connexion réussie');
    const { password: _password, ...publicUser } = user;

    return this.buildSession(publicUser);
  }

  async getProfile(userId: string) {
    logger.debug('[AuthService] Récupération profil utilisateur');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      logger.warn({ userId }, '[AuthService] Utilisateur non trouvé');
      throw new HttpError(404, "L'utilisateur n'existe pas.", 'AUTH_USER_NOT_FOUND');
    }

    logger.info({ userId: user.id, email: user.email }, '[AuthService] Profil utilisateur récupéré');
    return user;
  }
}
