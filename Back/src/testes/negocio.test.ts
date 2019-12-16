import * as grupoRepo from '../persistencia/grupoRepositorio';
import * as usuarioRepo from '../persistencia/usuarioRepositorio';
import * as restauranteRepositorio from '../persistencia/restauranteRepositorio';
import * as negocio from '../negocio/negocio';
import { connect, connection } from 'mongoose';
import { config } from 'dotenv';
import { GrupoBusca } from '../entidades/grupo';
import { RestauranteBusca, Restaurante } from '../entidades/restaurante';
import { Usuario } from '../entidades/usuario';

beforeAll(async () => {
    config();
    const env = process.env;
    const url = `mongodb://${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_BD}Negocio`;
    await connect(url, { useNewUrlParser: true });

    const umUsuario: Usuario = {
        email: '',
        nome: '',
        senha: 'thiaggoulart'
    }

    let cont = 1;
    while (cont < 6) {
        umUsuario.email = `usuario${cont}@teste.com`;
        umUsuario.nome = `usuario${cont}`
        await usuarioRepo.cadastraUsuario(umUsuario);
        cont++;
    }

    const umRestaurante: Restaurante = {
        nome: 'Restaurante 1',
        descricao: 'uma descrição',
        localizacao: 'Rua F',
    }
    await restauranteRepositorio.cadastraRestaurante(umRestaurante);

    umRestaurante.nome = 'Restaurante 2';
    umRestaurante.descricao = 'outra descricao';
    umRestaurante.localizacao = 'Rua E';

    await restauranteRepositorio.cadastraRestaurante(umRestaurante);


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

describe('Testes das operações de negócio', async () => {
    it('Insere restaurante no grupo.', async () => {
       
        const buscaUsr = await usuarioRepo.buscaUsuarios();
        const buscaResta = await restauranteRepositorio.buscaRestaurante() as RestauranteBusca[];

        const grupoCadastrado = await grupoRepo.cadastraGrupo({
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [buscaUsr[0]],
            votador: [],
            votacao: []
        }) as GrupoBusca;

        
        await negocio.insereRestauranteNoGrupo(grupoCadastrado._id, buscaResta[0]._id);
        const grupoBuscado = await grupoRepo.buscaGrupoPorId(grupoCadastrado._id) as GrupoBusca;

        
        expect(grupoBuscado.restaurantes).toHaveLength(1);
        expect(grupoBuscado.votacao).toHaveLength(1);
        expect(grupoBuscado.restaurantes[0].nome).toEqual(buscaResta[0].nome);
        expect(grupoBuscado.restaurantes[0]._id).toEqual(buscaResta[0]._id);
        expect(grupoBuscado.votacao[0].restaurante._id).toEqual(buscaResta[0]._id);
    });

    it('Tenta inserir um restaurante que já consta no grupo. Lança uma exceção informando que o restaurante já está vinculado', async () => {
       
        const buscaUsr = await usuarioRepo.buscaUsuarios();
        const buscaResta = await restauranteRepositorio.buscaRestaurante() as RestauranteBusca[];

        const grupoCadastrado = await grupoRepo.cadastraGrupo({
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [buscaUsr[0]],
            votador: [],
            votacao: []
        }) as GrupoBusca;

        
        await negocio.insereRestauranteNoGrupo(grupoCadastrado._id, buscaResta[0]._id);

        
        await expect(negocio.insereRestauranteNoGrupo(grupoCadastrado._id, buscaResta[0]._id))
        .rejects.toThrowError('Restaurante já consta no grupo');
    });

    it('Função que permite o usuário participar de um grupo.', async () => {
       
        const buscaUsr = await usuarioRepo.buscaUsuarios();

        const grupoCadastrado = await grupoRepo.cadastraGrupo({
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [buscaUsr[0]],
            votador: [],
            votacao: []
        }) as GrupoBusca;

        
        await negocio.participaGrupo(grupoCadastrado._id, buscaUsr[1].email);
        const grupoBuscado = await grupoRepo.buscaGrupoPorId(grupoCadastrado._id) as GrupoBusca;

        
        expect(grupoBuscado.participantes).toHaveLength(2);
        expect(grupoBuscado.participantes[1].nome).toEqual(buscaUsr[1].nome);
        expect(grupoBuscado.participantes[1].email).toEqual(buscaUsr[1].email);
    });

    it('Tenta fazer um usuário ingressar a um grupo que já participa. Retorna uma exceção informando que o usuário já está vinculado ao grupo.', async () => {
       
        const buscaUsr = await usuarioRepo.buscaUsuarios();

        const grupoCadastrado = await grupoRepo.cadastraGrupo({
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [buscaUsr[0]],
            votador: [],
            votacao: []
        }) as GrupoBusca;

        
        await negocio.participaGrupo(grupoCadastrado._id, buscaUsr[1].email);

        
        await expect(negocio.participaGrupo(grupoCadastrado._id, buscaUsr[1].email))
            .rejects.toThrowError('Usuário já está no grupo');
    });

    it('Função que permite um usuário votar em um restaurante pertencente ao mesmo grupo.', async () => {
       
        const buscaUsr = await usuarioRepo.buscaUsuarios();
        const buscaResta = await restauranteRepositorio.buscaRestaurante() as RestauranteBusca[];

        const grupoCadastrado = await grupoRepo.cadastraGrupo({
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [buscaUsr[0]],
            votador: [],
            votacao: []
        }) as GrupoBusca;
        

        for (const usr of buscaUsr) {
            if (buscaUsr[0].email !== usr.email) await negocio.participaGrupo(grupoCadastrado._id, usr.email);
        }

        for (const resta of buscaResta) {
            await negocio.insereRestauranteNoGrupo(grupoCadastrado._id, resta._id);
        }

        await negocio.votaRestaurante(buscaUsr[0].email, buscaResta[1]._id, grupoCadastrado._id);
        await negocio.votaRestaurante(buscaUsr[1].email, buscaResta[1]._id, grupoCadastrado._id);
        await negocio.votaRestaurante(buscaUsr[2].email, buscaResta[0]._id, grupoCadastrado._id);
        const grupoBuscado = await grupoRepo.buscaGrupoPorId(grupoCadastrado._id) as GrupoBusca;

        
        expect(grupoBuscado.votacao[1].votos).toEqual(2);
        expect(grupoBuscado.votacao[0].votos).toEqual(1);
        expect(grupoBuscado.votador).toHaveLength(3);
    });

    it('Faz um usuário, que já votou, votar em um restaurante. Retorna uma exceção', async () => {
       
        const buscaUsr = await usuarioRepo.buscaUsuarios();
        const buscaResta = await restauranteRepositorio.buscaRestaurante() as RestauranteBusca[];

        const grupoCadastrado = await grupoRepo.cadastraGrupo({
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [buscaUsr[0]],
            votador: [],
            votacao: []
        }) as GrupoBusca;
        

        for (const usr of buscaUsr) {
            if (buscaUsr[0].email !== usr.email) await negocio.participaGrupo(grupoCadastrado._id, usr.email);
        }

        for (const resta of buscaResta) {
            await negocio.insereRestauranteNoGrupo(grupoCadastrado._id, resta._id);
        }

        await negocio.votaRestaurante(buscaUsr[0].email, buscaResta[1]._id, grupoCadastrado._id);

        
        await expect(negocio.votaRestaurante(buscaUsr[0].email, buscaResta[0]._id, grupoCadastrado._id))
            .rejects.toThrowError('Usuário já votou');
    });

    it('Faz o usuário votar em um restaurante que não pertence ao mesmo grupo. Retorna uma exceção informando o ocorrido', async () => {
       
        const buscaUsr = await usuarioRepo.buscaUsuarios();
        const buscaResta = await restauranteRepositorio.buscaRestaurante() as RestauranteBusca[];

        const grupoCadastrado = await grupoRepo.cadastraGrupo({
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [buscaUsr[0]],
            votador: [],
            votacao: []
        }) as GrupoBusca;
        

        for (const usr of buscaUsr) {
            if (buscaUsr[0].email !== usr.email) await negocio.participaGrupo(grupoCadastrado._id, usr.email);
        }

        
        await expect(negocio.votaRestaurante(buscaUsr[0].email, buscaResta[1]._id, grupoCadastrado._id))
            .rejects.toThrowError('Restaurante não pertence ao grupo');

    });

    it('Função que permite um usuário ver os resultados da votação.', async () => {
       
        const buscaUsr = await usuarioRepo.buscaUsuarios();
        const buscaResta = await restauranteRepositorio.buscaRestaurante() as RestauranteBusca[];

        const grupoCadastrado = await grupoRepo.cadastraGrupo({
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [buscaUsr[0]],
            votador: [],
            votacao: []
        }) as GrupoBusca;
        

        for (const usr of buscaUsr) {
            if (buscaUsr[0].email !== usr.email) await negocio.participaGrupo(grupoCadastrado._id, usr.email);
        }

        for (const resta of buscaResta) {
            await negocio.insereRestauranteNoGrupo(grupoCadastrado._id, resta._id);
        }

        await negocio.votaRestaurante(buscaUsr[0].email, buscaResta[1]._id, grupoCadastrado._id);
        await negocio.votaRestaurante(buscaUsr[1].email, buscaResta[1]._id, grupoCadastrado._id);
        await negocio.votaRestaurante(buscaUsr[2].email, buscaResta[0]._id, grupoCadastrado._id);
        await negocio.votaRestaurante(buscaUsr[3].email, buscaResta[1]._id, grupoCadastrado._id);
        await negocio.votaRestaurante(buscaUsr[4].email, buscaResta[0]._id, grupoCadastrado._id);

        const resultado = await negocio.mostraResultado(grupoCadastrado._id);
        const grupoBuscado = await grupoRepo.buscaGrupoPorId(grupoCadastrado._id) as GrupoBusca;

        
        expect(resultado.nome).toEqual(buscaResta[1].nome);
        expect(resultado.localizacao).toEqual(buscaResta[1].localizacao);
        expect(grupoBuscado.restaurantesVisitados[0].restaurante.nome).toEqual(resultado.nome);
        expect(grupoBuscado.restaurantesVisitados[0].restaurante.localizacao).toEqual(resultado.localizacao);
        expect(grupoBuscado.votacao[0].votos).toEqual(0);
        expect(grupoBuscado.votacao[1].votos).toEqual(0);
        expect(grupoBuscado.votador).toHaveLength(0);
    });

    it('Função que permite um usuário ver os resultados da votação e atualiza a data que o restaurante foi visitado.', async () => {
       
        const buscaUsr = await usuarioRepo.buscaUsuarios();
        const buscaResta = await restauranteRepositorio.buscaRestaurante() as RestauranteBusca[];

        const grupoCadastrado = await grupoRepo.cadastraGrupo({
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [{
                restaurante: buscaResta[1],
                data: new Date('2019/10/17')
            }],
            participantes: [buscaUsr[0]],
            votador: [],
            votacao: []
        }) as GrupoBusca;
        

        for (const usr of buscaUsr) {
            if (buscaUsr[0].email !== usr.email) await negocio.participaGrupo(grupoCadastrado._id, usr.email);
        }

        for (const resta of buscaResta) {
            await negocio.insereRestauranteNoGrupo(grupoCadastrado._id, resta._id);
        }

        await negocio.votaRestaurante(buscaUsr[0].email, buscaResta[1]._id, grupoCadastrado._id);
        await negocio.votaRestaurante(buscaUsr[1].email, buscaResta[1]._id, grupoCadastrado._id);
        await negocio.votaRestaurante(buscaUsr[2].email, buscaResta[0]._id, grupoCadastrado._id);
        await negocio.votaRestaurante(buscaUsr[3].email, buscaResta[1]._id, grupoCadastrado._id);
        await negocio.votaRestaurante(buscaUsr[4].email, buscaResta[0]._id, grupoCadastrado._id);

        const resultado = await negocio.mostraResultado(grupoCadastrado._id);
        const grupoBuscado = await grupoRepo.buscaGrupoPorId(grupoCadastrado._id) as GrupoBusca;

        
        expect(resultado.nome).toEqual(buscaResta[1].nome);
        expect(resultado.localizacao).toEqual(buscaResta[1].localizacao);
        expect(grupoBuscado.restaurantesVisitados[0].restaurante.nome).toEqual(resultado.nome);
        expect(grupoBuscado.restaurantesVisitados[0].restaurante.localizacao).toEqual(resultado.localizacao);
        expect(grupoBuscado.votacao[0].votos).toEqual(0);
        expect(grupoBuscado.votacao[1].votos).toEqual(0);
        expect(grupoBuscado.restaurantesVisitados[0].data.getDate()).toBe(new Date(Date.now()).getDate());
        expect(grupoBuscado.votador).toHaveLength(0);
    });

    it('Função que permite um usuário listar os restaurantes que ainda não foram visitados na semana.', async () => {
       
        const buscaUsr = await usuarioRepo.buscaUsuarios();
        const buscaResta = await restauranteRepositorio.buscaRestaurante() as RestauranteBusca[];

        const grupoCadastrado = await grupoRepo.cadastraGrupo({
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [{
                data: new Date('2019/10/29'),
                restaurante: buscaResta[0]
            }],
            participantes: [buscaUsr[0]],
            votador: [],
            votacao: []
        }) as GrupoBusca;
        
        for (const resta of buscaResta) {
            await negocio.insereRestauranteNoGrupo(grupoCadastrado._id, resta._id);
        }

        const listaNaoVisitados = await negocio.buscaRestauranteNaoVisitados(grupoCadastrado._id);

        
        expect(listaNaoVisitados).toHaveLength(1);
    });
});
