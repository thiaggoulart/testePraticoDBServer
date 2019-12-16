import { Request, Response, NextFunction } from 'express';
import { Usuario } from '../entidades/usuario';
import * as usuarioRepo from '../persistencia/usuarioRepositorio';
import * as negocio from '../negocio/negocio';

export async function cadastraUsuario(req: Request, res: Response, next: NextFunction) {
    try {
        const usuario = req.body as Usuario;
        const usuarioCadastrado = await usuarioRepo.cadastraUsuario(usuario);
        res.status(201).json(usuarioCadastrado);
    } catch (err) {
        next(err);
    }
}

export async function editaUsuario(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = req.params;
        const usuario = req.body as Usuario;
        const usuarioAlterado = await usuarioRepo.editaUsuario(email, usuario);
        res.status(200).json(usuarioAlterado);

    } catch (err) {
        next(err);
    }
}

export async function removeUsuario(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = req.params;
        const remove = await usuarioRepo.removeUsuario(email);
        if (remove > 0) {
            res.status(200).send('Usuário removido com sucesso.');
        } else {
            res.status(500).send('Ocorreu um erro, por favor tente novamente.')
        }
    } catch (err) {
        next(err);
    }
}

export async function buscaUsuariosPorEmail(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = req.params
        const usuarios = await usuarioRepo.buscaUsuarioPorEmail(email);
        if (!usuarios) {
            res.status(404).send('Nenhum usuário foi encontrado');
        }
        res.status(200).json(usuarios);
    } catch (error) {
        next(error);
    }
}

export async function buscaUsuariosPorNome(req: Request, res: Response, next: NextFunction) {
    try {
        const { q } = req.query
        const usuarios = await usuarioRepo.buscaUsuarioPorNome(q);
        if (usuarios.length < 1) {
            res.status(404).send('Nenhum usuário foi encontrado');
        }
        res.status(200).json(usuarios);
    } catch (error) {
        next(error);
    }
}

export async function buscaUsuarios(req: Request, res: Response, next: NextFunction) {
    try {
        const usuarios = await usuarioRepo.buscaUsuarios();
        res.status(200).json(usuarios);
    } catch (error) {
        next(error);
    }
}

export async function participaGrupo(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = req.params;
        const { grupo } = req.params;

        await negocio.participaGrupo(grupo, email);
        res.status(200).send('Você ingressou ao grupo com sucesso');

    } catch (error) {
        next(error);
    }
}

export async function votaRestaurante(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = req.params;
        const { estab } = req.params;
        const { grupo } = req.params;
        await negocio.votaRestaurante(email, estab, grupo);
        res.status(200).send('Restaurante votado com sucesso.');

    } catch (error) {
        next(error);
    }
}


