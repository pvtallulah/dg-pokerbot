import { Target } from "puppeteer";
import { google } from "googleapis";
import { Context } from "./interfaces/fsm";
import { State } from "@edium/fsm";
import { delay } from "./utils/util";
import { PrettyConsole } from "./utils/prettyConsole";
const prettyConsole = new PrettyConsole();

export const readEmail = async (
  state: State,
  context: Context
): Promise<void> => {
  const { oAuth2Client } = context;
  if (!oAuth2Client) throw new Error("No oAuth2Client found");
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  const query = "from:web3auth is:unread";
  let response: any = null;
  try {
    response = await gmail.users.messages.list({ userId: "me", q: query });
  } catch (err) {
    console.log(err);
  }
  const latestMessageId = response.data.messages[0].id;
  let message: any = "";
  console.log("latestMessageId", latestMessageId);
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
  context.approveLoginUrl = approveLoginUrl;
  state.trigger("authWeb3Auth");
};

export const authWeb3Auth = async (
  state: State,
  context: Context
): Promise<void> => {
  const { browser, approveLoginUrl } = context;
  if (!browser) throw new Error("No browser found");
  if (!approveLoginUrl) throw new Error("No approveLoginUrl found");
  const newTab = await browser.newPage();
  await newTab.goto(approveLoginUrl);
  await delay(2000);
  await newTab.close();
  const targets: Target[] | undefined = context.browser?.targets();
  let foundWeb3AuthTargets: Target[] = [];
  if (targets && targets.length) {
    targets.forEach((target) => {
      if (target.url().includes("https://cyan.openlogin.com/"))
        foundWeb3AuthTargets.push(target);
    });
  }
  if (foundWeb3AuthTargets.length) {
    for (const target of foundWeb3AuthTargets) {
      const type = target.type();
      if (type === "page" || type === "background_page") {
        const page = await target.page();
        if (page) {
          try {
            const maybeNextTimeButton = await page.waitForSelector(
              '[aria-label="Maybe next time"]',
              {
                visible: true,
                timeout: 60000,
              }
            );
            if (maybeNextTimeButton) {
              await maybeNextTimeButton.click();
            }
          } catch (error) {
            prettyConsole.error(error);
          }
        } else {
          console.log("No page found");
        }
      }
    }
    state.trigger("agreeAndPlay");
  }
};
