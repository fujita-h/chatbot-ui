import { InteractionStatus } from "@azure/msal-browser"
import { useIsAuthenticated, useMsal } from "@azure/msal-react"
import { FC } from 'react';
import { loginScopes } from "@/auth.config";

interface Props {}

export const LoginPage: FC<Props> = ({}) => {
  const { instance, inProgress } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  const handleLogin = (loginType: 'popup' | 'redirect' = 'redirect') => {
    if (loginType === 'popup') {
      instance.loginPopup({scopes: loginScopes})
    } else {
      instance.loginRedirect({scopes: loginScopes})
    }
  }

  if (isAuthenticated || inProgress !== InteractionStatus.None) {
    return (<></>)
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
      <div className="w-96 flex flex-col flex-auto justify-center items-center">
        <div className="mb-2 text-center">Welcome to Chatbot UI for Enterprise</div>
        <div className="mb-4 text-center">Log in with your Azure AD account to continue</div>
        <div className="flex flex-row gap-3">
          <button
            className="bg-green-600 hover:bg-green-700 text-white text-sm rounded-md px-3 py-2"
            onClick={async () => { await handleLogin() }}
          >
            <div className="flex w-full items-center justify-center gap-2">Log in</div>
          </button>
          {/** 
           * If you use AzureAD B2C, you can use the following button to sign up 
            <button className="bg-green-600 hover:bg-green-700 text-white text-sm rounded-md px-3 py-2">Sign up</button>
          */}
        </div>
      </div>
    </div>
  );
};
