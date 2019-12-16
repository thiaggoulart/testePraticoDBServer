
import * as usuarioRepo from './usuarioRepositorio';
import * as restauranteRepositorio from './restauranteRepositorio';
import * as grupoRepo from './grupoRepositorio';
import { RestauranteBusca, Restaurante } from '../entidades/restaurante';
import { Grupo } from '../entidades/grupo';
import { Usuario } from '../entidades/usuario';
 
export async function verificaGrupo(id: string): Promise<Grupo> {
    const grupoBuscado = await grupoRepo.buscaGrupoPorId(id);
    if (grupoBuscado) {
        return grupoBuscado;
    } else {
        throw new Error('Grupo não encontrado.');
    }
}

export async function verificaRestaurante(id: string): Promise<Restaurante> {
    const restauranteBuscado = await restauranteRepositorio.buscaRestaurantePorId(id);
    if (restauranteBuscado) {
        return restauranteBuscado;
    } else {
        throw new Error('Restaurante não encontrado');
    }
}

export async function verificaUsuario(email: string): Promise<Usuario> {
    const usuarioBuscado = await usuarioRepo.buscaUsuarioPorEmail(email);
    if (usuarioBuscado) {
        return usuarioBuscado;
    } else {
        throw new Error('Usuário não encontrado.');
    }
}

export async function verificaUsuarioNoGrupo(email: string, idGrupo: string): Promise<Boolean> {
    const grupo = await verificaGrupo(idGrupo);
    return grupo.participantes.some(part => part.email === email);
}

export async function verificaRestauranteNoGrupo(idRestaurante: string, idGrupo: string): Promise<Boolean> {
    const grupo = await verificaGrupo(idGrupo);
    return grupo.restaurantes.some(part => part._id.toString() === idRestaurante.toString())
}

export async function verificaVoto(email: string, idGrupo: string): Promise<Boolean> {
    const grupo = await verificaGrupo(idGrupo);
    return grupo.votador.some(votoEmail => votoEmail === email);
}

export async function verificaVencedor(restaurante: RestauranteBusca, idGrupo: string): Promise<Boolean> {
    const grupo = await verificaGrupo(idGrupo);
    return grupo.restaurantesVisitados.some(visitado =>
        visitado.restaurante._id.toString() === restaurante._id.toString()
    );
}