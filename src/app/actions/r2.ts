'use server';

import { uploadFile, deleteFile, getPresignedUploadUrl } from '@/lib/r2';
import { verifyAdmin } from '@/lib/auth-checks';

export async function uploadToR2Action(formData: FormData, oldUrl?: string) {
    const { authorized, error: authError } = await verifyAdmin();
    if (!authorized) {
        return { error: `Unauthorized: ${authError}` };
    }

    const file = formData.get('file') as File;
    if (!file) return { error: 'No file provided' };

    // Organize images in /i and videos in /v as requested
    // Default to 'i', but check for video/audio types
    let folder: 'i' | 'v' = 'i';
    const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|ogg|mov|m4v)$/i);
    const isAudio = file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a|flac)$/i);

    if (isVideo || isAudio) {
        folder = 'v';
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Use a clean, timestamped filename
        const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, '-');
        const fileExt = originalName.split('.').pop();
        const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
        const fileName = `${nameWithoutExt}-${Date.now()}.${fileExt}`;

        const publicUrl = await uploadFile(buffer, fileName, file.type, folder);

        // If there's an old file, delete it FROM R2
        if (oldUrl) {
            await deleteFile(oldUrl);
        }

        return { success: true, publicUrl };
    } catch (error: any) {
        console.error('R2 Upload Action Error:', error);
        return { error: error.message || 'R2_UPLOAD_FAILED' };
    }
}

export async function deleteFromR2Action(url: string) {
    const { authorized, error: authError } = await verifyAdmin();
    if (!authorized) {
        return { error: `Unauthorized: ${authError}` };
    }

    try {
        await deleteFile(url);
        return { success: true };
    } catch (error: any) {
        return { error: error.message || 'DELETE_FAILED' };
    }
}
export async function getPresignedR2UrlAction(fileName: string, fileType: string, oldUrl?: string) {
    const { authorized, error: authError } = await verifyAdmin();
    if (!authorized) {
        return { error: `Unauthorized: ${authError}` };
    }

    // Organize images in /i and videos in /v as requested
    let folder: 'i' | 'v' = 'i';
    const isVideo = fileType.startsWith('video/') || fileName.match(/\.(mp4|webm|ogg|mov|m4v)$/i);
    const isAudio = fileType.startsWith('audio/') || fileName.match(/\.(mp3|wav|ogg|m4a|flac)$/i);

    if (isVideo || isAudio) {
        folder = 'v';
    }

    try {
        // Use a clean, timestamped filename
        const cleanName = fileName.replace(/[^a-zA-Z0-9.]/g, '-');
        const fileExt = cleanName.split('.').pop();
        const nameWithoutExt = cleanName.split('.').slice(0, -1).join('.');
        const finalName = `${nameWithoutExt}-${Date.now()}.${fileExt}`;

        const data = await getPresignedUploadUrl(finalName, fileType, folder);

        // If there's an old file, we can't delete it yet because the upload hasn't happened.
        // We return the oldUrl to the client so it can call delete later, or we handle it here if preferred.
        // For simplicity, we'll let the client call deleteFromR2Action after a successful PUT.

        return { success: true, ...data };
    } catch (error: any) {
        console.error('R2 Presigned URL Action Error:', error);
        return { error: error.message || 'R2_PRESIGNED_FAILED' };
    }
}
