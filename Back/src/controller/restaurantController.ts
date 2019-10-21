import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as restaurantRepository from '../persistence/restaurantRepository';
import { Restaurant } from '../entities/restaurant';


export async function saveRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {

    try{

        const errors = validationResult(req);
        
        if(!errors.isEmpty()) {

            res.status(422).json({ errors: errors.array() });

        } else {

            const newRestaurant = req.body as Restaurant;
            const restaurant = await restaurantRepository.saveRestaurant(newRestaurant);
            res.status(201).json(restaurant);

        }

    }   catch (error) {
        
        next(error);

    }

}

export async function findRestaurantById(req: Request, res: Response, next: NextFunction): Promise<void> {

    try{

        const errors = validationResult(req);

        if(!errors.isEmpty()) {


            res.status(422).json({ errors: errors.array() });

        } else {

            const { id } = req.params;
            const restaurant = await restaurantRepository.findRestaurantById(id);
           
            if (restaurant !== null) {

                res.json(restaurant).end();

            } else {

                res.status(404).send('Restaurante não encontrado.').end;

            }

        }

    } catch(error) {

        next(error);

    }

}

export async function findAllRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {

    try{

        
        const restaurants = await restaurantRepository.findAllRestaurants();
        
        if(restaurants.length === 0) {

            res.status(200).json(restaurants).send('Não foi possível encontrar nenhum dado.');

        }

        res.status(200).json(restaurants);

    } catch(error) {

        next(error);

    }

}

export async function updateRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {

    try{

        const errors = validationResult(req);

        if(!errors.isEmpty()) {

            res.status(422).json({ errors: errors.array() }); 

        } else {

            const { id } = req.params;
            const newDatas = req.body;
            const update = await restaurantRepository.updateRestaurant(id, newDatas);

            if(!update) {

                res.sendStatus(400).send('Não foi possível atualizar o restaurante.').end();

            }

        }

        res.status(200).json('Restaurante atualizado com sucesso.');

    } catch(error) {

        next(error);

    }

}

export async function deleteRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {

    try{

        const errors = validationResult(req);

        if(!errors.isEmpty()) {

            res.status(422).json({ errors: errors.array() }); 

        } else {
            
            let restaurant = req.query.id;
            const answer = await restaurantRepository.deleteRestaurants(restaurant);

            if (answer > 0) {
                
                res.status(200).json('Restaurantes excluidos com sucesso').end();
                
            } else {

                res.status(404).json('Não foi possível excluir os restaurantes, tente novamente').end();

            }
            
        }

    } catch(error) {

        next(error);

    }

}