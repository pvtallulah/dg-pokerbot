import { State, StateMachine } from "@edium/fsm";
import { Page } from "puppeteer";

import {
  startPuppeteer,
  loadDecentralGames,
  startPlayingButton,
  loginWithEmailButton,
  fillEmailInput,
  clickContinueEmailButton,
} from "../loginToPoker";
import { Context } from "../interfaces";

const context: Context = {
  randomize: () => {
    return Math.floor(Math.random() * 2);
  },
  page: null,
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

    clickContinueEmailButtonState.addTransition("final", finalState);

    this.start(initialState);
  }
}
