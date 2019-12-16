import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
export const router = Router();

router.post('/login', (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
        try {
            if (err || !user) {
                res.status(404).json(info);
                return next(err);
            }
            req.logIn(user, { session: false }, (err) => {
                if (err) {
                    res.status(404).json(info);
                    return next(err);
                }
                const token = jwt.sign({ user: user.email }, '62d595398e63cca06584016fdf35ab99', { expiresIn: 86400 });
                return res.json({
                    usuario: user,
                    token: token
                });
            });
        }
        catch (error) {
            return next(error);
        }
    })(req, res, next);
});
