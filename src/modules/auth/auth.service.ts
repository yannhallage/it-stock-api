import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { env } from '../../config/env';
import { HttpError } from '../../errors/http-error';

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 3600;

type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

const publicUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;

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
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new HttpError(
        409,
        'Un utilisateur avec cet email existe déjà.',
        'AUTH_EMAIL_ALREADY_USED',
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: hashedPassword,
        },
        select: publicUserSelect,
      });

      return this.buildSession(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
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
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        ...publicUserSelect,
        password: true,
      },
    });

    if (!user) {
      throw new HttpError(401, 'Identifiants invalides.', 'AUTH_INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(data.password, user.password);

    if (!isValid) {
      throw new HttpError(401, 'Identifiants invalides.', 'AUTH_INVALID_CREDENTIALS');
    }

    const { password: _password, ...publicUser } = user;

    return this.buildSession(publicUser);
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });

    if (!user) {
      throw new HttpError(404, "L'utilisateur n'existe pas.", 'AUTH_USER_NOT_FOUND');
    }

    return user;
  }
}
