import { Router } from 'express';
import passport from 'passport';
import * as controladorGrupo from '../controladores/grupoControlador';

export const router = Router();
export const path = '/grupos';

router.get('/:id/vencedor', passport.authenticate('jwt', { session: false }), controladorGrupo.buscaVencedor);
router.get('/:id/naoVisitados', passport.authenticate('jwt', { session: false }), controladorGrupo.buscaEstabelecimentosNaoVisitados);
router.get('/:id', passport.authenticate('jwt', { session: false }), controladorGrupo.buscaGrupoPorId)
router.delete('/:id', passport.authenticate('jwt', { session: false }), controladorGrupo.removeGrupo);
router.post('/:id', passport.authenticate('jwt', { session: false }), controladorGrupo.editaGrupo)
router.put('', passport.authenticate('jwt', { session: false }), controladorGrupo.cadastraGrupo);
router.get('', passport.authenticate('jwt', { session: false }), controladorGrupo.buscaGrupo);


