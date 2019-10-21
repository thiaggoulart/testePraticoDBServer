import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { User } from "../entities/user";
import * as userRepository from '../persistence/userRepository';

export async function saveUser(req: Request, res: Response, next: NextFunction): Promise<void> {

    try{

        const errors = validationResult(req);
        
        if(!errors.isEmpty()) {

            res.status(422).json({ errors: errors.array() });

        } else {

            const newUser = req.body as User;
            const user = await userRepository.saveUser(newUser);
            res.status(201).json(user);

        }

    }   catch (error) {
        
        next(error);

    }

}

export async function findUserById(req: Request, res: Response, next: NextFunction): Promise<void> {

    try{

        const errors = validationResult(req);

        if(!errors.isEmpty()) {


            res.status(422).json({ errors: errors.array() });

        } else {

            const { id } = req.params;
            const user = await userRepository.findUserById(id);
           
            if (user !== null) {

                res.json(user).end();

            } else {

                res.status(404).send('Usuário não encontrado.').end;

            }

        }

    } catch(error) {

        next(error);

    }

}

export async function findAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {

    try{

        
        const users = await userRepository.findAllUsers();
        
        if(users.length === 0) {

            res.status(200).json(users).send('Não foi possível encontrar nenhum dado.');

        }

        res.status(200).json(users);

    } catch(error) {

        next(error);

    }

}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {

    try{

        const errors = validationResult(req);

        if(!errors.isEmpty()) {

            res.status(422).json({ errors: errors.array() }); 

        } else {

            const { id } = req.params;
            const newDatas = req.body;
            const update = await userRepository.updateUser(id, newDatas);

            if(!update) {

                res.sendStatus(400).send('Não foi possível atualizar o usuário.').end();

            }

        }

        res.status(200).json('Usuário atualizado com sucesso.');

    } catch(error) {

        next(error);

    }

}

export async function deleteUsers(req: Request, res: Response, next: NextFunction): Promise<void> {

    try{

        const errors = validationResult(req);

        if(!errors.isEmpty()) {

            res.status(422).json({ errors: errors.array() }); 

        } else {
            
            let user = req.query.id;
            const answer = await userRepository.deleteUsers(user);

            if (answer > 0) {
                
                res.status(200).json('Usuários excluidos com sucesso').end();
                
            } else {

                res.status(404).json('Não foi possível excluir os usuários, tente novamente').end();

            }
            
        }

    } catch(error) {

        next(error);

    }

}