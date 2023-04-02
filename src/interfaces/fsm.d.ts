import { Page } from "puppeteer";

export interface Context {
  page: Page | null;
  randomize: () => number;
}
