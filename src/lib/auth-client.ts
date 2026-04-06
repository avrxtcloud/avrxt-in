import { createAuthClient } from "better-auth/react";
import { adminClient, organizationClient, twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.avrxt.in",
	plugins: [
		adminClient(),
		organizationClient(),
		twoFactorClient(),
	],
});

export const { 
    signIn, 
    signOut, 
    useSession, 
    signUp,
    updateUser,
    listSessions,
    listAccounts,
    twoFactor,
} = authClient;
