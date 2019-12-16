import { Grupo } from '../entidades/grupo';
import { Document, Model, model, Schema, SchemaTypes } from 'mongoose';

interface GrupoDocument extends Document, Grupo { };

export const grupoModel: Model<GrupoDocument> = model<GrupoDocument>('Grupo', new Schema({
    participantes: [{ type: SchemaTypes.ObjectId, ref: 'Usuario', required: true }],
    dataCriacao: { type: Date, required: true, default: new Date(Date.now()) },
    restaurantes: [{ type: SchemaTypes.ObjectId, ref: 'Restaurante' }],
    restaurantesVisitados: [{
        restaurante: { type: SchemaTypes.ObjectId, ref: 'Restaurante' },
        data: { type: Date }
    }],
    votacao: [{
        votos: { type: Number },
        restaurante: { type: SchemaTypes.ObjectId, ref: 'Restaurante' }
    }],
    votador: [{ type: String }],
}), 'Grupo');
