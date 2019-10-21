import { Router } from 'express';
import * as restaurantController from '../controller/restaurantController'
import { expressValidatorId, expressValidator } from '../controller/requestHandler';

export const router = Router();
export const path = '/restaurant';

router.get('', restaurantController.findAllRestaurants);
router.get('/id', expressValidatorId, restaurantController.findRestaurantById);
router.put('',expressValidator, restaurantController.saveRestaurant);
router.delete('/ids?', expressValidatorId, restaurantController.deleteRestaurants);
router.post('/:id',expressValidator, restaurantController.updateRestaurant);