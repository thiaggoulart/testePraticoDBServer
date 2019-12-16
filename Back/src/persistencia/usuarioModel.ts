import { Document, Model, model, Schema } from 'mongoose';
import { Usuario } from '../entidades/usuario';

interface UsuarioDocument extends Document, Usuario {};

export const usuarioModel: Model<UsuarioDocument> = model<UsuarioDocument> ('Usuario', new Schema({
    nome: {type: String, required: true},
    email: {type: String, required: true},
    senha: {type: String, required: true, select: false}
}),'Usuario');
