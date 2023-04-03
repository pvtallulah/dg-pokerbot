import { Page, Browser } from "puppeteer";
import { Auth } from "googleapis";
export interface Context {
  browser: Browser | null;
  page: Page | null;
  code: string;
  oAuth2Client: Auth.OAuth2Client | null;
  token: {
    access_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
    expiry_date: number;
  } | null;
}
