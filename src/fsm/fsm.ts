import { StateMachine } from "@edium/fsm";

import { Context } from "../interfaces";

import {
  startPuppeteer,
  loadDecentralGames,
  startPlayingButton,
  loginWithEmailButton,
  fillEmailInput,
  clickContinueEmailButton,
  agreeAndPlay,
} from "../loginToPoker";

import {
  createOauth2Client,
  validateToken,
  getNewToken,
  setCredentials,
  addToken,
} from "../validateGApiCredentials";

import { readEmail, authWeb3Auth } from "../readEmail";

import {
  randomizeAvatar,
  selectAvatar,
  inputAvatarName,
  confirmAvatarName,
  pokerStep1,
  pokerStep2,
} from "../playPoker";

const context: Context = {
  browser: null,
  page: null,
  code: "",
  oAuth2Client: null,
  token: null,
  approveLoginUrl: "",
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

    const readEmailState = this.createState("Read Email", false, readEmail);

    const authWeb3AuthState = this.createState(
      "Auth web3 Auth",
      false,
      authWeb3Auth
    );

    const agreeAndPlayState = this.createState(
      "Agree and play",
      false,
      agreeAndPlay
    );

    const randomizeAvatarState = this.createState(
      "Randomize avatar",
      false,
      randomizeAvatar
    );

    const selectAvatarState = this.createState(
      "Select avatar",
      false,
      selectAvatar
    );

    const inputAvatarNameState = this.createState(
      "Input avatar name",
      false,
      inputAvatarName
    );

    const confirmAvatarNameState = this.createState(
      "Confirm avatar name",
      false,
      confirmAvatarName
    );

    const pokerStep1State = this.createState("Poker step 1", false, pokerStep1);

    const pokerStep2State = this.createState("Poker step 2", false, pokerStep2);

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
    setCredentialsState.addTransition("readEmail", readEmailState);
    readEmailState.addTransition("authWeb3Auth", authWeb3AuthState);
    authWeb3AuthState.addTransition("agreeAndPlay", agreeAndPlayState);
    agreeAndPlayState.addTransition("randomizeAvatar", randomizeAvatarState);
    agreeAndPlayState.addTransition("pokerStep1", pokerStep1State);
    randomizeAvatarState.addTransition("selectAvatar", selectAvatarState);
    selectAvatarState.addTransition("inputAvatarName", inputAvatarNameState);
    inputAvatarNameState.addTransition(
      "confirmAvatarName",
      confirmAvatarNameState
    );
    confirmAvatarNameState.addTransition("pokerStep1", pokerStep1State);
    pokerStep1State.addTransition("pokerStep2", pokerStep2State);
    pokerStep2State.addTransition("finalState", finalState);

    this.start(initialState);
  }
}
