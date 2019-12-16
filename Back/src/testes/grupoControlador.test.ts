import request from 'supertest';
import app from '../app';
import { connect, connection } from 'mongoose';
import { config } from 'dotenv';
import { Usuario } from '../entidades/usuario';
import { Restaurante, RestauranteBusca } from '../entidades/restaurante';
import { removeUsuario, buscaUsuarios } from '../persistencia/usuarioRepositorio';
import { GrupoBusca, Grupo } from '../entidades/grupo';
import * as grupoRepo from '../persistencia/grupoRepositorio';
import { buscaRestaurante, removeRestaurante, cadastraRestaurante } from '../persistencia/restauranteRepositorio';

let token: string;

let usuario: Usuario;

let restaurante: RestauranteBusca;

beforeAll(async () => {
    config();
    const env = process.env;
    const url = `mongodb://${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_BD}GrupoControlador`;
    await connect(url, { useNewUrlParser: true });

    const resp = await request(app).put('/usuarios').send({
        email: 'thiaggoulart@gmail.com',
        nome: 'Thiago',
        senha: 'thiaggoulart'
    });
    usuario = resp.body as Usuario;
    const auth = await request(app).post('/login').send({
        username: 'thiaggoulart@gmail.com',
        password: 'thiaggoulart'
    });

    token = `Bearer ${auth.body.token}`;

    const respEstab = await request(app).put('/restaurantes')
        .send({
            nome: 'Um restaurante',
            localizacao: 'Rua F',
            descricao: 'Especializada em massas.'
        })
        .set('Authorization', token);

    restaurante = respEstab.body;
});

afterEach(async () => {
    const grupos = await grupoRepo.buscaGrupo() as GrupoBusca[];
    grupos.forEach(async grp => await grupoRepo.removeGrupo(grp._id));
});

afterAll(async () => {
    const grupos = await grupoRepo.buscaGrupo() as GrupoBusca[];
    grupos.forEach(async grp => await grupoRepo.removeGrupo(grp._id));
    const estabs = await buscaRestaurante() as RestauranteBusca[];
    estabs.forEach(async est => await removeRestaurante(est._id));
    const usuarios = await buscaUsuarios();
    usuarios.forEach(async usr => removeUsuario(usr.email));
    await removeUsuario('thiaggoulart@gmail.com');
    await connection.db.dropDatabase();
    await connection.close();
})

