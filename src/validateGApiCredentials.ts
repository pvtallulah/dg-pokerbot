import fs from "fs";
import path from "path";
// import readline from "readline";
import { Auth, google } from "googleapis";
import { State } from "@edium/fsm";
import * as constants from "./constants";
import { credentialConfig } from "./gApi/credentials";
import { Context } from "./interfaces";
import { delay } from "./utils/util";

import config from "./config/config";
const SCOPES: string[] = ["https://www.googleapis.com/auth/gmail.readonly"];
const TOKEN_PATH: string = path.join(__dirname, "gApi", "token.json");

const saveToken = (token: Auth.Credentials) => {
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) return console.error(err);
    console.log("Token stored to", TOKEN_PATH);
  });
  try {
    fs.writeFile(
      path.join(__dirname, "../src/gApi/token.json"),
      JSON.stringify(token),
      (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      }
    );
  } catch (error) {
    console.error(error);
  }
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

export const validateToken = (state: State, context: Context): void => {
  const { oAuth2Client } = context;
  if (!oAuth2Client) throw new Error("No oAuth2Client found");
  fs.readFile(TOKEN_PATH, async (err, token) => {
    try {
      if (err) {
        console.log("No token found, creating a new one");
        state.trigger("getNewToken");
      } else {
        const activeToken: Auth.Credentials = JSON.parse(token.toString());
        if (activeToken?.expiry_date && activeToken.expiry_date < Date.now()) {
          console.log("Token expired, creating a new one");
          state.trigger("getNewToken");
        } else {
          context.token = activeToken;
          state.trigger("setCredentials");
        }
      }
    } catch (error) {
      console.log(error);
      throw new Error("Error validating token: " + error);
    }
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
    access_type: "online",
    scope: SCOPES,
  });
  if (!authUrl) throw new Error("No authUrl found");
  await browser.newPage();
  const pages = await browser.pages();
  const authPage = pages[pages.length - 1];
  await authPage.goto(authUrl);
  await authPage.setBypassCSP(true);
  const emailInputSelector = await authPage.waitForSelector(
    constants.GMAIL_EMAIL_INPUT_SELECTOR
  );
  await emailInputSelector?.type(config.user.email, {
    delay: 5,
  });
  const continueEmailPasswordSelector =
    "button.VfPpkd-LgbsSe.VfPpkd-LgbsSe-OWXEXe-k8QpJ.VfPpkd-LgbsSe-OWXEXe-dgl2Hf.nCP5yc.AjY5Oe.DuMIQc.LQeN7.qIypjc.TrZEUc.lw1w4b";
  await authPage.click(continueEmailPasswordSelector);
  await authPage.waitForSelector('input[type="password"]', { visible: true });
  await authPage.type('input[type="password"]', config.user.emailPassword);
  await authPage.click(continueEmailPasswordSelector);
  await delay(10000);
  const pageContent = await authPage.content();
  if (pageContent.indexOf("Code saved") > -1) {
    await authPage.close();
    state.trigger("addToken");
  } else {
    const continueSelectorWarning =
      "button.VfPpkd-LgbsSe.VfPpkd-LgbsSe-OWXEXe-dgl2Hf.ksBjEc.lKxP2d.LQeN7.uRo0Xe.TrZEUc.lw1w4b";
    let continueSelectorWarningButton: unknown | null = null;
    try {
      continueSelectorWarningButton = await authPage.waitForSelector(
        continueSelectorWarning,
        {
          visible: true,
          timeout: 10000,
        }
      );
    } catch (error) {
      console.log(error);
    }
    if (continueSelectorWarningButton) {
      await page.click(continueSelectorWarning);
    }
    const requestAccessButtonSelector = "#submit_approve_access button";
    await authPage.waitForSelector(requestAccessButtonSelector, {
      visible: true,
      timeout: 10000,
    });
    await authPage.click(requestAccessButtonSelector);
    await delay(5000);
    await authPage.close();
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
  }
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
        context.token = token;
        state.trigger("setCredentials");
      } else {
        throw new Error("No token found");
      }
    });
  } catch (error) {
    console.error(error);
    throw new Error("Error adding token: " + error);
  }
};

export const setCredentials = async (
  state: State,
  context: Context
): Promise<void> => {
  try {
    const { oAuth2Client, token } = context;
    if (!oAuth2Client) throw new Error("No oAuth2Client found");
    if (!token) throw new Error("No token found");
    oAuth2Client.setCredentials(token);
    await delay(15000);
    state.trigger("readEmail");
  } catch (error) {
    console.error(error);
    throw new Error("Error setting credentials: " + error);
  }
};
