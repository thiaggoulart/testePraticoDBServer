import { Document, Model, model, Schema } from 'mongoose';
import { Restaurante } from '../entidades/restaurante';

interface RestauranteDocument extends Document, Restaurante {};

export const restauranteModel: Model<RestauranteDocument> = model<RestauranteDocument> ('Restaurante', new Schema({
    nome: {type: String, required: true},
    descricao: {type: String, required: true},
    localizacao: {type: String, required: true},
    ultimaVisita: {type: Date}
}),'Restaurante');
