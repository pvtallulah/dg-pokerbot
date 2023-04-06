import { ElementHandle } from "puppeteer";
import { State } from "@edium/fsm";
import { Context } from "./interfaces";
import { delay, randomizeAvatarName } from "./utils/util";
import config from "./config/config";
import { PrettyConsole } from "./utils/prettyConsole";

const prettyConsole = new PrettyConsole();

export const randomizeAvatar = async (
  state: State,
  context: Context
): Promise<void> => {
  const { page } = context;
  if (!page) throw new Error("No page found");
  try {
    await page.waitForSelector(
      config.selectors.playPoker.randomizeAvatarButton,
      {
        visible: true,
        timeout: 10000,
      }
    );
    await page.click(config.selectors.playPoker.randomizeAvatarButton, {
      clickCount: 3,
      delay: 2000,
    });
    state.trigger("selectAvatar");
  } catch (error) {
    console.error(error);
    throw new Error("Error randomizing avatar: " + error);
  }
};

export const selectAvatar = async (
  state: State,
  context: Context
): Promise<void> => {
  const { page } = context;
  if (!page) throw new Error("No page found");

  try {
    await page.waitForSelector(config.selectors.playPoker.selectAvatarButton, {
      visible: true,
      timeout: 10000,
    });
    await page.click(config.selectors.playPoker.selectAvatarButton);
    state.trigger("inputAvatarName");
  } catch (error) {
    console.error(error);
    throw new Error("Error selecting avatar: " + error);
  }
};

export const inputAvatarName = async (
  state: State,
  context: Context
): Promise<void> => {
  const { page } = context;
  if (!page) throw new Error("No page found");
  try {
    await page.waitForSelector(config.selectors.playPoker.avatarNameInput, {
      visible: true,
      timeout: 10000,
    });
    await page.click(config.selectors.playPoker.avatarNameInput, {
      clickCount: 3,
    });
    await page.type(
      config.selectors.playPoker.avatarNameInput,
      randomizeAvatarName()
    );
    state.trigger("confirmAvatarName");
  } catch (error) {
    console.error(error);
    throw new Error("Error inputting avatar name: " + error);
  }
};

export const confirmAvatarName = async (
  state: State,
  context: Context
): Promise<void> => {
  try {
    const { page } = context;
    if (!page) throw new Error("No page found");
    await page.waitForSelector(
      config.selectors.playPoker.avatarNameConfirmButton,
      {
        visible: true,
        timeout: 10000,
      }
    );
    await page.click(config.selectors.playPoker.avatarNameConfirmButton);
    try {
      const step1SelectorButton = await page.waitForSelector(
        config.selectors.playPoker.step1,
        {
          visible: true,
          timeout: 5000,
        }
      );
      if (step1SelectorButton) {
        state.trigger("pokerStep1");
      } else {
        throw new Error("Not implemented");
      }
    } catch (error) {}
  } catch (error) {
    console.error(error);
    throw new Error("Error inputting avatar name: " + error);
  }
};

export const pokerStep1 = async (
  state: State,
  context: Context
): Promise<void> => {
  const { page } = context;
  if (!page) throw new Error("No page found");

  try {
    await page.waitForSelector(config.selectors.playPoker.step1, {
      visible: true,
      timeout: 10000,
    });
    await page.click(config.selectors.playPoker.step1);
    // Shine modal
    try {
      await page.waitForSelector(config.selectors.playPoker.whatIsShine, {
        visible: true,
        timeout: 10000,
      });
      state.trigger("whatIsShine");
      return;
    } catch (error) {
      prettyConsole.info("No shine modal, will continue with step 2");
    }
    state.trigger("pokerStep2");
  } catch (error) {
    console.error(error);
    throw new Error("Error pokerStep1: " + error);
  }
};

export const whatIsShine = async (state: State, context: Context) => {
  const { page } = context;
  if (!page) throw new Error("No page found");
  try {
    await page.waitForSelector(config.selectors.playPoker.whatIsShine, {
      visible: true,
      timeout: 200,
    });
    await page.click(config.selectors.playPoker.whatIsShine);
    try {
      await page.waitForSelector(config.selectors.playPoker.checkInFlow, {
        visible: true,
        timeout: 2000,
      });
      state.trigger("checkInFlow");
      return;
    } catch (error) {
      prettyConsole.info("No check in flow, will continue with step 2");
      state.trigger("pokerStep2");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error whatIsShine: " + error);
  }
};

export const checkInFlow = async (state: State, context: Context) => {
  const { page } = context;
  if (!page) throw new Error("No page found");
  try {
    await page.waitForSelector(config.selectors.playPoker.checkInFlow, {
      visible: true,
      timeout: 5000,
    });
    await page.click(config.selectors.playPoker.checkInFlow);
    state.trigger("selectGameMode");
  } catch (error) {
    console.error(error);
    throw new Error("Error checkInFlow: " + error);
  }
};

export const selectGameMode = async (state: State, context: Context) => {
  const { page } = context;
  if (!page) throw new Error("No page found");
  try {
    const buttonSelector =
      "button.CheckInFlow_game_box__fXdGV div.CheckInFlow_name__tGvXW";
    const textToFind = "Turbo";
    let selectedTournamentButton: any = null;
    const gameModeButtons = await page.$$(buttonSelector);
    for (const button of gameModeButtons) {
      const text = await button.evaluate((node) => node.textContent);
      if (text && text === textToFind) {
        selectedTournamentButton = button;
      }
    }
    if (selectedTournamentButton) {
      await selectedTournamentButton.click();
      state.trigger("joinTournament");
    } else {
      throw new Error("No button found for game mode: " + textToFind);
    }
  } catch (error) {
    prettyConsole.error(error);
    throw new Error("Error selectGameMode: " + error);
  }
};

export const joinTournament = async (state: State, context: Context) => {
  try {
    const { page } = context;
    if (!page) throw new Error("No page found");
    await page.waitForSelector(config.selectors.playPoker.joinTournament, {
      visible: true,
      timeout: 1000,
    });
    await page.click(config.selectors.playPoker.joinTournament);
    state.trigger("welcomeToTable");
  } catch (error) {
    prettyConsole.error(error);
    throw new Error("Error joinTournament: " + error);
  }
};

export const welcomeToTable = async (state: State, context: Context) => {
  try {
    const { page } = context;
    if (!page) throw new Error("No page found");
    await page.waitForSelector(config.selectors.playPoker.welcomeToTable, {
      visible: true,
      timeout: 1000,
    });
    await page.click(config.selectors.playPoker.welcomeToTable);
  } catch (error) {
    prettyConsole.error(error);
    // throw new Error("Error welcomeToTable: " + error);
  } finally {
    state.trigger("finalState");
  }
};

export const pokerStep2 = async (
  state: State,
  context: Context
): Promise<void> => {
  const { page } = context;
  if (!page) throw new Error("No page found");

  try {
    const step2Selector = await page.waitForSelector(
      config.selectors.playPoker.step2,
      {
        visible: true,
        timeout: 5000,
      }
    );
    await page.click(config.selectors.playPoker.step2);
    // state.trigger("pokerStep3");
    state.trigger("finalState");
  } catch (error) {
    console.error(error);
    throw new Error("Error pokerStep2 name: " + error);
  }
};
