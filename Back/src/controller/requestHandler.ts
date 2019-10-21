import { param, query, body } from "express-validator";

export const expressValidatorId = [
    param('id', 'Id inválido').isMongoId().optional(),
    query('id', 'Id(s) inválido(s)').isMongoId().optional()
];

export const expressValidator = [
    body('name')
        .isString().withMessage('Campo name deve ser do tipo texto')
        .isLength({ max: 40 }).withMessage('Limite de caracteres extendido em name')
        .not().isEmpty().withMessage('Campo name é obrigatório'),
    param('id', 'Id inválido').isMongoId().optional()
];
