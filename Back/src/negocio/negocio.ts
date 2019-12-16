import * as grupoRepo from '../persistencia/grupoRepositorio';
import * as verificadores from '../persistencia/verificacao';
import { RestauranteBusca, Restaurante } from '../entidades/restaurante';
import { GrupoBusca, Grupo } from '../entidades/grupo';


export async function insereRestauranteNoGrupo(idGrupo: string, idRestaurante: string): Promise<Grupo> {
    const grupo = await verificadores.verificaGrupo(idGrupo);

    if (await verificadores.verificaRestauranteNoGrupo(idRestaurante, idGrupo)) {
        throw new Error('Restaurante já consta no grupo.')
    }

    const buscaRestaurante = await verificadores.verificaRestaurante(idRestaurante) as RestauranteBusca;
    grupo.restaurantes.push(buscaRestaurante);
    grupo.votacao.push({
        restaurante: buscaRestaurante,
        votos: 0
    });
    return grupoRepo.editaGrupo(idGrupo, grupo);

}

export async function participaGrupo(idGrupo: string, email: string): Promise<Grupo> {
    const grupo = await verificadores.verificaGrupo(idGrupo);

    if (await verificadores.verificaUsuarioNoGrupo(email, idGrupo)) {
        throw new Error('Usuário já está no grupo.')
    }

    const usuario = await verificadores.verificaUsuario(email);
    grupo.participantes.push(usuario);
    return grupoRepo.editaGrupo(idGrupo, grupo);
}

export async function votaRestaurante(email: string, idRestaurante: string, idGrupo: string): Promise<Grupo> {
    try {
        const grupo = await verificadores.verificaGrupo(idGrupo);
        await verificadores.verificaUsuario(email);
        
        if (!await verificadores.verificaVoto(email, idGrupo)) {
            const restaurante = await verificadores.verificaRestaurante(idRestaurante) as RestauranteBusca;
            if (!await verificadores.verificaRestauranteNoGrupo(idRestaurante, idGrupo)) {
                throw new Error('Restaurante não pertence ao grupo.')
            }
            grupo.votador.push(email);
            const indice = grupo.votacao.findIndex(index => index.restaurante._id.toString() === restaurante._id.toString() )
            grupo.votacao[indice].votos++;
            return grupoRepo.editaGrupo(idGrupo, grupo);
        } else {
            throw new Error('Usuário já votou.');
        }
    } catch (error) {
        throw new Error(error.message)
    }
}

export async function mostraResultado(idGrupo: string): Promise<Restaurante> {
    const grupo = await verificadores.verificaGrupo(idGrupo) as GrupoBusca;

    let maior = grupo.votacao[0].votos;
    let vencedor = grupo.votacao[0].restaurante;
    for (let index of grupo.votacao) {
        if (index.votos > maior) {
            maior = index.votos;
            vencedor = index.restaurante;
        }
    }

    if (!await verificadores.verificaVencedor(vencedor, idGrupo)) {
        grupo.restaurantesVisitados.push({
            data: new Date(Date.now()),
            restaurante: vencedor
        });

    } else {
        const indice = grupo.restaurantesVisitados
            .findIndex(index => index.restaurante._id.toString() === vencedor._id.toString())
        grupo.restaurantesVisitados[indice].data = new Date(Date.now());
    }

grupo.votacao.forEach(index => {
    index.votos = 0;
});

grupo.votador = [];
await grupoRepo.editaGrupo(idGrupo, grupo);
return vencedor;
}

export async function buscaRestauranteNaoVisitados(idGrupo: string): Promise<RestauranteBusca[]> {
    const grupo = await verificadores.verificaGrupo(idGrupo);
    const dataAtual = new Date(Date.now());
    if(grupo.restaurantesVisitados.length === 0) { 
        return grupo.restaurantes;
    }
    const lista = grupo.restaurantes
        .filter(index => {
            return grupo.restaurantesVisitados
                .some(visitado => {
                    if (visitado.restaurante._id.toString() === index._id.toString()) {
                        dataAtual.setUTCDate(dataAtual.getUTCDate() - dataAtual.getUTCDay())
                        const inicioSemana = dataAtual;
                        return visitado.data.getUTCDate() <= inicioSemana.getUTCDate();
                    } else {
                        return true;
                    }
                });
        });
    return lista;
}
