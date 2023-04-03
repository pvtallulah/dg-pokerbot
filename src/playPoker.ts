import { State } from "@edium/fsm";
import { Context } from "./interfaces";
import { delay, randomizeAvatarName } from "./utils/util";
import config from "./config/config";

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
    state.trigger("pokerStep2");
  } catch (error) {
    console.error(error);
    throw new Error("Error inputting avatar name: " + error);
  }
};

// step2 selector button.CheckInFlow_buy_button__etTUQ

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
    throw new Error("Error inputting avatar name: " + error);
  }
};
