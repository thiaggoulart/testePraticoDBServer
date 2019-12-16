import * as usuarioRepo from '../persistencia/usuarioRepositorio';
import { connect, connection } from 'mongoose';
import { Usuario } from '../entidades/usuario';
import { config } from 'dotenv';

beforeAll(async () => {
    config();
    const env = process.env; 
    const url = `mongodb://${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_BD}Usuario`;    
    await connect(url, { useNewUrlParser: true });
});

afterEach(async () => {
    const listaUsuario = await usuarioRepo.buscaUsuarios();
    listaUsuario.forEach(async usuario => {
        await usuarioRepo.removeUsuario(usuario.email);
    });
})

afterAll(async () => {
    const listaUsuario = await usuarioRepo.buscaUsuarios();
    listaUsuario.forEach(async usuario => {
        await usuarioRepo.removeUsuario(usuario.email);
    });
    connection.collection('Usuario').drop;
    await connection.close();
})

describe('Testes das operações do repositório de usuários', async () => {
    it('Insere objeto no banco, busca o mesmo no banco e verifica se o mesmo foi inserido.', async () => {
       
        const usuario: Usuario = {
            nome: 'Thiago',
            email: 'thiaggoulart@gmail.com',
            senha: 'thiaggoulart'
        }

       
        const usuarioCadastrado = await usuarioRepo.cadastraUsuario(usuario);
        const usuarioBuscado = await usuarioRepo.buscaUsuarioPorEmail('thiaggoulart@gmail.com');

       
        expect(usuarioBuscado!.email).toEqual(usuarioCadastrado.email);
        expect(usuarioBuscado!.nome).toEqual(usuarioCadastrado.nome);
    });

    it('Insere objeto no banco, altera uma informação e verifica se a operação foi bem sucedida.', async () => {
       
        const usuario: Usuario = {
            nome: 'Thiago',
            email: 'thiaggoulart@gmail.com',
            senha: 'thiaggoulart'
        }

       
        const usuarioCadastrado = await usuarioRepo.cadastraUsuario(usuario);
        usuarioCadastrado.nome = 'Thiago G';
        await usuarioRepo.editaUsuario(usuarioCadastrado.email, usuarioCadastrado);
        const usuarioBuscado = await usuarioRepo.buscaUsuarioPorEmail('thiaggoulart@gmail.com');

       
        expect(usuarioBuscado!.nome).toEqual(usuarioCadastrado.nome);
    });

    it('Insere objeto no banco, altera email para uma já existente no banco ocasionando um erro.', async () => {
       
        const usuario: Usuario = {
            nome: 'Thiago',
            email: 'thiaggoulart@gmail.com',
            senha: 'thiaggoulart'
        }

        const usuario2: Usuario = {
            nome: 'Thiago G',
            email: 'thiaggoulart@gmail.com',
            senha: 'thiaggoulart'
        }

       
        await usuarioRepo.cadastraUsuario(usuario);
        const usuarioCadastrado = await usuarioRepo.cadastraUsuario(usuario2);
        usuarioCadastrado.email = 'thiaggoulart@gmail.com';

       
        await expect(usuarioRepo.editaUsuario(usuario2.email, usuarioCadastrado))
            .rejects.toThrowError('E-mail já cadastrado, favor utilizar outro e-mail')
    });

    it('Insere objeto no banco, altera uma informação e tenta salvar a alteração no banco utilizando um e-mail não cadastrado ocasionando um erro.', async () => {
       
        const usuario: Usuario = {
            nome: 'Thiago',
            email: 'thiaggoulart@gmail.com',
            senha: 'thiaggoulart'
        }

       
        const usuarioCadastrado = await usuarioRepo.cadastraUsuario(usuario);
        usuarioCadastrado.email = 'thiaggoulart@gmail.com';

       
        await expect(usuarioRepo.editaUsuario('thiaggoulart@gmail.com', usuarioCadastrado))
            .rejects.toThrowError('E-mail não encontrado')
    });

    it('Insere objeto no banco, exclui o mesmo objeto e verifica se o mesmo foi excluído.', async () => {
       
        const usuario: Usuario = {
            nome: 'Thiago',
            email: 'thiaggoulart@gmail.com',
            senha: 'thiaggoulart'
        }

        const usuarioCadastrado = await usuarioRepo.cadastraUsuario(usuario);
        const usuarioRemovido = await usuarioRepo.removeUsuario(usuarioCadastrado.email);
        const buscaUsuarios = await usuarioRepo.buscaUsuarios();
        const buscaEmail = await usuarioRepo.buscaUsuarioPorEmail(usuarioCadastrado.email);

       
        expect(buscaUsuarios.length).toEqual(0);
        expect(buscaEmail).toBeNull();
        expect(usuarioRemovido).toEqual(1);
    });

    it('Insere 4 objetos no banco e faz a busca por nome. Retornando 3 dos 4 inseridos.', async () => {
       
        const novoUsuario: Usuario = {
            email: 'thiaggoulart@gmail.com',
            nome: 'Bruno Macedo',
            senha: 'thiaggoulart'
        }

        const novoUsuario2: Usuario = {
            email: 'thiaggoulart@gmail.com2',
            nome: 'Bruna Farias',
            senha: 'thiaggoulart'
        }

        const novoUsuario3: Usuario = {
            email: 'thiaggoulart@gmail.com3',
            nome: 'Brunno Azevedo',
            senha: 'thiaggoulart'
        }

        const novoUsuario4: Usuario = {
            email: 'thiaggoulart@gmail.com4',
            nome: 'Diego Macedo',
            senha: 'thiaggoulart'
        }
       
        await usuarioRepo.cadastraUsuario(novoUsuario);
        await usuarioRepo.cadastraUsuario(novoUsuario2);
        await usuarioRepo.cadastraUsuario(novoUsuario3);
        await usuarioRepo.cadastraUsuario(novoUsuario4);

        const usuarios = await usuarioRepo.buscaUsuarioPorNome('Bru');

       
        expect(usuarios[0].nome).toEqual(novoUsuario.nome);
        expect(usuarios[1].nome).toEqual(novoUsuario2.nome);
        expect(usuarios[2].nome).toEqual(novoUsuario3.nome);
        expect(usuarios.length).toEqual(3);

    });   

    it('Procura por um e-mail que não consta no banco e retorna um objeto do tipo null', async () => {
       
        const usuarioBuscado = await usuarioRepo.buscaUsuarioPorEmail('teste@hotmail.com');
        
        
        expect(usuarioBuscado).toBe(null);
    });

    it('Insere dois objetos no banco com o mesmo e-mail ocasionando um erro.', async () => {
       
        const novoUsuario: Usuario = {
            email: 'thiaggoulart@gmail.com',
            nome: 'Thiago',
            senha: 'thiaggoulart'
        }

        const novoUsuario2: Usuario = {
            email: 'thiaggoulart@gmail.com',
            nome: 'Thiago G',
            senha: 'umanovasenha'
        }


       
        await usuarioRepo.cadastraUsuario(novoUsuario);

       
        await expect(usuarioRepo.cadastraUsuario(novoUsuario2))
        .rejects
        .toThrowError('E-mail já cadastrado');
    });

});
