import request from 'supertest';
import app from '../app';
import { connect, connection } from 'mongoose';
import { config } from 'dotenv';
import { Usuario } from '../entidades/usuario';
import { Restaurante, RestauranteBusca } from '../entidades/restaurante';
import { removeUsuario, buscaUsuarios } from '../persistencia/usuarioRepositorio';
import { GrupoBusca } from '../entidades/grupo';
import * as grupoRepo from '../persistencia/grupoRepositorio';
import { buscaRestaurante, removeRestaurante } from '../persistencia/restauranteRepositorio';

let token: string;

beforeAll(async () => {
    config();
    const env = process.env;
    const url = `mongodb://${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_BD}UsuarioControlador`;
    await connect(url, { useNewUrlParser: true });

    let usuario: Usuario = {
        email: 'thiaggoulart@gmail.com',
        nome: 'Thiago',
        senha: 'thiaggoulart'
    }

    const resp = await request(app).put('/usuarios').send(usuario);
    usuario = resp.body as Usuario;

    const auth = await request(app).post('/login').send({
        username: 'thiaggoulart@gmail.com',
        password: 'thiaggoulart'
    });

    token = `Bearer ${auth.body.token}`;

});

afterEach(async () => {
    const restas = await buscaRestaurante() as RestauranteBusca[];
    const grupos = await grupoRepo.buscaGrupo() as GrupoBusca[];
    const usuarios = await buscaUsuarios();
    restas.forEach(async est => await removeRestaurante(est._id));
    grupos.forEach(async grp => await grupoRepo.removeGrupo(grp._id));
    usuarios.forEach(async usr => await removeUsuario(usr.email));
})

afterAll(async () => {
    const restas = await buscaRestaurante() as RestauranteBusca[];
    const grupos = await grupoRepo.buscaGrupo() as GrupoBusca[];
    const usuarios = await buscaUsuarios();
    restas.forEach(async est => await removeRestaurante(est._id));
    grupos.forEach(async grp => await grupoRepo.removeGrupo(grp._id));
    usuarios.forEach(async usr => await removeUsuario(usr.email));
    await connection.db.dropDatabase();
    await connection.close();
})

