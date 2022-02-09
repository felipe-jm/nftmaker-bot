import express from "express";
import axios from "axios";

const projectId = "b4422fa99c934b8eb9e8dadf83341470";
const count = 5;

const captcha2ApiKey = process.env.CAPTCHA2_API_KEY;
const captchaMethod = "hcaptcha";

const pageUrl = `https://payment.nft-maker.io/?p=${projectId}&c=${count}`;

const nftMakerSiteKey = "27dff463-95b2-4c25-868b-b65c74b49a7f";

const app = express();
const port = 3333;

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

  console.log(actionId);

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

  console.log("getCaptchaResponse", response.data);

  const catpchaResponse = Number(response.data.replace("OK|", ""));

  console.log("catpchaResponse", catpchaResponse);

  return response.data;
};

const generateNftMakerAddress = async () => {
  const response = await axios.get<string>(
    "https://payment-api.nft-maker.io/api/v1/random/payment/address",
    {
      params: {
        projectId,
        count,
        includeProtocolParameters: true,
      },
    }
  );

  console.log("generateNftMakerAddress", response.data);

  return response.data;
};

const getNftMakerAddress = async () => {
  const actionId = await requestCaptchaSolution();

  setTimeout(async () => {
    const captchaResponse = await getCaptchaResponse(actionId);

    console.log("Captcha Response: ", captchaResponse);

    const nftMakerAddress = await generateNftMakerAddress();

    console.log("nftMakerAddress", nftMakerAddress);
  }, 15000);
};

app.listen(port, async () => {
  console.log("Starting execution... 🤑💰💸🌝");

  getNftMakerAddress();
});
