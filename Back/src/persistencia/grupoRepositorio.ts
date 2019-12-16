import { grupoModel } from './grupoModel';
import { Grupo } from '../entidades/grupo';
import { restauranteModel } from './restauranteModel';

export async function cadastraGrupo(grupo: Grupo): Promise<Grupo> {
    if (grupo.participantes.length < 1) {
        throw new Error('Grupo deve ter pelo menos um participante associado.');
    }
    return grupoModel.create(grupo);
}

export async function buscaGrupo(): Promise<Grupo[]> {
    return grupoModel.find()
        .populate('participantes')
        .populate('restaurantes', restauranteModel)
        .populate('restaurantes.votacao.restaurantes', restauranteModel)
        .populate('restaurantes.restaurantesVisitados.restaurantes', restauranteModel)
        .exec();
}

export async function buscaGrupoPorId(id: string): Promise<Grupo | null> {
    return grupoModel.findById(id)
        .populate('participantes')
        .populate('restaurantes', restauranteModel)
        .populate('votacao.restaurantes', restauranteModel)
        .populate('restaurantesVisitados.restaurantes', restauranteModel)
        .exec();
}

export async function editaGrupo(id: string, grupo: Grupo): Promise<Grupo> {
    const buscaGrupo = await grupoModel.findById(id).exec();
    if (buscaGrupo) {
        buscaGrupo.participantes = grupo.participantes
        buscaGrupo.restaurantesVisitados = grupo.restaurantesVisitados;
        buscaGrupo.restaurantes = grupo.restaurantes;
        buscaGrupo.votacao = grupo.votacao;
        buscaGrupo.votador = grupo.votador;
        return buscaGrupo.save();
    } else {
        throw new Error('Grupo não encontrado.');
    }
}

export async function removeGrupo(id: string): Promise<number> {
    const grupoRemovido = await grupoModel.deleteOne({ _id: id }).exec();
    return grupoRemovido.n || 0;
}