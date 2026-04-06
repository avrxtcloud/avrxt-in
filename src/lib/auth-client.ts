import { createAuthClient } from "better-auth/react";
import { adminClient, twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_SITE_URL || "https://www.avrxt.in",
	plugins: [
		adminClient(),
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

