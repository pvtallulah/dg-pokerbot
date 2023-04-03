import fs from "fs";
import path from "path";
// import readline from "readline";
import { Auth, google } from "googleapis";
import { State } from "@edium/fsm";
import * as constants from "./constants";
import { credentialConfig } from "./credentials";
import { Context } from "./interfaces";

const SCOPES: string[] = ["https://www.googleapis.com/auth/gmail.readonly"];
const TOKEN_PATH: string = __dirname + "/token.json";

const saveToken = (token: Auth.Credentials) => {
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) return console.error(err);
    debugger;
    console.log("Token stored to", TOKEN_PATH);
  });
};

export const createOauth2Client = (state: State, context: Context): void => {
  try {
    const { client_secret, client_id, redirect_uris } =
      credentialConfig.maiki.web;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
    context.oAuth2Client = oAuth2Client;
    state.trigger("validateToken");
  } catch (error) {
    console.error(error);
    throw new Error("Error creating oauth2 client: " + error);
  }
};

export const validateToken = (
  state: State,
  context: Context
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { oAuth2Client } = context;
    if (!oAuth2Client) throw new Error("No oAuth2Client found");
    fs.readFile(TOKEN_PATH, async (err, token) => {
      try {
        if (err) {
          console.log("No token found, creating a new one");
          state.trigger("getNewToken");
        } else {
          const activeToken: Auth.Credentials = JSON.parse(token.toString());
          if (
            activeToken?.expiry_date &&
            activeToken.expiry_date < Date.now()
          ) {
            debugger;
            console.log("Token expired, creating a new one");
            state.trigger("getNewToken");
          } else {
            debugger;
            state.trigger("setCredentials");
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  });
};

export const getNewToken = async (
  state: State,
  context: Context
): Promise<void> => {
  const { browser, page, oAuth2Client } = context;
  if (!browser) throw new Error("No browser found");
  if (!page) throw new Error("No page found");
  if (!oAuth2Client) throw new Error("No oAuth2Client found");
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  if (!authUrl) throw new Error("No authUrl found");
  await browser.newPage();
  const pages = await browser.pages();
  const authPage = pages[pages.length - 1];
  await authPage.goto(authUrl);
  console.log(authUrl);
  await authPage.setBypassCSP(true);
  const emailInputSelector = await authPage.waitForSelector(
    constants.GMAIL_EMAIL_INPUT_SELECTOR
  );
  await emailInputSelector?.type("maikinahara.dg@gmail.com", {
    delay: 5,
  });
  const continueEmailPasswordSelector =
    "button.VfPpkd-LgbsSe.VfPpkd-LgbsSe-OWXEXe-k8QpJ.VfPpkd-LgbsSe-OWXEXe-dgl2Hf.nCP5yc.AjY5Oe.DuMIQc.LQeN7.qIypjc.TrZEUc.lw1w4b";
  await authPage.click(continueEmailPasswordSelector);
  // Wait for the password field to load
  await authPage.waitForSelector('input[type="password"]', { visible: true });
  // Fill in the password field and click the "Next" button
  await authPage.type('input[type="password"]', "Maiki9716!");
  await authPage.click(continueEmailPasswordSelector);
  const continueSelectorWarning =
    "button.VfPpkd-LgbsSe.VfPpkd-LgbsSe-OWXEXe-dgl2Hf.ksBjEc.lKxP2d.LQeN7.uRo0Xe.TrZEUc.lw1w4b";
  await authPage.waitForSelector(continueSelectorWarning, {
    visible: true,
    timeout: 10000,
  });
  await authPage.click(continueSelectorWarning);
  const requestAccessButtonSelector = "#submit_approve_access button";
  await authPage.waitForSelector(requestAccessButtonSelector, {
    visible: true,
    timeout: 10000,
  });
  await authPage.click(requestAccessButtonSelector);

  // const securityButtonSelector = "#details-button";
  // await authPage.waitForSelector(securityButtonSelector, {
  //   visible: true,
  //   timeout: 10000,
  // });
  // await authPage.click(securityButtonSelector);

  // const proceedLinkSelector = "#proceed-link";

  // await authPage.waitForSelector(proceedLinkSelector, {
  //   visible: true,
  //   timeout: 10000,
  // });
  // await authPage.click(proceedLinkSelector);
};

export const addToken = (state: State, context: Context): void => {
  try {
    const { oAuth2Client } = context;
    const code = fs.readFileSync(path.join(__dirname, "code.txt"), "utf8");
    if (!oAuth2Client) throw new Error("No oAuth2Client found");
    if (!code) throw new Error("No code found");
    context.code = code;
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      console.log(token);
      if (token) {
        saveToken(token);
      } else {
        throw new Error("No token found");
      }
    });
  } catch (error) {
    console.error(error);
    throw new Error("Error adding token: " + error);
  }
};

export const setCredentials = (state: State, context: Context): void => {
  try {
    const { oAuth2Client, token } = context;
    if (!oAuth2Client) throw new Error("No oAuth2Client found");
    if (!token) throw new Error("No token found");
    oAuth2Client.setCredentials(token);
    state.trigger("finalState");
  } catch (error) {
    console.error(error);
    throw new Error("Error setting credentials: " + error);
  }
};

export const getUrl = (): Promise<string> => {
  return new Promise<string>(async (resolve, reject) => {
    debugger;
    resolve("");
  });
};

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
