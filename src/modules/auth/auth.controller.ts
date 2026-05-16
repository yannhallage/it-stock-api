import { Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { validateRegisterDto } from './dto/register.dto';
import { validateLoginDto } from './dto/login.dto';
import { AuthRequest } from './auth.middleware';

const authService = new AuthService();

export class AuthController {
  /**
   * @swagger
   * tags:
   *   name: Auth
   *   description: Gestion de l'authentification
   */

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Création d'un nouvel utilisateur
   *     tags: [Auth]
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 minLength: 6
   *               confirmPassword:
   *                 type: string
   *                 description: Optionnel. Si fourni, doit correspondre au mot de passe.
   *     responses:
   *       201:
   *         description: Utilisateur créé et authentifié
   *       409:
   *         description: Email déjà utilisé
   *       400:
   *         description: Données invalides
   */
  register = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateRegisterDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const session = await authService.register(value!);

      return res.status(201).json(session);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Connexion d'un utilisateur
   *     tags: [Auth]
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 minLength: 6
   *     responses:
   *       200:
   *         description: Authentification réussie - utilisez "accessToken" dans Authorize (bouton cadenas)
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accessToken:
   *                   type: string
   *                   description: JWT à coller dans Swagger (Authorize)
   *                 tokenType:
   *                   type: string
   *                   example: Bearer
   *                 expiresIn:
   *                   type: integer
   *                   description: Durée de validité en secondes
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     name:
   *                       type: string
   *                     email:
   *                       type: string
   *       400:
   *         description: Données invalides
   *       401:
   *         description: Identifiants invalides
   */
  login = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateLoginDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const session = await authService.login(value!);

      return res.status(200).json(session);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     summary: Récupère le profil de l'utilisateur connecté
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Profil utilisateur
   *       401:
   *         description: Non authentifié
   */
  me = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Non authentifié.' });
      }

      const user = await authService.getProfile(req.user.id);

      return res.status(200).json(user);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: Déconnexion côté client
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Déconnexion confirmée
   *       401:
   *         description: Non authentifié
   */
  logout = async (_req: AuthRequest, res: Response) => {
    return res.status(200).json({
      message: 'Déconnexion effectuée. Supprimez le token côté client.',
    });
  };
}