describe('Testes das operações do controlador de restaurantes', async () => {
    it('PUT/ Insere um novo grupo.', async () => {
         
        const grupo: Grupo = {
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [usuario],
            votador: [],
            votacao: []
        }

         
        const res = await request(app)
            .put('/grupos')
            .send(grupo)
            .set('Authorization', token);

        const grupoCadastrado = res.body as GrupoBusca;
        
        expect(res.status).toBe(201);
        expect(grupoCadastrado._id).not.toBeUndefined();
    });

    it('PUT/ Tenta fazer o cadastro de um grupo sem nenhum usuário vinculado. Obtém um retorno do tipo 500', async () => {
         
        const grupo: Grupo = {
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [],
            votador: [],
            votacao: []
        }

         
        const res = await request(app)
            .put('/grupos')
            .send(grupo)
            .set('Authorization', token);
        const grupoCadastrado = res.body as GrupoBusca;

        
        expect(res.status).toBe(500);
        expect(grupoCadastrado._id).toBeUndefined();
    });

    it('DELETE/ Remove um grupo cadastrado pelo id. Retorno do tipo 200', async () => {
         
        const grupo: Grupo = {
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [usuario as Usuario],
            votador: [],
            votacao: []
        }

        const resPut = await request(app)
            .put('/grupos')
            .send(grupo)
            .set('Authorization', token);

        const grupoCadastrado = resPut.body as GrupoBusca;
         
        const resDel = await request(app).delete(`/grupos/${grupoCadastrado._id}`)
            .set('Authorization', token);
        const resGetGrupos = await request(app).get('/grupos')
            .set('Authorization', token);

        
        expect(resDel.status).toBe(200);
    });

    it('DELETE/ Tenta remover um grupo por um id que não existe no banco.', async () => {
         
        const resDel = await request(app)
            .delete(`/grupos/5db7aefedb5fb13df66b622d`)
            .set('Authorization', token);

        
        expect(resDel.status).toBe(500);
    });

    it('POST/ Faz alteração de dados de um grupo.', async () => {
         
        const grupo: Grupo = {
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [usuario as Usuario],
            votador: [],
            votacao: []
        }

        const res = await request(app)
            .put('/grupos')
            .send(grupo)
            .set('Authorization', token);
        const grupoCadastrado = res.body as GrupoBusca;
         
        grupoCadastrado.restaurantes.push(restaurante);
        const resPost = await request(app)
            .post(`/grupos/${grupoCadastrado._id}`)
            .send(grupoCadastrado)
            .set('Authorization', token);

        
        expect(resPost.status).toBe(200);
        expect(resPost.body.restaurantes).toHaveLength(1);
    });

    it('POST/ Tenta alterar os dados de um grupo com um Id que não consta no banco. Retorno status 500', async () => {
         
        const grupo: Grupo = {
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [usuario as Usuario],
            votador: [],
            votacao: []
        }

         
        const resPost = await request(app)
            .post(`/grupos/5db7aefedb5fb13df66b622d`)
            .send(grupo)
            .set('Authorization', token);

        
        expect(resPost.status).toBe(500);
    });

    it('GET/ Busca um grupo cadastrado pelo id. Retorno do tipo 200', async () => {
         
        const grupo: Grupo = {
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [usuario],
            votador: [],
            votacao: []
        }

        const resPut = await request(app)
            .put('/grupos')
            .send(grupo)
            .set('Authorization', token);

        const grupoCadastrado = resPut.body as GrupoBusca;
         
        const resGetGrupo = await request(app).get(`/grupos/${grupoCadastrado._id}`)
            .set('Authorization', token);

        const grupoBuscado = resGetGrupo.body as GrupoBusca;
        
        expect(resGetGrupo.status).toBe(200);
        expect(grupoBuscado.participantes).toHaveLength(1);
    });

    it('GET/ Busca um grupo não cadastrado pelo id. Retorno do tipo 404', async () => {
         
        const resGet = await request(app).get(`/grupos/5db7aefedb5fb13df66b622d`)
            .set('Authorization', token);

        
        expect(resGet.status).toBe(404);
    });

    it('GET/ Busca um grupo por um id fora do formato ideal. Retorno do tipo 500', async () => {
         
        const resGet = await request(app).get(`/grupos/iaioasrq3t8091uhsafuihsa`)
            .set('Authorization', token);

        
        expect(resGet.status).toBe(500);
    });

    it('GET/ Busca por todos os grupos cadastrados. Retorno do tipo 200', async () => {
        
        const grupo1: Grupo = {
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [usuario],
            votador: [],
            votacao: []
        }

        const grupo2: Grupo = {
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [usuario],
            votador: [],
            votacao: []
        }
        await request(app).put(`/grupos`)
            .send(grupo1)
            .set('Authorization', token);
        await request(app).put(`/grupos`)
            .send(grupo2)
            .set('Authorization', token);

         
        const resGet = await request(app).get(`/grupos`)
            .set('Authorization', token);

        
        expect(resGet.status).toBe(200);
        expect(resGet.body).toHaveLength(2);
    });

    it('GET/ Busca por todos os grupos sem ter algum cadastrado. Retorno do tipo 200, porém recebe uma lista vazia', async () => {

         
        const resGet = await request(app).get(`/grupos`)
            .set('Authorization', token);

        
        expect(resGet.status).toBe(200);
        expect(resGet.body).toHaveLength(0);
    });

    it('GET/ Busca pelo vencedor da votação. Retorno do tipo 200', async () => {
        
        const respPutEstab = await request(app).put('/restaurantes')
            .send({
                nome: 'Temaki dos guri',
                localizacao: 'Avenida Bento Gonçalves, 1928',
                categoria: 'Temakeria',
                tipo: 'Restaurante',
                descricao: 'Especializada em sushi.'
            })
            .set('Authorization', token);
        const estab = respPutEstab.body as RestauranteBusca;

        const grupo: Grupo = {
            dataCriacao: new Date(Date.now()),
            restaurantes: [restaurante, estab],
            restaurantesVisitados: [],
            participantes: [usuario],
            votador: [usuario.email],
            votacao: [
                { restaurante: restaurante, votos: 4 },
                { restaurante: estab, votos: 8 }
            ]
        }
        const resPutGrupo = await request(app).put(`/grupos`)
            .send(grupo)
            .set('Authorization', token);

        const grupoCad = resPutGrupo.body as GrupoBusca;

         
        const resGet = await request(app).get(`/grupos/${grupoCad._id}/vencedor`)
            .set('Authorization', token);

        const vencedor = resGet.body as RestauranteBusca;
        const resGetGrupo = await request(app).get(`/grupos/${grupoCad._id}`).
            set('Authorization', token);
        const grupoBuscado = resGetGrupo.body as GrupoBusca;

        
        expect(resGet.status).toBe(200);
        expect(vencedor.nome).toBe(estab.nome);
        expect(grupoBuscado.restaurantesVisitados).toHaveLength(1);
        expect(grupoBuscado.votador).toHaveLength(0);
        expect(grupoBuscado.votacao[0].votos).toBe(0);
        expect(grupoBuscado.votacao[1].votos).toBe(0);

    });

    it('GET/ Busca pelo vencedor da votação passando um id inexistente. Retorno do tipo 500', async () => {
        
        const respPutEstab = await request(app)
            .put('/restaurantes')
            .send({
                nome: 'Outro restaurante',
                localizacao: 'Rua F',
                descricao: 'alguma coisa.'
            })
            .set('Authorization', token);
        const estab = respPutEstab.body as RestauranteBusca;

        const grupo: Grupo = {
            dataCriacao: new Date(Date.now()),
            restaurantes: [restaurante, estab],
            restaurantesVisitados: [],
            participantes: [usuario],
            votador: [usuario.email],
            votacao: [
                { restaurante: restaurante, votos: 4 },
                { restaurante: estab, votos: 8 }
            ]
        }
        const resPutGrupo = await request(app).put(`/grupos`)
            .send(grupo)
            .set('Authorization', token);

        const grupoCad = resPutGrupo.body as GrupoBusca;

         
        const resGet = await request(app).get(`/grupos/5db7aefedb5fb13df66b622d/vencedor`)
            .set('Authorization', token);

        
        expect(resGet.status).toBe(500);

    });

    it('GET/ Busca pelos restaurante que ainda não foram visitados na semana. Retorno do tipo 200', async () => {
        
        const respPutEstab = await request(app).put('/restaurantes')
            .send({
                nome: 'Outro restaurante',
                localizacao: 'Rua F',
                descricao: 'alguma coisa.'
            })
            .set('Authorization', token);
        const estab = respPutEstab.body as RestauranteBusca;

        const respPutEstab1 = await request(app).put('/restaurantes')
            .send({
                nome: 'Outro restaurante 2',
                localizacao: 'Rua E',
                descricao: 'alguma coisa 2.'
            })
            .set('Authorization', token);

        const estab1 = respPutEstab1.body as RestauranteBusca;

        const grupo: Grupo = {
            dataCriacao: new Date(Date.now()),
            restaurantes: [restaurante, estab, estab1],
            restaurantesVisitados: [{
                restaurante: restaurante,
                data: new Date(Date.now())
            }],
            participantes: [usuario],
            votador: [],
            votacao: []
        }

        const resPutGrupo = await request(app).put(`/grupos`)
            .send(grupo)
            .set('Authorization', token);

        const grupoCad = resPutGrupo.body as GrupoBusca;

         
        const resGet = await request(app).get(`/grupos/${grupoCad._id}/naoVisitados`)
            .set('Authorization', token);

        const lista = resGet.body as RestauranteBusca [];
        
        expect(resGet.status).toBe(200);
        expect(lista).toHaveLength(2);
        expect(lista[0].nome).toBe(estab.nome);
        expect(lista[1].nome).toBe(estab1.nome);
    });

    it('GET/ Busca pelos restaurante que ainda não foram visitados na semana. Retorno do tipo 500', async () => {
        

        const grupo: Grupo = {
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [usuario],
            votador: [],
            votacao: []
        }

        const resPutGrupo = await request(app).put(`/grupos`)
            .send(grupo)
            .set('Authorization', token);

        const grupoCad = resPutGrupo.body as GrupoBusca;

         
        const resGet = await request(app).get(`/grupos/5db7aefedb5fb13df66b622d/naoVisitados`)
            .set('Authorization', token);

    
        
        expect(resGet.status).toBe(500);
    });
});


