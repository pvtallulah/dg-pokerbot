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
    fs.writeFileSync(
      path.join(__dirname, "./code.txt"),
      typeof code === "string" ? code : code[0]
    );
    pokerbotFSM.trigger("addToken");
    res.status(200).send("Code saved");
  } else {
    res.status(400).send("No code found");
  }
});

server.listen(8080);
const pokerbotFSM = new PokerbotFSM();
