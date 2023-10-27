import express from 'express';

const app = express();

app.get('/', (_req, res) => {
  return res.json({message: 'Hello, World!'});
});

export {app};
