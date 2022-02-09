require("dotenv/config");

import fs from "fs";
import axios from "axios";
import { sleep } from "./utils/sleep";

const projectId = "b4422fa99c934b8eb9e8dadf83341470";
const count = 5;

const captcha2ApiKey = process.env.CAPTCHA2_API_KEY;
const captchaMethod = "hcaptcha";

const pageUrl = `https://payment.nft-maker.io/?p=${projectId}&c=${count}`;

const nftMakerSiteKey = "27dff463-95b2-4c25-868b-b65c74b49a7f";

const requestCaptchaSolution = async (): Promise<number> => {
  const response = await axios.get<string>("https://2captcha.com/in.php", {
    params: {
      key: captcha2ApiKey,
      method: captchaMethod,
      sitekey: nftMakerSiteKey,
      pageurl: pageUrl,
    },
  });

  console.log("requestCaptchaSolution", response.data);

  const actionId = Number(response.data.replace("OK|", ""));

  console.log("Captcha Action ID: ", actionId);

  console.log("Waiting for captcha solution...");

  return actionId;
};

const getCaptchaResponse = async (actionId: number) => {
  const response = await axios.get<string>("https://2captcha.com/res.php", {
    params: {
      key: captcha2ApiKey,
      action: "get",
      id: actionId,
    },
  });

  const catpchaResponse = response.data.replace("OK|", "");

  return catpchaResponse;
};

const generateNftMakerAddress = async (captchaToken: string) => {
  try {
    const response = await axios.get<string>(
      "https://payment-api.nft-maker.io/api/v1/random/payment/address",
      {
        params: {
          projectId,
          count,
          includeProtocolParameters: true,
        },
        headers: {
          "c-token": captchaToken,
          origin: "https://payment.nft-maker.io",
          referer: "https://payment.nft-maker.io/",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36 OPR/83.0.4254.27",
        },
      }
    );
    console.log("generateNftMakerAddress", response.data);
    return response.data;
  } catch (e) {
    return undefined;
  }
};

const getNftMakerAddress = async () => {
  console.log("Starting execution... 🤑💰💸🌝");

  const actionId = await requestCaptchaSolution();

  setTimeout(async () => {
    let captchaResponse = "CAPCHA_NOT_READY";
    let counter = 1;

    while (captchaResponse === "CAPCHA_NOT_READY" && counter < 15) {
      captchaResponse = await getCaptchaResponse(actionId);
      counter++;
      await sleep(3000);
    }

    const nftMakerAddress = await generateNftMakerAddress(captchaResponse);

    console.log("nftMakerAddress", nftMakerAddress);

    if (nftMakerAddress) {
      fs.appendFileSync("addresses.txt", `\n${nftMakerAddress}\n`);
    } else {
      console.log("Failed to generate address");
    }
  }, 15000);
};

getNftMakerAddress();
