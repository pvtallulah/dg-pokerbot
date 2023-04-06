import dotenv from "dotenv";

dotenv.config();

const {
  EMAIL,
  EMAIL_PASSWORD,
  POKER_PAGE,
  EMAIL_IMAGE_SELECTOR,
  EMAIL_INPUT_SELECTOR,
  GMAIL_EMAIL_INPUT_SELECTOR,
  CONTINUE_BUTTON_SELECTOR,
  AGREE_AND_PLAY_SELECTOR,
  START_PLAYING_SELECTOR,
  STEP1_SELECTOR,
  RANDOMIZE_AVATAR_SELECTOR,
  SELECT_AVATAR_SELECTOR,
  AVATAR_NAME_INPUT_SELECTOR,
  AVATAR_NAME_CONFIRM_SELECTOR,
  STEP2_SELECTOR,
  WHAT_IS_SHINE_SELECTOR,
  CHECK_IN_FLOW_SELECTOR,
  SELECT_GAME_MODE_SELECTOR,
  JOIN_TOURNAMENT_SELECTOR,
  WELCOME_TO_TABLE_SELECTOR,
} = process.env;

export default {
  user: {
    email: EMAIL || "",
    emailPassword: EMAIL_PASSWORD || "",
  },
  pokerPage: POKER_PAGE || "",
  selectors: {
    loginToPoker: {
      emailImageButton: EMAIL_IMAGE_SELECTOR || "",
      emailInput: EMAIL_INPUT_SELECTOR || "",
      continueButton: CONTINUE_BUTTON_SELECTOR || "",
      fillGmailEmailInput: GMAIL_EMAIL_INPUT_SELECTOR || "",
      agreeAndPlayButton: AGREE_AND_PLAY_SELECTOR || "",
      startPlayingButton: START_PLAYING_SELECTOR || "",
      step1: STEP1_SELECTOR || "",
    },
    playPoker: {
      step1: STEP1_SELECTOR || "",
      whatIsShine: WHAT_IS_SHINE_SELECTOR || "",
      randomizeAvatarButton: RANDOMIZE_AVATAR_SELECTOR || "",
      selectAvatarButton: SELECT_AVATAR_SELECTOR || "",
      avatarNameInput: AVATAR_NAME_INPUT_SELECTOR || "",
      avatarNameConfirmButton: AVATAR_NAME_CONFIRM_SELECTOR || "",
      step2: STEP2_SELECTOR || "",
      checkInFlow: CHECK_IN_FLOW_SELECTOR || "",
      selectGameMode: SELECT_GAME_MODE_SELECTOR || "",
      joinTournament: JOIN_TOURNAMENT_SELECTOR || "",
      welcomeToTable: WELCOME_TO_TABLE_SELECTOR || "",
    },
  },
};
