import { Router } from 'express';
import passport from 'passport';
import * as controladorUsuario from '../controladores/usuarioControlador';

export const router = Router();
export const path = '/usuarios';

router.get('/nome?', passport.authenticate('jwt', { session: false }), controladorUsuario.buscaUsuariosPorNome);
router.post('/:email/grupo=:grupo', passport.authenticate('jwt', { session: false }), controladorUsuario.participaGrupo);
router.post('/:email/grupo=:grupo/estab=:estab', passport.authenticate('jwt', { session: false }), controladorUsuario.votaEstabelecimento);
router.get('/:email', passport.authenticate('jwt', { session: false }), controladorUsuario.buscaUsuariosPorEmail);
router.delete('/:email', passport.authenticate('jwt', { session: false }), controladorUsuario.removeUsuario);
router.post('/:email', passport.authenticate('jwt', { session: false }), controladorUsuario.editaUsuario);
router.put('', controladorUsuario.cadastraUsuario);
router.get('', passport.authenticate('jwt', { session: false }), controladorUsuario.buscaUsuarios);


