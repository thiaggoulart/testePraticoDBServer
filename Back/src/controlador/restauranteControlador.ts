import { Request, Response, NextFunction } from 'express';
import { Restaurante, RestauranteBusca } from '../entidades/restaurante';
import * as restauranteRepositorio from '../persistencia/restauranteRepositorio';
import * as negocio from '../negocio/negocio';
import { buscaGrupoPorId } from '../persistencia/grupoRepositorio';

export async function cadastraRestaurante(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const restaurante = req.body as Restaurante;
        const restauranteCadastrado = await restauranteRepositorio.cadastraRestaurante(restaurante);
        if (restauranteCadastrado) {
            res.status(201).json(restauranteCadastrado);
        } else {
            res.status(500).send('Restaurante não cadastrado. Por favor, tente novamente.');
        }
    } catch (err) {
        next(err);
    }
}

export async function editaRestaurante(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const restaurante = req.body as RestauranteBusca;
        const restauranteAlterado = await restauranteRepositorio.editaRestaurante(id, restaurante);
        if (restauranteAlterado) {
            res.status(200).json(restauranteAlterado);
        } else {
            res.status(500).end();
        }
    } catch (err) {
        next(err);
    }
}

export async function removeRestaurante(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const restauranteRemovido = await restauranteRepositorio.removeRestaurante(id);
        if (restauranteRemovido > 0) {
            res.status(200).end();
        } else {
            res.status(500).end();
        }
    } catch (err) {
        next(err);
    }
}

export async function buscaRestaurantes(req: Request, res: Response, next: NextFunction) {
    try {
        const restaurantes = await restauranteRepositorio.buscaRestaurante();
        if (restaurantes.length === 0) {
            res.status(200).send('Nenhum restaurante cadastrado').json(restaurantes);
        }
        res.status(200).json(restaurantes);
    } catch (err) {
        next(err);
    }
}

export async function buscaRestaurantePorId(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const restaurante = await restauranteRepositorio.buscaRestaurantePorId(id);
        if (!restaurante) {
            res.status(404).send('Nenhum restaurante foi encontrado');
        }
        res.status(200).json(restaurante);
    } catch (error) {
        next(error);
    }
}

export async function buscaRestaurantePorLocalizacao(req: Request, res: Response, next: NextFunction) {
    try {
        const { q } = req.query;
        const restaurantes = await restauranteRepositorio.buscaRestaurantePorLocalizacao(q);
        if (restaurantes.length === 0) {
            res.status(404).send('Nenhum restaurante foi encontrado');
        }
        res.status(200).json(restaurantes);
    } catch (error) {
        next(error);
    }
}

export async function buscaRestaurantePorNome(req: Request, res: Response, next: NextFunction) {
    try {
        const { q } = req.query;
        const restaurantes = await restauranteRepositorio.buscaRestaurantePorNome(q);
        if (restaurantes.length === 0) {
            res.status(404).send('Nenhum restaurante foi encontrado');
        }
        res.status(200).json(restaurantes);
    } catch (error) {
        next(error);
    }
}

export async function insereRestauranteNoGrupo(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const { grupo } = req.params;
        if (!await buscaGrupoPorId(grupo)) {
            res.status(404).send('Nenhum grupo foi encontrado');
        }
        const result = await negocio.insereRestauranteNoGrupo(grupo, id);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

