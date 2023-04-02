import fs from "fs";
import path from "path";
import https from "https";
import express from "express";

import { PokerbotFSM } from "./fsm/fsm";

const key = fs.readFileSync(path.join(__dirname, "./certs/key.pem"));
const cert = fs.readFileSync(path.join(__dirname, "./certs/cert.pem"));

const app = express();

const server = https.createServer({ key: key, cert: cert }, app);

app.get("/", (req, res) => {
  const { code } = req.query;
  if (code) {
    console.log(code);
  } else {
    res.status(400).send("No code found");
  }
});

server.listen(8080);
new PokerbotFSM();
