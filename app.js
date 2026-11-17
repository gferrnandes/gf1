require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const app = express();

app.set('view engine', 'ejs');                   
app.use(express.urlencoded({ extended: true })); 

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const validacoes = [
  body('nome').notEmpty().withMessage('Digite seu nome'),
  body('email').isEmail().withMessage('Digite um e-mail válido'),
  body('telefone').notEmpty().withMessage('Digite seu telefone'),
  body('assunto').notEmpty().withMessage('Digite o assunto'),
  body('mensagem').notEmpty().withMessage('Digite a mensagem'),
];


app.get('/', (req, res) => {
  res.render('index', { erros: [], sucesso: false });
});


app.post('/enviar', validacoes, async (req, res) => {
  const erros = validationResult(req);


  if (!erros.isEmpty()) {
    return res.render('index', { erros: erros.array(), sucesso: false });
  }

  const { nome, email, telefone, assunto, mensagem } = req.body;

  try {

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: assunto,
      text: `Nome: ${nome}\nE-mail: ${email}\nTelefone: ${telefone}\n\nMensagem:\n${mensagem}`,
    });
    res.render('index', { erros: [], sucesso: true });
  } catch (err) {
    console.error(err);
    res.render('index', {
      erros: [{ msg: 'Erro ao enviar o e-mail. Confira o .env' }],
      sucesso: false,
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Rodando em http://localhost:${process.env.PORT}`);
});
