import { Router } from 'express';
import passport from 'passport';
import * as controladorRestaurante from '../controlador/restauranteControlador';

export const router = Router();
export const path = '/restaurantes';

router.get('/nome?', passport.authenticate('jwt', { session: false }), controladorRestaurante.buscaRestaurantePorNome);
router.get('/end?', passport.authenticate('jwt', { session: false }), controladorRestaurante.buscaRestaurantePorLocalizacao);
router.get('/:id', passport.authenticate('jwt', { session: false }), controladorRestaurante.buscaRestaurantePorId);
router.delete('/:id', passport.authenticate('jwt', { session: false }), controladorRestaurante.removeRestaurante);
router.post('/:id/grupo=:grupo', passport.authenticate('jwt', { session: false }), controladorRestaurante.insereRestauranteNoGrupo);
router.post('/:id', passport.authenticate('jwt', { session: false }), controladorRestaurante.editaRestaurante)
router.put('', passport.authenticate('jwt', { session: false }), controladorRestaurante.cadastraRestaurante);
router.get('', passport.authenticate('jwt', { session: false }), controladorRestaurante.buscaRestaurantes);


