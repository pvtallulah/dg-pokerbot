import { Page, Browser } from "puppeteer";
import { Auth } from "googleapis";
export interface Context {
  browser: Browser | null;
  page: Page | null;
  code: string;
  oAuth2Client: Auth.OAuth2Client | null;
  token: Auth.Credentials | null;
  approveLoginUrl: string;
}
