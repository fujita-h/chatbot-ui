import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthenticationResult, EventType, PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from '@/auth.config'

const msalInstance = new PublicClientApplication(msalConfig);
const accounts = msalInstance.getAllAccounts()

if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0])
}

msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS) {
    const payload = event.payload as AuthenticationResult
    if (payload) {
      const account = payload.account
      msalInstance.setActiveAccount(account)
    }
  }
})

const inter = Inter({ subsets: ['latin'] });

function App({ Component, pageProps }: AppProps<{}>) {
  return (
    <MsalProvider instance={msalInstance}>
      <div className={inter.className}>
        <Toaster />
        <Component {...pageProps} />
      </div>
    </MsalProvider>
  );
}

export default appWithTranslation(App);
