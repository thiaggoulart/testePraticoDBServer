import { connect } from 'mongoose';
import app from './app';
import { config } from 'dotenv';
async function main() {
    try {
        config();
        const env = process.env;
         const url = `mongodb://${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_BD}`;
         await connect(url, { useNewUrlParser: true });
         app.listen(app.get('port'), () => {
             console.log('Executando na porta 3000');
         }); 
    } catch (error) {
        console.log(error.message);
    }
}

main();