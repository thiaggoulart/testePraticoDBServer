export interface Restaurante { 
    nome: string;
    descricao: string; 
    localizacao: string;
}

export interface RestauranteBusca extends Restaurante { 
    _id: string;
}