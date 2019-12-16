import { usuarioModel } from './usuarioModel';
import { Usuario } from '../entidades/usuario';
import { hash } from 'bcrypt';

async function verificaEmail(email: string): Promise<Usuario | null> {
    return usuarioModel.findOne().where('email').equals(email).exec();
}

export async function cadastraUsuario(usuario: Usuario): Promise<Usuario> {
    usuario.email = usuario.email.toLowerCase();
    console.log(usuario.email);
    const buscaEmail = await verificaEmail(usuario.email);
    if (buscaEmail) {
        throw new Error('E-mail já cadastrado.');
    }
    const hashSenha = await hash(usuario.senha, 10);
    usuario.senha = hashSenha;
    return usuarioModel.create(usuario);
}

export async function buscaUsuarios(): Promise<Usuario[]> {
    return usuarioModel.find().exec();
}

export async function buscaUsuarioPorEmail(email: string): Promise<Usuario | null> {
    return usuarioModel.findOne().where('email').equals(email.toLowerCase()).exec();
}

export async function buscaUsuarioPorEmailComSenha(email: string): Promise<Usuario | null> {
    return usuarioModel.findOne().where('email').equals(email).select('+senha');
}

export async function buscaUsuarioPorNome(nome: string): Promise<Usuario[]> {
    return usuarioModel.find().where('nome').equals(new RegExp(nome, 'i')).exec();
}

export async function editaUsuario(email: string, usuario: Usuario): Promise<Usuario | null> {
    const buscaUsuario = await usuarioModel.findOne().where('email').equals(email.toLowerCase()).exec();
    if (buscaUsuario !== null) {
        const buscaEmail = await verificaEmail(usuario.email);
        if (buscaEmail && usuario.email !== buscaUsuario.email) {
            throw new Error('E-mail já cadastrado. Favor utilizar outro e-mail.')
        }
        buscaUsuario.email = usuario.email;
        buscaUsuario.nome = usuario.nome;
        return buscaUsuario.save();
    } else {
        throw new Error('E-mail não encontrado');
    }
}

export async function removeUsuario(email: string): Promise<number> {
    const deletaUsuario = await usuarioModel.deleteOne({ email: email }).exec();
    return deletaUsuario.n || 0;
}