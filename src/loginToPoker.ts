import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { State } from "@edium/fsm";

import { Context } from "./interfaces";
import config from "./config/config";

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
      await page.waitForFunction(() =>
        Array.from(document.querySelectorAll("button")).some(
          (button) =>
            button.textContent?.trim() ===
            config.selectors.loginToPoker.continueButton
        )
      );
      await page.evaluate(() => {
        const continueButton = Array.from(
          document.querySelectorAll("button")
        ).find((button) => {
          return (
            button.textContent?.trim() ===
            config.selectors.loginToPoker.continueButton
          );
        });
        continueButton?.click();
      });
      state.trigger("createOauth2Client");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error clicking continue email button");
  }
};

export const agreeAndPlay = async (state: State, context: Context) => {
  try {
    const { page } = context;
    if (!page) throw new Error("Page not found");
    let startPlayingButton: any = null;
    let agreeAndPlayButton: any = null;
    let buttonToPress: any = null;
    try {
      startPlayingButton = await page.waitForSelector(
        config.selectors.loginToPoker.startPlayingButton,
        {
          visible: true,
          timeout: 60000,
        }
      );
      buttonToPress = config.selectors.loginToPoker.startPlayingButton;
    } catch (error) {
      console.log(
        "Start playing button not found, will try to find agree and play button"
      );
    }
    try {
      if (!startPlayingButton) {
        agreeAndPlayButton = await page.waitForSelector(
          config.selectors.loginToPoker.agreeAndPlayButton,
          {
            visible: true,
            timeout: 60000,
          }
        );
      }
      buttonToPress = config.selectors.loginToPoker.agreeAndPlayButton;
    } catch (error) {
      debugger;
      console.log("Agree and play button not found");
      throw new Error("Play button and agree button not found");
    }

    if (!buttonToPress) throw new Error("No button found");
    await page.click(buttonToPress);
    try {
      const step1SelectorButton = await page.waitForSelector(
        config.selectors.loginToPoker.step1,
        {
          visible: true,
          timeout: 5000,
        }
      );
      if (step1SelectorButton) state.trigger("pokerStep1");
      else state.trigger("randomizeAvatar");
    } catch (error) {
      state.trigger("randomizeAvatar");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error clicking continue email button");
  }
};
