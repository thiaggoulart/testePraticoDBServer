import * as grupoRepo from '../persistencia/grupoRepositorio';
import * as usuarioRepo from '../persistencia/usuarioRepositorio';
import * as restauranteRepositorio from '../persistencia/restauranteRepositorio';
import * as verificacao from '../persistencia/verificacao';
import { connect, connection } from 'mongoose';
import { config } from 'dotenv';
import { GrupoBusca } from '../entidades/grupo';
import { RestauranteBusca, Restaurante } from '../entidades/restaurante';
import { Usuario } from '../entidades/usuario';

beforeAll(async () => {
    config();
    const env = process.env;
    const url = `mongodb://${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_BD}Verificacao`;
    await connect(url, { useNewUrlParser: true });

    const umUsuario: Usuario = {
        email: '',
        nome: '',
        senha: 'thiaggoulart'
    }

    let cont = 1;
    while (cont < 6) {
        umUsuario.email = `usuario${cont}@gmail.com`;
        umUsuario.nome = `usuario${cont}`
        await usuarioRepo.cadastraUsuario(umUsuario);
        cont++;
    }

    const Restaurante: Restaurante = {
        nome: 'Restaurante',
        descricao: 'uma descrição',
        localizacao: 'Rua F'
        
    }
    await restauranteRepositorio.cadastraRestaurante(Restaurante);

    Restaurante.nome = 'Restaurante 2';
    Restaurante.descricao = 'outra descrição';
    Restaurante.localizacao = 'Rua E';

    await restauranteRepositorio.cadastraRestaurante(Restaurante);


});

afterEach(async () => {
    const listaGrupo = await grupoRepo.buscaGrupo() as GrupoBusca[];
    listaGrupo.forEach(async grupo => {
        await grupoRepo.removeGrupo(grupo._id);
    });
});

afterAll(async () => {
    const listaGrupo = await grupoRepo.buscaGrupo() as GrupoBusca[];
    listaGrupo.forEach(async grupo => {
        await grupoRepo.removeGrupo(grupo._id);
    });
    await connection.collection('Grupo').drop();
    await connection.collection('Usuario').drop();
    await connection.collection('Restaurante').drop();
    await connection.close();
})

describe('Testes dos verificacao', async () => {
    it('Verifica se grupo existe através do Id e lança uma exceção caso não encontre.', async () => {
        await expect(verificacao.verificaGrupo('5db7aefedb5fb13df66b622d')).rejects.toThrowError('Grupo não encontrado');
    });

    it('Verifica se grupo existe através do Id e retorna o mesmo caso encontre.', async () => {
        
        const buscaUsr = await usuarioRepo.buscaUsuarios();
        const grupoCadastrado = await grupoRepo.cadastraGrupo({
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [buscaUsr[0]],
            votador: [],
            votacao: []
        }) as GrupoBusca;

        
        const grupoBuscado = await verificacao.verificaGrupo(grupoCadastrado._id) as GrupoBusca; 

        
        expect(grupoBuscado._id).toEqual(grupoCadastrado._id);
    });

    it('Verifica se usuário existe através do Id e lança uma exceção caso não encontre.', async () => {
        await expect(verificacao.verificaUsuario('5db7aefedb5fb13df66b622d')).rejects.toThrowError('Usuário não encontrado.');
    });

    it('Verifica se usuário existe através do Id e lança uma exceção caso não encontre.', async () => {
         
        const usuarios = await usuarioRepo.buscaUsuarios();

        
        const buscaUsuario = await verificacao.verificaUsuario(usuarios[0].email);

        
        expect(buscaUsuario.nome).toEqual(usuarios[0].nome);
        expect(buscaUsuario.email).toEqual(usuarios[0].email);
    });

    it('Verifica se restaurante existe através do Id e lança uma exceção caso não encontre.', async () => {
        await expect(verificacao.verificaRestaurante('5db7aefedb5fb13df66b622d')).rejects.toThrowError('Restaurante não encontrado');
    });

    it('Verifica se restaurante existe através do Id e lança uma exceção caso não encontre.', async () => {
         
        const restas = await restauranteRepositorio.buscaRestaurante() as RestauranteBusca[];

        
        const buscaRestaurante = await verificacao.verificaRestaurante(restas[0]._id) as RestauranteBusca;

        
        expect(buscaRestaurante.nome).toEqual(restas[0].nome);
        expect(buscaRestaurante._id).toEqual(restas[0]._id);
    });

    it('Verifica se restaurante existe no grupo através do id.', async () => {
         
        const restas = await restauranteRepositorio.buscaRestaurante() as RestauranteBusca[];
        const buscaUsr = await usuarioRepo.buscaUsuarios();
        const grupoCadastrado = await grupoRepo.cadastraGrupo({
            dataCriacao: new Date(Date.now()),
            restaurantes: [restas[0]],
            restaurantesVisitados: [],
            participantes: [buscaUsr[0]],
            votador: [],
            votacao: []
        }) as GrupoBusca;

        
        const resposta = await verificacao.verificaRestauranteNoGrupo(restas[0]._id, grupoCadastrado._id);

        
        expect(resposta).toBe(true);
    });

    it('Verifica se usuario existe no grupo através do id, retornando false se não encontrar.', async () => {
         
        const usuarios = await usuarioRepo.buscaUsuarios();
        const grupoCadastrado = await grupoRepo.cadastraGrupo({
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [usuarios[0]],
            votador: [],
            votacao: []
        }) as GrupoBusca;

        
        const resposta = await verificacao.verificaUsuarioNoGrupo(usuarios[1].email, grupoCadastrado._id);

        
        expect(resposta).toBe(false);
    });

    it('Verifica se usuario já votou.', async () => {
         
        const usuarios = await usuarioRepo.buscaUsuarios();
        const grupoCadastrado = await grupoRepo.cadastraGrupo({
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [usuarios[0]],
            votador: [usuarios[0].email],
            votacao: []
        }) as GrupoBusca;

        
        const resposta = await verificacao.verificaVoto(usuarios[0].email, grupoCadastrado._id);

        
        expect(resposta).toBe(true);
    });

    it('Verifica se restaurante que venceu a votação já foi visitado, retornando false caso ainda não tenha sido.', async () => {
         
        const usuarios = await usuarioRepo.buscaUsuarios();
        const restaurantes = await restauranteRepositorio.buscaRestaurante() as RestauranteBusca[];
        const grupoCadastrado = await grupoRepo.cadastraGrupo({
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [usuarios[0]],
            votador: [],
            votacao: []
        }) as GrupoBusca;

        
        const resposta = await verificacao.verificaVencedor(restaurantes[0], grupoCadastrado._id);

        
        expect(resposta).toBe(false);
    });
});