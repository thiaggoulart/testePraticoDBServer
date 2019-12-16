import passport from 'passport';
import passportlocal from 'passport-local';
import passportjwt from 'passport-jwt';
import { buscaUsuarioPorEmailComSenha } from '../persistencia/usuarioRepositorio';
import { compare } from 'bcrypt';


const LocalStrategy = passportlocal.Strategy;

export const auth = passport;

auth.use('login', new LocalStrategy(async (email, passwd, done) => {
    const buscaUsuario = await buscaUsuarioPorEmailComSenha(email);
    if (!buscaUsuario) {
        return done(undefined, false, {message:'Usuário não encontrado'});
    }
    const verificaSenha = await compare(passwd, buscaUsuario.senha);
    if (!verificaSenha) {
        return done(undefined, false, {message:'Usuário ou senha inválidos'});
    }
    return done(undefined, {nome: buscaUsuario.nome, email: buscaUsuario.email});
}));

const JwtStrategy = passportjwt.Strategy;

auth.use(new JwtStrategy({
    secretOrKey: '62d595398e63cca06584016fdf35ab99',
    jwtFromRequest: passportjwt.ExtractJwt.fromAuthHeaderAsBearerToken()
    }, (token,done) => {
        try {
            return done(undefined, token);
        } catch (error) {
            done(error);
        }
    })
);