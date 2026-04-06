import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";
import { admin, twoFactor } from "better-auth/plugins";
import { checkDiscordRole } from "./discord";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification
        }
    }),
    
    baseURL: process.env.NEXT_PUBLIC_SITE_URL || "https://www.avrxt.in",

    socialProviders: {
        discord: {
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            // Added scope for role verification
            scope: ["identify", "email", "guilds.members.read"],
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }
    },


    // Session security improvements
    session: {
        expiresIn: 60 * 60 * 1, // 1 hour short-lived session
        updateAge: 60 * 15, // Update session every 15 minutes
        freshAge: 60 * 5, // 5 minutes fresh age
    },

    advanced: {
        cookiePrefix: "avrxt-auth",
    },

    plugins: [
        twoFactor(),
        admin(), // Enabling admin plugin for role based access
    ],

    // @ts-ignore
    user: {
        fields: {
            role: {
                type: "string",
                defaultValue: "user",
            },
            banned: {
                type: "boolean",
                defaultValue: false,
            },
            banReason: {
                type: "string",
            },
        },
    },



    hooks: {
        afterSessionChange: async (session) => {
            // Optional: Re-verify roles on session changes if needed
        }
    },

    callbacks: {
        async beforeLogin(ctx) {
            // Handle banned users
            if (ctx.user.banned) {
                return {
                    status: 403,
                    message: `You are banned: ${ctx.user.banReason || 'No reason specified'}`
                };
            }
        },

        async postSignIn(ctx) {
            // Check Discord Role after successful sign-in
            if (ctx.account.providerId === 'discord') {
                const hasRole = await checkDiscordRole(ctx.account.accountId, ctx.account.accessToken);
                
                if (hasRole) {
                    console.log(`[AUTH] User ${ctx.user.email} verified for admin role.`);
                    // Update user role in database (Neon)
                    await db.update(schema.user)
                        .set({ role: 'admin' })
                        .where(eq(schema.user.id, ctx.user.id));
                } else {
                     // If they were admin but no longer have the role, demote them
                     if (ctx.user.role === 'admin') {
                        await db.update(schema.user)
                            .set({ role: 'user' })
                            .where(eq(schema.user.id, ctx.user.id));
                     }
                }
            }
        }
    }
});


