import { Usuario } from './usuario';
import { RestauranteBusca } from './restaurante';

interface RestauranteVotacao { 
    restaurante: RestauranteBusca;
    votos: number;
}

interface Visitados { 
    restaurante: RestauranteBusca; 
    data: Date;
}

export interface Grupo {
    participantes: Usuario[];
    dataCriacao: Date;
    restaurantes: RestauranteBusca[];
    restaurantesVisitados: Visitados [];
    votacao: RestauranteVotacao [];
    votador: string[];
}

export interface GrupoBusca extends Grupo { 
    _id: string;
}