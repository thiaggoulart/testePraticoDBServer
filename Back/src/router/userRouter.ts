import * as userController from '../controller/userController'
import { Router } from "express";
import { expressValidator, expressValidatorId } from '../controller/requestHandler';

export const router = Router();
export const path = '/user';

router.get('', userController.findAllUsers);
router.get('/id', expressValidatorId, userController.findUserById);
router.put('',expressValidator, userController.saveUser);
router.delete('/ids?', expressValidatorId, userController.deleteUsers);
router.post('/:id',expressValidator, userController.updateUser);