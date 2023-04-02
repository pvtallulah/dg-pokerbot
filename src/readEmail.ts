import fs from "fs";
import readline from "readline";
import { Auth, google } from "googleapis";
import { credentialConfig } from "./credentials";

const SCOPES: string[] = ["https://www.googleapis.com/auth/gmail.readonly"];
const TOKEN_PATH: string = __dirname + "/token.json";

const saveToken = (token: Auth.Credentials) => {
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) return console.error(err);
    console.log("Token stored to", TOKEN_PATH);
  });
};

const validateToken = (
  oAuth2Client: Auth.OAuth2Client
): Promise<Auth.Credentials> => {
  return new Promise((resolve, reject) => {
    fs.readFile(TOKEN_PATH, async (err, token) => {
      try {
        if (err) {
          console.log("No token found, creating a new one");
          const newToken = await getNewToken(oAuth2Client);
          saveToken(newToken);
          resolve(newToken);
        } else {
          const activeToken: Auth.Credentials = JSON.parse(token.toString());
          if (
            activeToken?.expiry_date &&
            activeToken.expiry_date < Date.now()
          ) {
            console.log("Token expired, creating a new one");
            const newToken = await getNewToken(oAuth2Client);
            saveToken(newToken);
            return resolve(newToken);
          } else {
            console.log("Token is valid");
            oAuth2Client.setCredentials(activeToken);
            return resolve(activeToken);
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  });
};

const createOauth2Client = (): Auth.OAuth2Client => {
  const { client_secret, client_id, redirect_uris } =
    credentialConfig.maiki.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  return oAuth2Client;
};

async function authorize(
  oAuth2Client: Auth.OAuth2Client
): Promise<Auth.OAuth2Client> {
  return new Promise((resolve, reject) => {
    fs.readFile(TOKEN_PATH, async (err, token) => {
      if (err) return getNewToken(oAuth2Client);
      oAuth2Client.setCredentials(JSON.parse(token.toString()));
      return resolve(oAuth2Client);
    });
  });
}

export const getUrl = (): Promise<string> => {
  return new Promise<string>(async (resolve, reject) => {
    const oAuth2Client = createOauth2Client();
    const token = await validateToken(oAuth2Client);
    console.log(token);
    debugger;
    // const url = await authorize(oAuth2Client);
    resolve("");
  });
};

function getNewToken(
  oAuth2Client: Auth.OAuth2Client
): Promise<Auth.Credentials> {
  return new Promise((resolve, reject) => {
    debugger;
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter the code from that page here: ", (code: string) => {
      console.log("**************************code:", code);
      debugger;
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        debugger;
        if (err) return console.error("Error retrieving access token", err);
        console.log(token);
        if (token) {
          resolve(token);
        } else {
          reject("No token found");
        }
      });
    });
  });
}

function readEmail(auth: Auth.OAuth2Client): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    const gmail = google.gmail({ version: "v1", auth });
    const query = "from:web3auth is:unread";
    let response: any = null;
    try {
      response = await gmail.users.messages.list({ userId: "me", q: query });
    } catch (err) {
      console.log(err);
    }
    const latestMessageId = response.data.messages[0].id;
    let message = google.gmail_v1.Schema$Message;
    try {
      message = await gmail.users.messages.get({
        userId: "me",
        id: latestMessageId,
      });
    } catch (err) {
      console.log(err);
    }
    const decodedMessage = Buffer.from(
      message.data.payload.parts[0].body.data,
      "base64"
    ).toString("utf-8");

    const approveLoginRequestIndex = decodedMessage.indexOf(
      "Approve login request"
    );
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urlMatch = decodedMessage.match(urlRegex);
    let approveLoginUrl: string = "";

    if (urlMatch) {
      for (const url of urlMatch) {
        const urlIndex = decodedMessage.indexOf(url);
        if (urlIndex > approveLoginRequestIndex) {
          approveLoginUrl = url;
          break;
        }
      }
    }

    if (approveLoginUrl) {
      return resolve(approveLoginUrl);
    } else {
      return reject("URL not found");
    }
  });
}
