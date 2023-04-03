import { getUrl } from "./readEmail";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { State } from "@edium/fsm";

import { Context } from "./interfaces";
import * as constants from "./constants";

export const startPuppeteer = async (
  state: State,
  context: Context
): Promise<void> => {
  try {
    const browser = await puppeteer
      .use(StealthPlugin())
      .launch({ headless: false, ignoreHTTPSErrors: true });
    const page = await browser.newPage();
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
      await context.page.goto("https://app.decentral.games/");
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
      constants.START_PLAYING_SELECTOR
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
        constants.MAIL_IMAGE_SELECTOR
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
        constants.EMAIL_INPUT_SELECTOR
      );
      await emailInputSelector?.type("maikinahara.dg@gmail.com", {
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
      await page.waitForFunction(() =>
        Array.from(document.querySelectorAll("button")).some(
          (button) => button.textContent?.trim() === "Continue"
        )
      );
      await page.evaluate(() => {
        const continueButton = Array.from(
          document.querySelectorAll("button")
        ).find((button) => {
          return button.textContent?.trim() === "Continue";
        });
        continueButton?.click();
      });
      state.trigger("createOauth2Client");
      // const continueEmailButtonSelector = await page.waitForSelector(
      //   constants.CONTINUE_TEXT_SELECTOR
      // );
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error clicking continue email button");
  }
};

export const loginToPoker = async (): Promise<void> => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.evaluate(() => {
    const continueButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Continue"
    );
    continueButton?.click();
  });

  // Wait for 6 seconds
  await page.waitForTimeout(6000);

  // Execute the readEmail script and get the URL
  const urlFromEmail = await getUrl(); // Make sure to call the function with the correct parameters if needed

  // Open the URL in a new tab, wait for 5 seconds, and close it
  const newTab = await browser.newPage();
  await newTab.goto(urlFromEmail);
  await newTab.waitForFunction(() => {
    return new Promise((resolve) => {
      setTimeout(() => resolve("ok"), 5000);
    });
  });
  await newTab.close();
};
