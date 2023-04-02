import { Configuration, ProtocolMode } from "@azure/msal-browser";

// Edit the config object below to add your own credentials
export const AAD_TENANT_ID = "{YOUR_TENANT_ID}";
export const AAD_APP_ID = "{YOUR_APP_ID}";
export const AAD_API_APP_SCOPE = "api://{YOUR_API_APP_ID}/{YOUR_API_SCOPE}";

export const msalConfig: Configuration = {
  auth: {
    protocolMode: ProtocolMode.AAD,
    clientId: `${AAD_APP_ID}`,
    authority: `https://login.microsoftonline.com/${AAD_TENANT_ID}`, // This is the default authority. You can also try "https://login.microsoftonline.com/common"
    redirectUri: "/",
    postLogoutRedirectUri: "/",
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored. "sessionStorage" is more secure, but "localStorage" gives you keep the user logged in after closing the browser.
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  }
};

export const jwksUrl = `https://login.microsoftonline.com/${AAD_TENANT_ID}/discovery/keys`;

export const loginScopes =  ["openid"]

export const apiScopes = ["openid", `${AAD_API_APP_SCOPE}`]
