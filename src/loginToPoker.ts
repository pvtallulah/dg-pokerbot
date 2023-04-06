import fs from "fs";
import puppeteer from "puppeteer-extra";
import path from "path";
import { Protocol } from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { State } from "@edium/fsm";

import { Context } from "./interfaces";
import config from "./config/config";
import { delay } from "./utils/util";
import { PrettyConsole } from "./utils/prettyConsole";
const prettyConsole = new PrettyConsole();
const readCookes = async (): Promise<Protocol.Network.Cookie[]> => {
  const hasCookies = fs.existsSync(
    path.join(__dirname, "../public", "cookies.json")
  );
  if (!hasCookies) return [];
  const cookies = fs.readFileSync(
    path.join(__dirname, "../public", "cookies.json"),
    "utf8"
  );
  return JSON.parse(cookies);
};

const saveCookies = async (
  cookies: Protocol.Network.Cookie[]
): Promise<void> => {
  fs.writeFile(
    path.join(__dirname, "../public", "cookies.json"),
    JSON.stringify(cookies),
    (err: any) => {
      if (err) {
        console.error(err);
      }
    }
  );
};

export const startPuppeteer = async (
  state: State,
  context: Context
): Promise<void> => {
  try {
    const browser = await puppeteer
      .use(StealthPlugin())
      .launch({ headless: false, ignoreHTTPSErrors: true });
    const page = await browser.newPage();
    const cookies = await readCookes();
    if (cookies.length) await page.setCookie(...cookies);
    if (page) {
      context.browser = browser;
      context.page = page;
      state.trigger("loadDecentralgames");
    } else {
      throw new Error("Error opening page");
    }
  } catch (error) {
    throw new Error("Error starting puppeteer");
  }
};

export const loadDecentralGames = async (
  state: State,
  context: Context
): Promise<void> => {
  try {
    if (context.page) {
      await context.page.goto(config.pokerPage);
      state.trigger("startPlayingButton");
    } else {
      throw new Error("Error opening page");
    }
  } catch (err) {
    console.log(err);
    throw new Error("Error loading decentral games");
  }
};

// Wait for the "Start Playing" button to show up and click it
export const startPlayingButton = async (
  state: State,
  context: Context
): Promise<void> => {
  try {
    const startPlayingSelector = await context.page?.waitForSelector(
      config.selectors.loginToPoker.startPlayingButton
    );
    await startPlayingSelector?.click();
    state.trigger("loginWithEmailButton");
  } catch (error) {
    console.error(error);
    throw new Error("Error clicking start playing button");
  }
};

// Wait for the image with alt "mail" to show up and click it
export const loginWithEmailButton = async (
  state: State,
  context: Context
): Promise<void> => {
  try {
    const { page } = context;
    if (page) {
      const mailImageSelector = await page.waitForSelector(
        config.selectors.loginToPoker.emailImageButton
      );
      await mailImageSelector?.click();
      state.trigger("fillEmailInput");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error clicking login with email button");
  }
};

// Wait for the email input to show up and fill it with the email address
export const fillEmailInput = async (state: State, context: Context) => {
  try {
    const { page } = context;
    if (page) {
      const emailInputSelector = await page.waitForSelector(
        config.selectors.loginToPoker.emailInput
      );
      await emailInputSelector?.type(config.user.email, {
        delay: 50,
      });
      state.trigger("clickContinueEmailButton");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error filling email input");
  }
};

export const clickContinueEmailButton = async (
  state: State,
  context: Context
) => {
  try {
    const { page } = context;
    if (page) {
      await page.waitForSelector(config.selectors.loginToPoker.continueButton);
      await page.click(config.selectors.loginToPoker.continueButton);
      state.trigger("createOauth2Client");
    }
  } catch (error) {
    prettyConsole.error(error);
    throw new Error("Error clicking continue email button");
  }
};

export const agreeAndPlay = async (state: State, context: Context) => {
  try {
    const { page } = context;
    if (!page) throw new Error("Page not found");
    let buttonToPress: any = null;
    const cookies = await page.cookies();
    saveCookies(cookies);
    await delay(4000);
    try {
      await page.waitForSelector(
        config.selectors.loginToPoker.startPlayingButton,
        {
          visible: true,
          timeout: 2000,
        }
      );
      buttonToPress = config.selectors.loginToPoker.startPlayingButton;
    } catch (error) {
      prettyConsole.info(
        "Start playing button not found, will try to find agree and play button"
      );
    }
    try {
      if (!buttonToPress) {
        await page.waitForSelector(
          config.selectors.loginToPoker.agreeAndPlayButton,
          {
            visible: true,
            timeout: 2000,
          }
        );
        buttonToPress = config.selectors.loginToPoker.agreeAndPlayButton;
      }
    } catch (error) {
      prettyConsole.info("Agree and play button not found");
      throw new Error("Play button and agree button not found");
    }

    if (!buttonToPress) throw new Error("No button found");
    await page.click(buttonToPress);
    try {
      await page.waitForSelector(config.selectors.loginToPoker.step1, {
        visible: true,
        timeout: 60000,
      });
      state.trigger("pokerStep1");
    } catch (error) {
      debugger;
      prettyConsole.assert("Step 1 not found");
      state.trigger("randomizeAvatar");
    }
  } catch (error) {
    debugger;
    prettyConsole.error(error);
    throw new Error("Error clicking agreeAndPlay button: " + error);
  }
};
