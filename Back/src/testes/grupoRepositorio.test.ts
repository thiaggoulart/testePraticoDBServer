import * as grupoRepo from '../persistencia/grupoRepositorio';
import * as usuarioRepo from '../persistencia/usuarioRepositorio';
import { connect, connection } from 'mongoose';
import { Grupo, GrupoBusca } from '../entidades/grupo';
import { config } from 'dotenv';
import * as restauranteRepositorio from '../persistencia/restauranteRepositorio';
import { RestauranteBusca } from '../entidades/restaurante';
import { Usuario } from '../entidades/usuario';

let novoParticipante: Usuario;

beforeAll(async () => {
    config();
    const env = process.env;
    const url = `mongodb://${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_BD}Grupo`;
    await connect(url, { useNewUrlParser: true });

    novoParticipante = await usuarioRepo.cadastraUsuario({
        email: 'thiaggoulart@gmail.com',
        nome: 'Thiago',
        senha: 'thiaggoulart'
    });
});

afterEach(async () => {
    const listaGrupo = await grupoRepo.buscaGrupo() as GrupoBusca[];
    listaGrupo.forEach(async grupo => {
        await grupoRepo.removeGrupo(grupo._id);
    });
})

afterAll(async () => {
    const listaGrupo = await grupoRepo.buscaGrupo() as GrupoBusca[];
    listaGrupo.forEach(async grupo => {
        await grupoRepo.removeGrupo(grupo._id);
    });
    await usuarioRepo.removeUsuario('thiaggoulart@gmail.com');
    await connection.close();
})

describe('Testes das operações do repositório de usuários', async () => {
    it('Insere objeto no banco e busco mesmo pelo id.', async () => {
        
        const novoGrupo: Grupo = {
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [novoParticipante],
            votacao: [],
            votador: [],
        }

        
        const grupoCadastrado = await grupoRepo.cadastraGrupo(novoGrupo) as GrupoBusca;
        const grupoBuscado = await grupoRepo.buscaGrupoPorId(grupoCadastrado._id);
        
        expect(grupoBuscado!.dataCriacao).toEqual(grupoCadastrado.dataCriacao);
        expect(grupoBuscado!.participantes).toHaveLength(grupoCadastrado.participantes.length);
    });

    it('Tenta inserir um objeto no banco sem ter um usuario vinculado ocasionando um erro.', async () => {
        
        const novoGrupo: Grupo = {
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [],
            votacao: [],
            votador: [],
        }

        
        await expect(grupoRepo.cadastraGrupo(novoGrupo)).rejects.toThrowError('Grupo deve ter pelo menos um participante associado')
    });


    it('Insere objeto no banco, altera uma informação e verifica se a operação foi bem sucedida.', async () => {
        

        const novoRestaurante = await restauranteRepositorio.cadastraRestaurante({
            descricao: 'teste',
            localizacao: 'Rua F',
            nome: 'Restaurante Teste',
        }) as RestauranteBusca;

        const novoGrupo: Grupo = {
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [novoParticipante],
            votacao: [],
            votador: [],
        }

        
        const grupoCadastrado = await grupoRepo.cadastraGrupo(novoGrupo) as GrupoBusca;
        grupoCadastrado.restaurantes.push(novoRestaurante);
        await grupoRepo.editaGrupo(grupoCadastrado._id, grupoCadastrado);
        const grupoBuscado = await grupoRepo.buscaGrupoPorId(grupoCadastrado._id) as GrupoBusca;

        
        expect(grupoBuscado!._id).toEqual(grupoCadastrado._id);
        expect(grupoBuscado!.restaurantes).toHaveLength(1);
    });

    it('Insere objeto no banco, exclui o mesmo objeto e verifica se o mesmo foi excluído.', async () => {
        
        const novoGrupo: Grupo = {
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [novoParticipante],
            votacao: [],
            votador: [],
        }

        
        const grupoCadastrado = await grupoRepo.cadastraGrupo(novoGrupo) as GrupoBusca;
        await grupoRepo.removeGrupo(grupoCadastrado._id);
        const grupoBuscado = await grupoRepo.buscaGrupoPorId(grupoCadastrado._id);

        
        expect(grupoBuscado).toBeNull();
    })

    it('Insere 3 objetos no banco e faz a busca por todos no banco.', async () => {
        
        const novoGrupo: Grupo = {
            dataCriacao: new Date(Date.now()),
            restaurantes: [],
            restaurantesVisitados: [],
            participantes: [novoParticipante],
            votacao: [],
            votador: [],
        }

        
        await grupoRepo.cadastraGrupo(novoGrupo) as GrupoBusca;
        await grupoRepo.cadastraGrupo(novoGrupo) as GrupoBusca;
        await grupoRepo.cadastraGrupo(novoGrupo) as GrupoBusca;

        const grupoBuscado = await grupoRepo.buscaGrupo();
        const pos = grupoBuscado[0] as GrupoBusca
        
        expect(grupoBuscado).toHaveLength(3);
    })

    it('Procura por grupo que não consta no banco pelo id e retorna um objeto do tipo null', async () => {
        
        const grupoBuscado = await grupoRepo.buscaGrupoPorId('5db4fed0cce9fb2d651c7108');

         
        expect(grupoBuscado).toBe(null);
    });

});
