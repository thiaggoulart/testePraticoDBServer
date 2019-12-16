import { restauranteModel } from './restauranteModel';
import { Restaurante, RestauranteBusca } from '../entidades/restaurante';

export async function cadastraRestaurante(restaurante: Restaurante): Promise<Restaurante> {
    return restauranteModel.create(restaurante);
}

export async function buscaRestaurante(): Promise<Restaurante[]> {
    return restauranteModel.find().exec();
}

export async function buscaRestaurantePorId(id: string): Promise<Restaurante | null> { 
    return restauranteModel.findById(id).exec();
}

export async function buscaRestaurantePorNome(nome: string): Promise<Restaurante []> {
    return restauranteModel.find().where('nome').equals(new RegExp(nome,'i')).exec();
}

export async function buscaRestaurantePorLocalizacao(localizacao: string): Promise<Restaurante []> {
    return restauranteModel.find().where('localizacao').equals(new RegExp(localizacao,'i')).exec();
}

export async function editaRestaurante(id:string, restaurante: RestauranteBusca): Promise<Restaurante | null> {
    const buscaRestaurante = await restauranteModel.findById(id);
    if(buscaRestaurante) { 
        buscaRestaurante.nome = restaurante.nome; 
        buscaRestaurante.descricao = restaurante.descricao;
        buscaRestaurante.localizacao = restaurante.localizacao; 
    
        return buscaRestaurante.save();
    } else { 
        throw new Error ('Restaurante não encontrado')
    }
}

export async function removeRestaurante(id: string): Promise<number> {
    const exclui = await restauranteModel.deleteOne({_id: id}).exec();
    return exclui.n || 0;
}