describe('Testes das operações do controlador de restaurantes', async () => {
    it('PUT/ Insere um novo usuário e retorna status 201 e o objeto criado.', async () => {
         
        const usuario: Usuario = {
            nome: 'Thiago',
            email: 'thiaggoulart@gmail.com',
            senha: 'thiaggoulart'
        }
         
        const res = await request(app).put('/usuarios').send(usuario);
        const usrCadastrado = res.body as Usuario;
        
        expect(res.status).toBe(201);
        expect(usrCadastrado.email).toEqual(usuario.email);
    });

    it('PUT/ Tenta inserir um objeto vazio e retorna status 500.', async () => {
         
        const res = await request(app).put('/usuarios').send({});
        
        expect(res.status).toBe(500);
    });

    it('POST/ Edita um usuário pelo email e retorna status 200.', async () => {
         
        const usuario: Usuario = {
            nome: 'Thiago',
            email: 'thiaggoulart@gmail.com',
            senha: 'thiaggoulart'
        }

        const resPut = await request(app).put('/usuarios').send(usuario);
        const usrCriado = resPut.body as Usuario;

        
        usrCriado.email = "thiaggoulart@gmail.com";

        const resPost = await request(app).post(`/usuarios/${usuario.email}`)
            .send(usrCriado)
            .set('Authorization', token);

        const usrAlterado = resPost.body as Usuario;
        
        expect(resPost.status).toBe(200);
        expect(usrAlterado.email).toBe(usrCriado.email);
    });

    it('POST/ Tenta editar um usuário com um email inexistente e retorna status 500.', async () => {
         
        const usuario: Usuario = {
            nome: 'Thiago',
            email: 'thiaggoulart@gmail.com',
            senha: 'thiaggoulart'
        }
        
        usuario.email = "usuarioalterado@gmail.com";

        const resPost = await request(app).post(`/usuarios/${usuario.email}`)
            .send(usuario)
            .set('Authorization', token);

        
        expect(resPost.status).toBe(500);
    });

    it('DELETE/ Exclui um usuário pelo email e retorna status 200.', async () => {
         
         const usuario: Usuario = {
            nome: 'Thiago',
            email: 'thiaggoulart@gmail.com',
            senha: 'thiaggoulart'
        }

        await request(app).put('/usuarios').send(usuario);

        
        const resDel = await request(app).delete(`/usuarios/${usuario.email}`)
            .set('Authorization', token);

        
        expect(resDel.status).toBe(200);
    });

    it('DELETE/ Tenta excluir um usuário por um email inexistente e retorna status 500.', async () => {

        
        const resDel = await request(app).delete(`/usuarios/teste@gmail.com`)
            .set('Authorization', token);

        
        expect(resDel.status).toBe(500);
    });

    it('GET/ Busca um usuário pelo email e retorna status 200 e o objeto buscado.', async () => {
         
        const usuario: Usuario = {
            nome: 'Thiago',
            email: 'thiaggoulart@gmail.com',
            senha: 'thiaggoulart'
        }

        await request(app).put('/usuarios').send(usuario);

        
        const res = await request(app).get(`/usuarios/${usuario.email}`)
            .set('Authorization', token);

        const usrBuscado = res.body as Usuario;
        
        expect(res.status).toBe(200);
        expect(usrBuscado.nome).toBe(usuario.nome);
    });

    it('GET/ Busca um usuário por um email inexistente e retorna status 404.', async () => {
        
        const res = await request(app).get(`/usuarios/umthiaggoulart@gmail.com`)
            .set('Authorization', token);

        
        expect(res.status).toBe(404);
    });

    it('GET/ Tenta buscar usuarios que contem uma substring no nome. Não encontra nenhuma ocorrência e retorna status 404.', async () => {

        
        const resGet = await request(app).get(`/usuarios/nome?q=fabi`)
            .set('Authorization', token);

        
        expect(resGet.status).toBe(404);
    });

    it('GET/ Busca usuarios que contem uma substring no nome. Retorna status 200 e a lista encontrada.', async () => {
         
        const usuario: Usuario = {
            nome: 'Lara',
            email: 'lara@gmail.com',
            senha: 'thiaggoulart'
        }

        const usuario1: Usuario = {
            nome: 'Alicia',
            email: 'alicia@gmail.com',
            senha: 'thiaggoulart'
        }

        const usuario2: Usuario = {
            nome: 'Alice',
            email: 'alice@gmail.com',
            senha: 'thiaggoulart'
        }

        await request(app).put('/usuarios').send(usuario);
        await request(app).put('/usuarios').send(usuario1);
        await request(app).put('/usuarios').send(usuario2);

        
        const res = await request(app).get(`/usuarios/nome?q=alic`)
            .set('Authorization', token);

        const usuarios = res.body as Usuario[];
        
        expect(res.status).toBe(200);
        expect(usuarios).toHaveLength(2);
        expect(usuarios[0].nome).toMatch(/alic/i);
        expect(usuarios[1].nome).toMatch(/alic/i);
    });

    it('GET/ Busca todos usuários cadastrados. Retorna status 200 e a lista encontrada.', async () => {
         
        const usuario: Usuario = {
            nome: 'Lara',
            email: 'lara@gmail.com',
            senha: 'thiaggoulart'
        }

        const usuario1: Usuario = {
            nome: 'Alicia',
            email: 'alicia@gmail.com',
            senha: 'thiaggoulart'
        }

        const usuario2: Usuario = {
            nome: 'Miguel',
            email: 'miguel@gmail.com',
            senha: 'thiaggoulart'
        }

        await request(app).put('/usuarios').send(usuario);
        await request(app).put('/usuarios').send(usuario1);
        await request(app).put('/usuarios').send(usuario2);

        
        const res = await request(app).get('/usuarios/')
            .set('Authorization', token);

        const usuarios = res.body as Usuario[];
        
        expect(res.status).toBe(200);
        expect(usuarios).toHaveLength(3);
    });

    it('GET/ Busca usuários sem ter nenhum cadastrado. Retorna status 200, porém uma lista vazia.', async () => {
         
        const usuario: Usuario = {
            nome: 'Lara',
            email: 'lara@gmail.com',
            senha: 'thiaggoulart'
        }

        const usuario1: Usuario = {
            nome: 'Alicia',
            email: 'alicia@gmail.com',
            senha: 'thiaggoulart'
        }

        const usuario2: Usuario = {
            nome: 'Miguel',
            email: 'miguel@gmail.com',
            senha: 'thiaggoulart'
        }

        await request(app).put('/usuarios').send(usuario);
        await request(app).put('/usuarios').send(usuario1);
        await request(app).put('/usuarios').send(usuario2);

        
        const res = await request(app).get('/usuarios/')
            .set('Authorization', token);

        const usuarios = res.body as Usuario[];
        
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({});
    });

    it('POST/ Realiza operação de um usuário ingressar a um grupo. Retorna status 200.', async () => {
         
        const usuario: Usuario = {
            nome: 'Thiago',
            email: 'thiaggoulart@gmail.com',
            senha: 'thiaggoulart'
        }

        const usuario2: Usuario = {
            nome: 'Thiago G',
            email: 'thiaggoulart@gmail.com2',
            senha: 'thiaggoulart'
        }

        const resPut1 = await request(app).put('/usuarios').send(usuario);

        const grupoRes = await request(app).put('/grupos')
            .send({
                dataCriacao: new Date(Date.now()),
                restaurantes: [],
                restaurantesVisitados: [],
                participantes: [resPut1.body],
                votacao: [],
                quemVotou: [],
            })
            .set('Authorization', token);

        const grupo = grupoRes.body as GrupoBusca;

        
        const resPut2 = await request(app).put('/usuarios').send(usuario2);

        const resPost = await request(app).post(`/usuarios/${resPut2.body.email}/grupo=${grupo._id}`)
            .set('Authorization', token);

        
        expect(resPost.status).toBe(200);
    });

    it('POST/ Realiza operação de um usuário ingressar a um grupo. Retorna status 500 pois o Id do grupo é inválido.', async () => {
         
        const usuario: Usuario = {
            nome: 'Thiago',
            email: 'thiaggoulart@gmail.com',
            senha: 'thiaggoulart'
        }

        const resPut = await request(app).put('/usuarios').send(usuario);

        
        const resPost = await request(app).post(`/usuarios/${resPut.body.email}/grupo=5db7aefedb5fb13df66b622d`)
            .set('Authorization', token);

        
        expect(resPost.status).toBe(500);
    });

    it('POST/ Realiza operação de um usuário votar em um restaurante. Retorna status 200.', async () => {
         
        const usuario: Usuario = {
            nome: 'Thiago',
            email: 'thiaggoulart@gmail.com',
            senha: 'thiaggoulart'
        }

        const resta: Restaurante = {
            nome: 'Cachorro do Rosario',
            localizacao: 'Rua F',
            descricao: 'Especializada em cachorro-quente.'
        }

        const resPutUsr = await request(app).put('/usuarios').send(usuario);
        const resPutEst = await request(app).put('/restaurantes')
        .send(resta)
        .set('Authorization', token);

        const grupoRes = await request(app).put('/grupos')
            .send({
                dataCriacao: new Date(Date.now()),
                restaurantes: [resPutEst.body],
                restaurantesVisitados: [],
                participantes: [resPutUsr.body],
                votacao: [{
                    restaurante: resPutEst.body, 
                    votos: 0
                }],
                quemVotou: [],
            })
            .set('Authorization', token);

        const grupo = grupoRes.body as GrupoBusca;
        const restaBusca = resPutEst.body as RestauranteBusca;

        

        const resPost = await request(app)
        .post(`/usuarios/${resPutUsr.body.email}/grupo=${grupo._id}/resta=${restaBusca._id}`)
            .set('Authorization', token);

        
        expect(resPost.status).toBe(200);
    });

    it('POST/ Realiza operação de um usuário votar em um restaurante. Retorna status 500 pois o restaurante não pertence ao grupo.', async () => {
         
        const usuario: Usuario = {
            nome: 'Thiago',
            email: 'thiaggoulart@gmail.com',
            senha: 'thiaggoulart'
        }

        const resta: Restaurante = {
            nome: 'Cachorro do Rosario',
            localizacao: 'Rua F',
            descricao: 'Especializada em cachorro-quente.'
        }

        const resPutUsr = await request(app).put('/usuarios').send(usuario);
        const resPutEst = await request(app).put('/restaurantes')
        .send(resta)
        .set('Authorization', token);
        
        const grupoRes = await request(app).put('/grupos')
            .send({
                dataCriacao: new Date(Date.now()),
                restaurantes: [],
                restaurantesVisitados: [],
                participantes: [resPutUsr.body],
                votacao: [],
                quemVotou: [],
            })
            .set('Authorization', token);

        const grupo = grupoRes.body as GrupoBusca;
        const restaBusca = resPutEst.body as RestauranteBusca;

        

        const resPost = await request(app)
        .post(`/usuarios/${resPutUsr.body.email}/grupo=${grupo._id}/resta=${restaBusca._id}`)
            .set('Authorization', token);

        
        expect(resPost.status).toBe(500);
    });

});


