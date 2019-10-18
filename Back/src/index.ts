import app from './app';
import { connect } from 'mongoose';

(async() => {
    try{
        const url = ('mongodb+srv://restaurants:'+ 
        process.env.MONGO_ATLAS_PW +
        '@projeto-yan8z.mongodb.net/estufa?retryWrites=true&w=majority');

        try {
            const client = await connect(url, { useNewUrlParser: true });
     
            app.listen(app.get('port'));        
            
          } catch (erro) {
            console.log(`Erro: ${erro.message}`);
          } 
        

    }    catch(error){
        console.log(`Erro: ${error}`);
    }
})();
