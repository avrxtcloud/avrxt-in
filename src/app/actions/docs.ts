import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { DocArticle } from '@/lib/docs-config';
import { verifyAdmin } from '@/lib/auth-checks';

// Fetch all docs (Admin view - sees drafts too)
export async function getAdminDocs() {
    const { authorized } = await verifyAdmin();
    if (!authorized) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching docs:', error);
        return [];
    }

    return data as DocArticle[];
}

// Fetch published docs (Public view)
export async function getPublishedDocs() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching published docs:', error);
        return [];
    }

    return data as DocArticle[];
}

export async function getDocBySlug(slug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('slug', slug)
        .single(); // Assuming slug is unique

    if (error) {
        // console.error('Error fetching doc by slug:', error);
        return null;
    }

    return data as DocArticle;
}

export async function createDocAction(doc: Partial<DocArticle>) {
    const { authorized, error: authError } = await verifyAdmin();
    if (!authorized) {
        return { error: `Unauthorized: ${authError}` };
    }

    const supabase = await createClient();

    // Remove ID if present to let Supabase generate UUID
    const { id, ...docData } = doc;

    const { data, error } = await supabase
        .from('documents')
        .insert([{
            ...docData,
            created_at: new Date().toISOString(),
            last_modified: new Date().toISOString()
        }])
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/docs');
    revalidatePath('/docs/admin');
    return { data };
}

export async function updateDocAction(id: string, updates: Partial<DocArticle>) {
    const { authorized, error: authError } = await verifyAdmin();
    if (!authorized) {
        return { error: `Unauthorized: ${authError}` };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('documents')
        .update({
            ...updates,
            last_modified: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/docs');
    revalidatePath('/docs/admin');
    return { data };
}

export async function deleteDocAction(id: string) {
    const { authorized, error: authError } = await verifyAdmin();
    if (!authorized) {
        return { error: `Unauthorized: ${authError}` };
    }

    const supabase = await createClient();
    const { error } = await supabase.from('documents').delete().eq('id', id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/docs');
    revalidatePath('/docs/admin');
    return { success: true };
}
