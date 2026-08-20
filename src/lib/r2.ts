import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const DEFAULT_CDN_URL = "https://cdn.avxt.qzz.io";

function requireEnv(name: string) {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`Missing required R2 configuration: ${name}`);
    return value;
}

function getCdnBaseUrl(folder: 'i' | 'v') {
    const configured = folder === 'i'
        ? process.env.NEXT_PUBLIC_R2_IMAGE_DOMAIN
        : process.env.NEXT_PUBLIC_R2_VIDEO_DOMAIN;
    const value = configured?.trim() || process.env.NEXT_PUBLIC_R2_DOMAIN?.trim() || DEFAULT_CDN_URL;
    return (/^https?:\/\//i.test(value) ? value : `https://${value}`).replace(/\/$/, "");
}

const r2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT?.replace(/\/$/, ""), // Remove trailing slash if exists
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
});

export async function uploadFile(buffer: Buffer, fileName: string, contentType: string, folder: 'i' | 'v') {
    const bucketName = requireEnv('R2_BUCKET_NAME');
    const key = `${folder}/${fileName}`;

    await r2.send(
        new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        })
    );

    return `${getCdnBaseUrl(folder)}/${folder}/${encodeURIComponent(fileName)}`;
}

export async function getPresignedUploadUrl(fileName: string, contentType: string, folder: 'i' | 'v') {
    const bucketName = requireEnv('R2_BUCKET_NAME');
    const key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
    });

    // Valid for 1 hour
    const url = await getSignedUrl(r2, command, { expiresIn: 3600 });

    const publicUrl = `${getCdnBaseUrl(folder)}/${folder}/${encodeURIComponent(fileName)}`;

    return { uploadUrl: url, publicUrl, key };
}

export async function deleteFile(url: string) {
    const bucketName = requireEnv('R2_BUCKET_NAME');

    // Extract key from URL
    const parsed = new URL(url);
    const allowedHosts = new Set([getCdnBaseUrl('i'), getCdnBaseUrl('v')].map(value => new URL(value).host));
    if (!allowedHosts.has(parsed.host)) return;

    const key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
    if (!/^[iv]\/.+/.test(key)) return;

    try {
        await r2.send(
            new DeleteObjectCommand({
                Bucket: bucketName,
                Key: key,
            })
        );
    } catch (error) {
        console.error("Error deleting file from R2:", error);
    }
}
