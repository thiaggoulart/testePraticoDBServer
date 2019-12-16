import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import errorhandler from 'errorhandler';
import { auth } from './persistencia/autenticacao';
import * as restauranteRotas from './rotas/restauranteRotas';
import * as gruposRotas from './rotas/gruposRotas';
import * as usuarioRotas from './rotas/usuarioRotas';
import * as autenticacaoRotas from './rotas/autenticacaoRotas';

const app = express();
app.set('port', 3000);
app.use(helmet());
app.use(cors());
app.use(auth.initialize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(errorhandler());
app.use(usuarioRotas.path, usuarioRotas.router);
app.use(gruposRotas.path, gruposRotas.router);
app.use(restauranteRotas.path, restauranteRotas.router);
app.use('',autenticacaoRotas.router);

export default app;
