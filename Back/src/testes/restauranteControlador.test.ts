import request from 'supertest';
import app from '../app';
import { connect, connection } from 'mongoose';
import { config } from 'dotenv';
import { Usuario } from '../entidades/usuario';
import { Restaurante, RestauranteBusca } from '../entidades/restaurante';
import { removeUsuario } from '../persistencia/usuarioRepositorio';
import { GrupoBusca } from '../entidades/grupo';
import * as grupoRepo from '../persistencia/grupoRepositorio';
import { buscaRestaurante, removeRestaurante } from '../persistencia/restauranteRepositorio';

let token: string;

let grupo: GrupoBusca;

beforeAll(async () => {
    config();
    const env = process.env;
    const url = `mongodb://${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_BD}restControlador`;
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

    grupo = await grupoRepo.cadastraGrupo({
        dataCriacao: new Date(Date.now()),
        restaurantes: [],
        restaurantesVisitados: [],
        participantes: [usuario],
        votador: [],
        votacao: []
    }) as GrupoBusca;

    token = auth.body.token;

});

afterEach( async () => {
    const rests = await buscaRestaurante() as RestauranteBusca[];
    rests.forEach( async est => await removeRestaurante(est._id));
})

afterAll(async () => {
    const rests = await buscaRestaurante() as RestauranteBusca[];
    rests.forEach( async est => await removeRestaurante(est._id));
    await grupoRepo.removeGrupo(grupo._id);
    await removeUsuario('thiaggoulart@gmail.com');
    await connection.db.dropDatabase();
    await connection.close();
})

