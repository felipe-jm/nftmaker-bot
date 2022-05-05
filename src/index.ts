require("dotenv/config");

import fs from "fs";
import axios from "axios";
import { sleep } from "./utils/sleep";

const projectId = "0085565dc4334564bdcbf9b8710e3180";
const count = 1;

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
    console.log("projectId", projectId);
    console.log("count", count);
    console.log("captchaToken", captchaToken);

    const response = await axios.get(
      "https://payment-api.nft-maker.io/api/v1/random/payment/address",
      {
        params: {
          projectId,
          count,
          // includeProtocolParameters: true,
        },
        headers: {
          "C-Type": "hcaptcha",
          "C-Token": captchaToken,
          Origin: "https://payment.nft-maker.io",
          Referer: "https://payment.nft-maker.io/",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15",
        },
      }
    );
    console.log("nftMakerResponseStatus", response.status);
    console.log("nftMakerResponseData", response.data);
    console.log("generateNftMakerAddress", response.data.address);
    return response.data.address;
  } catch (e) {
    console.log("Error: response status", e.response.status);
    console.log("Error: response data", e.response.data);
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
