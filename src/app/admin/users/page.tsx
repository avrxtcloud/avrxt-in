import { adminGetUsers } from "@/app/actions/admin";
import UsersClient from "./UsersClient";

export const dynamic = 'force-dynamic';

export default async function UsersAdminPage() {
    const users = await adminGetUsers();

    return (
        <UsersClient initialUsers={users} />
    );
}
