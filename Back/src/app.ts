import express from 'express';
import bodyParser from 'body-parser';

import cors from 'cors';


const app = express();
const port = '3000';

app.use(cors());
app.set('port',port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

export default app;


