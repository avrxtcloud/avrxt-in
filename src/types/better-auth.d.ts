import { auth } from "@/lib/auth";

declare module "better-auth" {
    interface User {
        role: string;
        banned: boolean | null;
        banReason: string | null;
    }
}
