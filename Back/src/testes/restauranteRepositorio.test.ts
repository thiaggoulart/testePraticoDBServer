import * as restauranteRepositorio from '../persistencia/restauranteRepositorio';
import { connect, connection } from 'mongoose';
import { Restaurante, RestauranteBusca } from '../entidades/restaurante';
import { config } from 'dotenv';

beforeAll(async () => {
    config();
    const env = process.env;
    const url = `mongodb://${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_BD}Restaurante`;
    await connect(url, { useNewUrlParser: true });
});

afterEach(async () => {
    const listaRestaurantes = await restauranteRepositorio.buscaRestaurante() as RestauranteBusca[];
    listaRestaurantes.forEach(async estab => {
        await restauranteRepositorio.removeRestaurante(estab._id);
    });
})

afterAll(async () => {
    const listaRestaurantes = await restauranteRepositorio.buscaRestaurante() as RestauranteBusca[];
    listaRestaurantes.forEach(async estab => {
        await restauranteRepositorio.removeRestaurante(estab._id);
    });
    connection.collection('Restaurante').drop;
    await connection.close();
})

describe('Testes das operações do repositório de restaurantes', async () => {
    it('Insere objeto no banco e faz a busca do mesmo no banco pelo id.', async () => {

        const novoRestaurante: Restaurante = {
            nome: 'Restaurante Teste Unitário',
            descricao: 'Descrição teste',
            localizacao: 'Avenida Bento Gonçalves, 1423',
        }

        const restauranteCadastrado = await restauranteRepositorio.cadastraRestaurante(novoRestaurante) as RestauranteBusca;
        const restauranteBuscado = await restauranteRepositorio.buscaRestaurantePorId(restauranteCadastrado._id);

        expect(restauranteBuscado!.nome).toEqual(restauranteCadastrado.nome);
        expect(restauranteBuscado!.localizacao).toEqual(restauranteCadastrado.localizacao);
    });

    it('Insere um Restaurante no banco, altera uma informação e verifica se a operação foi bem sucedida pesquisando por um atributo alterado.', async () => {

        const novoRestaurante: Restaurante = {
            nome: 'Restaurante Teste Unitário',
            descricao: 'Descrição teste',
            localizacao: 'Avenida Bento Gonçalves, 1423',
        }

        const restauranteCadastrado = await restauranteRepositorio.cadastraRestaurante(novoRestaurante) as RestauranteBusca;
        restauranteCadastrado.nome = 'Testando';
        restauranteCadastrado.descricao = 'Alterando descrição';
        restauranteCadastrado.localizacao = 'Avenida Ipiranga, 1789';
        await restauranteRepositorio.editaRestaurante(restauranteCadastrado._id, restauranteCadastrado);
        const restauranteBuscado = await restauranteRepositorio.buscaRestaurantePorLocalizacao('ipiranga');

        expect(restauranteBuscado[0].localizacao).not.toEqual(novoRestaurante.localizacao);
        expect(restauranteBuscado[0].localizacao).toEqual(restauranteCadastrado.localizacao)
        expect(restauranteBuscado[0].nome).toEqual(restauranteCadastrado.nome);
        expect(restauranteBuscado[0].descricao).toEqual(restauranteCadastrado.descricao);
    });

    it('Insere objeto no banco, exclui o mesmo objeto e verifica se o mesmo foi excluído.', async () => {
        
        const novoRestaurante: Restaurante = {
            nome: 'Restaurante Teste Unitário',
            descricao: 'Descrição teste',
            localizacao: 'Avenida Bento Gonçalves, 1423',
        }

        const restauranteCadastrado = await restauranteRepositorio.cadastraRestaurante(novoRestaurante) as RestauranteBusca;
        await restauranteRepositorio.removeRestaurante(restauranteCadastrado._id);
        const restauranteBuscado = await restauranteRepositorio.buscaRestaurantePorId(restauranteCadastrado._id);

        expect(restauranteBuscado).toBeNull();
    });

    it('Insere 3 objetos no banco  e busca por todos inseridos.', async () => {
       
        const novoRestaurante: Restaurante = {
            nome: 'Restaurante Teste Unitário',
            descricao: 'Descrição teste',
            localizacao: 'Avenida Bento Gonçalves, 1423',
        }

        const novoRestaurante2: Restaurante = {
            nome: 'Restaurante Teste Unitário',
            descricao: 'Descrição teste',
            localizacao: 'Avenida Bento Gonçalves, 1423',
        }

        const novoRestaurante3: Restaurante = {
            nome: 'Restaurante Teste Unitário',
            descricao: 'Descrição teste',
            localizacao: 'Avenida Bento Gonçalves, 1423',
        }

        await restauranteRepositorio.cadastraRestaurante(novoRestaurante) as RestauranteBusca;
        await restauranteRepositorio.cadastraRestaurante(novoRestaurante2) as RestauranteBusca;
        await restauranteRepositorio.cadastraRestaurante(novoRestaurante3) as RestauranteBusca;
        const restauranteBuscado = await restauranteRepositorio.buscaRestaurante();

        expect(restauranteBuscado.length).toBe(3);
    });

    it('Insere 3 objetos no banco e faz a busca pelo endereço retornando uma lista com os objetos encontrados.', async () => {

        const novoRestaurante: Restaurante = {
            nome: 'Restaurante Teste Unitário',
            descricao: 'Descrição teste',
            localizacao: 'Rua F',
        }

        const novoRestaurante2: Restaurante = {
            nome: 'Restaurante Teste Unitário',
            descricao: 'Descrição teste',
            localizacao: 'Rua F',
        }

        const novoRestaurante3: Restaurante = {
            nome: 'Restaurante Teste Unitário',
            descricao: 'Descrição teste',
            localizacao: 'Rua E',
        }
        
        await restauranteRepositorio.cadastraRestaurante(novoRestaurante) as RestauranteBusca;
        await restauranteRepositorio.cadastraRestaurante(novoRestaurante2) as RestauranteBusca;
        await restauranteRepositorio.cadastraRestaurante(novoRestaurante3) as RestauranteBusca;

        const restauranteBuscado = await restauranteRepositorio.buscaRestaurantePorLocalizacao('rua f');

        expect(restauranteBuscado.length).toBe(2);
    });

    it('Insere 3 objetos no banco e faz a busca pelo nome retornando uma lista com os objetos encontrados.', async () => {

        const novoRestaurante: Restaurante = {
            nome: 'Restaurante Teste Unitário',
            descricao: 'Descrição teste',
            localizacao: 'Avenida Bento Gonçalves, 1423',
        }

        const novoRestaurante2: Restaurante = {
            nome: 'Restaurante Teste Unitário',
            descricao: 'Descrição teste',
            localizacao: 'Avenida Bento Gonçalves, 1423',
        }

        const novoRestaurante3: Restaurante = {
            nome: 'Restaurante Teste ',
            descricao: 'Descrição teste',
            localizacao: 'Avenida Bento Gonçalves, 1423',
        }

        await restauranteRepositorio.cadastraRestaurante(novoRestaurante) as RestauranteBusca;
        await restauranteRepositorio.cadastraRestaurante(novoRestaurante2) as RestauranteBusca;
        await restauranteRepositorio.cadastraRestaurante(novoRestaurante3) as RestauranteBusca;

        const restauranteBuscado = await restauranteRepositorio.buscaRestaurantePorNome('teste unitário');

        expect(restauranteBuscado.length).toBe(2);
    });

    it('Insere objeto no banco, faz a remoção e busca o mesmo no banco pelo id retornando null.', async () => {
      
        const novoRestaurante: Restaurante = {
            nome: 'Restaurante Teste Unitário',
            descricao: 'Descrição teste',
            localizacao: 'Avenida Bento Gonçalves, 1423',
        }

        const restauranteCadastrado = await restauranteRepositorio.cadastraRestaurante(novoRestaurante) as RestauranteBusca;
        await restauranteRepositorio.removeRestaurante(restauranteCadastrado._id)
        const restauranteBuscado = await restauranteRepositorio.buscaRestaurantePorId(restauranteCadastrado._id);

        expect(restauranteBuscado).toBeNull();
    });

    it('Insere um Restaurante no banco, altera uma informação e tenta salvar a alteração com Id inexistente.', async () => {
        
        const novoRestaurante: Restaurante = {
            nome: 'Restaurante Teste Unitário',
            descricao: 'Descrição teste',
            localizacao: 'Avenida Bento Gonçalves, 1423',
        }

        const restauranteCadastrado = await restauranteRepositorio.cadastraRestaurante(novoRestaurante) as RestauranteBusca;
        restauranteCadastrado.nome = 'Testando';
        restauranteCadastrado.descricao = 'Alterando descrição';
        restauranteCadastrado.localizacao = 'Avenida Ipiranga, 1789';

        await expect(restauranteRepositorio.editaRestaurante('5db7caaafc082357838ea2df', restauranteCadastrado))
            .rejects
            .toThrowError('Restaurante não encontrado');
    });

});
