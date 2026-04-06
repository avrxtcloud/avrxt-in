import { createClient } from "@/utils/supabase/server";
import SettingsClient from "./SettingsClient";

export const dynamic = 'force-dynamic';

export default async function SettingsAdminPage() {
    const supabase = await createClient();
    const { data: rawSettings } = await supabase.from('system_settings').select('*');

    const settings = (rawSettings || []).map(s => ({
        key: s.key,
        value: s.value,
        updatedBy: s.updated_by,
        updatedAt: s.updated_at
    }));

    return (
        <SettingsClient initialSettings={settings} />
    );
}

