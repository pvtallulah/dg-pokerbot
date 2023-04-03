import { State, StateMachine } from "@edium/fsm";
import { Page } from "puppeteer";

import { Context } from "../interfaces";
import {
  startPuppeteer,
  loadDecentralGames,
  startPlayingButton,
  loginWithEmailButton,
  fillEmailInput,
  clickContinueEmailButton,
} from "../loginToPoker";
import {
  createOauth2Client,
  validateToken,
  getNewToken,
  setCredentials,
  addToken,
} from "../readEmail";

const context: Context = {
  browser: null,
  page: null,
  code: "",
  oAuth2Client: null,
  token: null,
};

export class PokerbotFSM extends StateMachine {
  // private stateMachine: StateMachine;
  constructor() {
    super("DG-Poker-bot", context);
    this.createStates();
  }

  private createStates() {
    const initialState = this.createState(
      "Start puppeteer",
      false,
      startPuppeteer
    );

    const loadDecentralGamesState = this.createState(
      "Load decentral games",
      false,
      loadDecentralGames
    );

    const startPlayingButtonState = this.createState(
      "Start playing button",
      false,
      startPlayingButton
    );

    const loginWithEmailButtonState = this.createState(
      "Login with email button",
      false,
      loginWithEmailButton
    );

    const fillEmailInputState = this.createState(
      "Fill email input",
      false,
      fillEmailInput
    );

    const clickContinueEmailButtonState = this.createState(
      "Click continue email button",
      false,
      clickContinueEmailButton
    );

    const createOauth2ClientState = this.createState(
      "Create OAuth client",
      false,
      createOauth2Client
    );

    const validateTokenState = this.createState(
      "Validate token",
      false,
      validateToken
    );

    const setCredentialsState = this.createState(
      "Set credentials",
      false,
      setCredentials
    );

    const getNewTokenState = this.createState(
      "Get new token",
      false,
      getNewToken
    );

    const addTokenState = this.createState("Add token", false, addToken);

    const finalState = this.createState("Final state", true);

    initialState.addTransition("loadDecentralgames", loadDecentralGamesState);

    loadDecentralGamesState.addTransition(
      "startPlayingButton",
      startPlayingButtonState
    );

    startPlayingButtonState.addTransition(
      "loginWithEmailButton",
      loginWithEmailButtonState
    );

    loginWithEmailButtonState.addTransition(
      "fillEmailInput",
      fillEmailInputState
    );

    fillEmailInputState.addTransition(
      "clickContinueEmailButton",
      clickContinueEmailButtonState
    );

    clickContinueEmailButtonState.addTransition(
      "createOauth2Client",
      createOauth2ClientState
    );

    createOauth2ClientState.addTransition("validateToken", validateTokenState);

    validateTokenState.addTransition("setCredentials", setCredentialsState);
    validateTokenState.addTransition("getNewToken", getNewTokenState);
    getNewTokenState.addTransition("addToken", addTokenState);
    addTokenState.addTransition("setCredentials", setCredentialsState);
    setCredentialsState.addTransition("finalState", finalState);

    this.start(initialState);
  }
}
