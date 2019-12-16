import { Request, Response, NextFunction } from 'express';
import { Grupo, GrupoBusca } from '../entidades/grupo';
import * as grupoRepo from '../persistencia/grupoRepositorio';
import * as negocio from '../negocio/negocio';

export async function cadastraGrupo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const grupo = req.body as Grupo;
        const grupoCadastrado = await grupoRepo.cadastraGrupo(grupo);
        if (grupoCadastrado) {
            res.status(201).json(grupoCadastrado);
        } else {
            res.status(500).send('Não foi possível criar um grupo. Por favor tente novamente.');
        }
    } catch (err) {
        next(err);
    }
}

export async function editaGrupo(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const grupo = req.body as GrupoBusca;
        const grupoAlterado = await grupoRepo.editaGrupo(id, grupo);
        if (grupoAlterado) {
            res.status(200).json(grupoAlterado);
        } else {
            res.status(500).send('Não foi possível atualizar o grupo. Por favor tente novamente mais tarde.');
        }
    } catch (err) {
        next(err);
    }
}

export async function removeGrupo(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const grupoRemovido = await grupoRepo.removeGrupo(id);
        if (grupoRemovido > 0) {
            res.status(200).send('Grupo removido com sucesso!');
        } else {
            res.status(500).end('Não foi possível remover o grupo. Por favor tente novamente.');
        }
    } catch (err) {
        next(err);
    }
}

export async function buscaGrupo(req: Request, res: Response, next: NextFunction) {
    try {
        const grupos = await grupoRepo.buscaGrupo();
        if (grupos.length === 0) {
            res.status(200).json(grupos);
        }
        res.status(200).json(grupos);
    } catch (err) {
        next(err);
    }
}

export async function buscaGrupoPorId(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const grupo = await grupoRepo.buscaGrupoPorId(id);
        if (!grupo) {
            res.status(404).send('Nenhum grupo foi encontrado');
        }
        res.status(200).json(grupo);
    } catch (error) {
        next(error);
    }
}


export async function buscaVencedor(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const vencedor = await negocio.mostraResultado(id);
        res.status(200).json(vencedor);
    } catch (error) {
        next(error);
    }
}

export async function buscaRestaurantesNaoVisitados(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const lista = await negocio.buscaRestauranteNaoVisitados(id);
        res.status(200).json(lista);
    } catch (error) {
        next(error);
    }
}