describe('Testes das operações do controlador de restaurantes', async () => {
    it('PUT/ Insere um novo restaurante.', async () => {

        const rest: Restaurante = {
            nome: 'algum restaurante',
            localizacao: 'rua 2',
            descricao: 'resturante de massas.'
        }

        const res = await request(app).put('/restaurantes').send(rest).set('Authorization', `Bearer ${token}`);
        const restCadastrado = res.body as RestauranteBusca;

        expect(res.status).toBe(201);
        expect(restCadastrado.nome).toEqual(rest.nome);
    });

    it('PUT/ Insere um objeto vazio que ocasiona um erro.', async () => {

        const res = await request(app).put('/restaurantes').send().set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(500);
    });

    it('POST/ Edita um restaurante previamente inserido.', async () => {

        const rest: Restaurante = {
            nome: 'algum restaurante',
            localizacao: 'rua 2',
            descricao: 'resturante de massas.'
        }

        const res = await request(app).put('/restaurantes')
            .send(rest)
            .set('Authorization', `Bearer ${token}`);

        const restCadastrado = res.body as RestauranteBusca;

        restCadastrado.nome = 'Pizzaria';

        const editaRestaurante = await request(app).post(`/restaurantes/${restCadastrado._id}`)
            .send(restCadastrado)
            .set('Authorization', `Bearer ${token}`);

        expect(editaRestaurante.status).toBe(200);
        expect(editaRestaurante.body.nome).toEqual(restCadastrado.nome);
    });

    it('POST/ Tenta editar um restaurante com um id inexistente no banco, que ocasiona um erro do tipo 500.', async () => {

        const rest: Restaurante = {
            nome: 'algum restaurante',
            localizacao: 'rua 2',
            descricao: 'resturante de massas.'
        }

        const res = await request(app).put('/restaurantes')
            .send(rest)
            .set('Authorization', `Bearer ${token}`);

        const restCadastrado = res.body as RestauranteBusca;

        restCadastrado.nome = 'Pizzaria';

        const editaRestaurante = await request(app).post(`/restaurantes/5db7aefedb5fb13df66b622d`)
            .send(restCadastrado)
            .set('Authorization', `Bearer ${token}`);

        expect(editaRestaurante.status).toBe(500);
    });

    it('POST/ Vincula restaurante a um grupo.', async () => {

        const rest: Restaurante = {
            nome: 'algum restaurante',
            localizacao: 'rua 2',
            descricao: 'resturante de massas.'
        }

        const resRestaurante = await request(app).put('/restaurantes')
            .send(rest)
            .set('Authorization', `Bearer ${token}`);

        const restCadastrado = resRestaurante.body as RestauranteBusca;

        const resposta = await request(app).post(`/restaurantes/${restCadastrado._id}/grupo=${grupo._id}`)
            .set('Authorization', `Bearer ${token}`);

        const grupoAtualizado = resposta.body as GrupoBusca;

        expect(resposta.status).toBe(200);
        expect(grupoAtualizado.restaurantes[0].nome).toEqual(restCadastrado.nome);
        expect(grupoAtualizado.restaurantes).toHaveLength(1);
    });

    it('POST/ Tenta vincular um restaurante a um grupo com um Id que não consta no banco. Resulta num erro do tipo 404 por não ter encontrado o grupo', async () => {

        const rest: Restaurante = {
            nome: 'algum restaurante',
            localizacao: 'rua 2',
            descricao: 'resturante de massas.'
        }

        const resRestaurante = await request(app).put('/restaurantes')
            .send(rest)
            .set('Authorization', `Bearer ${token}`);

        const resposta = await request(app).post(`/restaurantes/${resRestaurante.body._id}/grupo=5db7aefedb5fb13df66b622d`)
            .set('Authorization', `Bearer ${token}`);

        expect(resposta.status).toBe(404);
    });

    it('DELETE/ Exclui um restaurante já cadastrado.', async () => {

        const rest: Restaurante = {
            nome: 'algum restaurante',
            localizacao: 'rua 2',
            descricao: 'resturante de massas.'
        }

        const res = await request(app).put('/restaurantes')
            .send(rest)
            .set('Authorization', `Bearer ${token}`);

        const restCadastrado = res.body as RestauranteBusca;

        const removeRestaurante = await request(app).delete(`/restaurantes/${restCadastrado._id}`)
            .set('Authorization', `Bearer ${token}`);

        const buscaRestaurante = await request(app).get(`/restaurantes/${restCadastrado._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(removeRestaurante.status).toBe(200);
        expect(buscaRestaurante.status).toBe(404);
    });

    it('DELETE/ Tenta excluir um restaurante com um id inexistente, que ocasiona um erro.', async () => {

        const rest: Restaurante = {
            nome: 'algum restaurante',
            localizacao: 'rua 2',
            descricao: 'resturante de massas.'
        }

        const res = await request(app).put('/restaurantes')
            .send(rest)
            .set('Authorization', `Bearer ${token}`);

        const restCadastrado = res.body as RestauranteBusca;

        const removeRestaurante = await request(app).delete(`/restaurantes/5db7aefedb5fb13df66b622d`)
            .set('Authorization', `Bearer ${token}`);

        const buscaRestaurante = await request(app).get(`/restaurantes/${restCadastrado._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(removeRestaurante.status).toBe(500);
        expect(buscaRestaurante.status).toBe(200);
    });

    it('GET/ Busca restaurantes cujo nome tenha uma ocorrência da String passada por parâmetro.', async () => {

        const rest: Restaurante = {
            nome: 'Cachorro do Bigode',
            localizacao: 'rua 2',
            descricao: 'Especializada em cachorro-quente.'
        }

        const rest1: Restaurante = {
            nome: 'Cachorro do Rosario',
            localizacao: 'rua 2',
            descricao: 'Especializada em cachorro-quente.'
        }

        const rest2: Restaurante = {
            nome: 'algum restaurante',
            localizacao: 'Avenida Ipiranga, 2087',
            descricao: 'resturante de massas.'
        }

        await request(app).put('/restaurantes')
            .send(rest)
            .set('Authorization', `Bearer ${token}`);

        await request(app).put('/restaurantes')
            .send(rest1)
            .set('Authorization', `Bearer ${token}`);

        await request(app).put('/restaurantes')
            .send(rest2)
            .set('Authorization', `Bearer ${token}`);

        const res = await request(app).get('/restaurantes/nome?q=cachorro')
            .set('Authorization', `Bearer ${token}`);

        const restaurantes = res.body as RestauranteBusca[];
        expect(res.status).toBe(200);
        expect(restaurantes).toHaveLength(2);
        expect(restaurantes[0].nome).toMatch(/cachorro/i);
        expect(restaurantes[1].nome).toMatch(/cachorro/i);
    });

    it('GET/ Busca restaurantes por nome que não consta no banco e retorna um erro do tipo 404.', async () => {
        //Arrange 
        const rest: Restaurante = {
            nome: 'Cachorro do Bigode',
            localizacao: 'rua 2',
            descricao: 'Especializada em cachorro-quente.'
        }

        const rest1: Restaurante = {
            nome: 'Cachorro do Rosario',
            localizacao: 'rua 2',
            descricao: 'Especializada em cachorro-quente.'
        }

        const rest2: Restaurante = {
            nome: 'algum restaurante',
            localizacao: 'Avenida Ipiranga, 2087',
            descricao: 'resturante de massas.'
        }

        //Act 
        await request(app).put('/restaurantes')
            .send(rest)
            .set('Authorization', `Bearer ${token}`);

        await request(app).put('/restaurantes')
            .send(rest1)
            .set('Authorization', `Bearer ${token}`);

        await request(app).put('/restaurantes')
            .send(rest2)
            .set('Authorization', `Bearer ${token}`);

        const res = await request(app).get('/restaurantes/nome?q=temaki')
            .set('Authorization', `Bearer ${token}`);

        //Assert
        expect(res.status).toBe(404);
    });

    it('GET/ Busca restaurantes cujo endereço tenha uma ocorrência da String passada por parâmetro.', async () => {
        //Arrange 
        const rest: Restaurante = {
            nome: 'Cachorro do Bigode',
            localizacao: 'rua 2',
            descricao: 'Especializada em cachorro-quente.'
        }

        const rest1: Restaurante = {
            nome: 'Cachorro do Rosario',
            localizacao: 'rua 2',
            descricao: 'Especializada em cachorro-quente.'
        }

        const rest2: Restaurante = {
            nome: 'algum restaurante',
            localizacao: 'Avenida Bento Gonçalves, 2087',
            descricao: 'resturante de massas.'
        }

        //Act 
        await request(app).put('/restaurantes')
            .send(rest)
            .set('Authorization', `Bearer ${token}`);

        await request(app).put('/restaurantes')
            .send(rest1)
            .set('Authorization', `Bearer ${token}`);

        await request(app).put('/restaurantes')
            .send(rest2)
            .set('Authorization', `Bearer ${token}`);

        const res = await request(app).get('/restaurantes/end?q=ipiranga')
            .set('Authorization', `Bearer ${token}`);

        const restaurantes = res.body as RestauranteBusca[];
        //Assert
        expect(res.status).toBe(200);
        expect(restaurantes).toHaveLength(2);
        expect(restaurantes[0].localizacao).toMatch(/ipiranga/i);
        expect(restaurantes[1].localizacao).toMatch(/ipiranga/i);
    });

    it('GET/ Busca restaurantes por endereço que não consta no banco e retorna um erro do tipo 404.', async () => {
        //Arrange 
        const rest: Restaurante = {
            nome: 'Cachorro do Bigode',
            localizacao: 'rua 2',
            descricao: 'Especializada em cachorro-quente.'
        }

        const rest1: Restaurante = {
            nome: 'Cachorro do Rosario',
            localizacao: 'rua 2',
            descricao: 'Especializada em cachorro-quente.'
        }

        const rest2: Restaurante = {
            nome: 'algum restaurante',
            localizacao: 'Avenida Bento Gonçalves, 2087',
            descricao: 'resturante de massas.'
        }

        //Act 
        await request(app).put('/restaurantes')
            .send(rest)
            .set('Authorization', `Bearer ${token}`);

        await request(app).put('/restaurantes')
            .send(rest1)
            .set('Authorization', `Bearer ${token}`);

        await request(app).put('/restaurantes')
            .send(rest2)
            .set('Authorization', `Bearer ${token}`);

        const res = await request(app).get('/restaurantes/end?q=cristiano%20fischer')
            .set('Authorization', `Bearer ${token}`);
        //Assert
        expect(res.status).toBe(404);
    });

    it('GET/ Busca todos restaurantes cadastrados no banco. Retorno do tipo 200.', async () => {
        //Arrange 
        const rest: Restaurante = {
            nome: 'Cachorro do Bigode',
            localizacao: 'rua 2',
            descricao: 'Especializada em cachorro-quente.'
        }

        const rest1: Restaurante = {
            nome: 'Cachorro do Rosario',
            localizacao: 'rua 2',
            descricao: 'Especializada em cachorro-quente.'
        }

        const rest2: Restaurante = {
            nome: 'algum restaurante',
            localizacao: 'Avenida Bento Gonçalves, 2087',
            descricao: 'resturante de massas.'
        }

        //Act 
        await request(app).put('/restaurantes')
            .send(rest)
            .set('Authorization', `Bearer ${token}`);

        await request(app).put('/restaurantes')
            .send(rest1)
            .set('Authorization', `Bearer ${token}`);

        await request(app).put('/restaurantes')
            .send(rest2)
            .set('Authorization', `Bearer ${token}`);

        const res = await request(app).get('/restaurantes/')
            .set('Authorization', `Bearer ${token}`);

        const restaurantes = res.body as RestauranteBusca[];
        //Assert
        expect(res.status).toBe(200);
        expect(restaurantes).toHaveLength(3);
    });

    it('GET/ Busca restaurantes sem ter nenhum restaurante cadastrado. Retorna uma lista vazia.', async () => {
        //Act
        const res = await request(app).get('/restaurantes/')
            .set('Authorization', `Bearer ${token}`);

            //Assert
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({});
    });

    it('GET/ Busca um restaurante por Id. Retornando status 200 e o objeto.', async () => {
        //Arrange 
        const rest: Restaurante = {
            nome: 'algum restaurante',
            localizacao: 'rua 2',
            descricao: 'resturante de massas.'
        }

        //Act 
        const res = await request(app).put('/restaurantes')
            .send(rest)
            .set('Authorization', `Bearer ${token}`);

        const restCadastrado = res.body as RestauranteBusca;

        const buscaRestaurante = await request(app).get(`/restaurantes/${restCadastrado._id}`)
            .set('Authorization', `Bearer ${token}`);

        //Assert
        expect(buscaRestaurante.status).toBe(200);
        expect(buscaRestaurante.body.nome).toBe(rest.nome);
    });

    it('GET/ Tenta buscar um restaurante com um id inexistente, que ocasiona um erro do tipo 404.', async () => {

        //Act 
        const buscaRestaurante = await request(app).get('/restaurantes/5db7aefedb5fb13df66b622d')
            .set('Authorization', `Bearer ${token}`);

        //Assert
        expect(buscaRestaurante.status).toBe(404);
    });

});


