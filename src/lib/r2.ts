import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT?.replace(/\/$/, ""), // Remove trailing slash if exists
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
});

export async function uploadFile(buffer: Buffer, fileName: string, contentType: string, folder: 'i' | 'v') {
    const bucketName = process.env.R2_BUCKET_NAME!;
    const key = `${folder}/${fileName}`;

    await r2.send(
        new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        })
    );

    const domain = folder === 'i' ? process.env.NEXT_PUBLIC_R2_IMAGE_DOMAIN : process.env.NEXT_PUBLIC_R2_VIDEO_DOMAIN;
    return `https://${domain}/${folder}/${fileName}`;
}

export async function getPresignedUploadUrl(fileName: string, contentType: string, folder: 'i' | 'v') {
    const bucketName = process.env.R2_BUCKET_NAME!;
    const key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
    });

    // Valid for 1 hour
    const url = await getSignedUrl(r2, command, { expiresIn: 3600 });

    const domain = folder === 'i' ? process.env.NEXT_PUBLIC_R2_IMAGE_DOMAIN : process.env.NEXT_PUBLIC_R2_VIDEO_DOMAIN;
    const publicUrl = `https://${domain}/${folder}/${fileName}`;

    return { uploadUrl: url, publicUrl, key };
}

export async function deleteFile(url: string) {
    const bucketName = process.env.R2_BUCKET_NAME!;

    // Extract key from URL
    // Domains: i.cdn.avrxt.in or v.cdn.avrxt.in
    let folder = '';
    if (url.includes(process.env.NEXT_PUBLIC_R2_IMAGE_DOMAIN!)) folder = 'i';
    else if (url.includes(process.env.NEXT_PUBLIC_R2_VIDEO_DOMAIN!)) folder = 'v';
    else return; // Not an R2 URL we manage

    const fileName = url.split('/').pop();
    if (!fileName) return;

    const key = `${folder}/${fileName}`;

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
