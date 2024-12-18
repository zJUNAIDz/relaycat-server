import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import "dotenv/config";

interface getSignedUrlResponse {
  signedUrl: string | null;
  error: string | null;
}

class S3Service {
  private s3Client = new S3Client({
    region:
      process.env.AWS_REGION ??
      (() => {
        throw new Error("AWS_REGION is not defined");
      })(),
    credentials: {
      accessKeyId:
        process.env.AWS_ACCESS_KEY_ID ??
        (() => {
          throw new Error("AWS_ACCESS_KEY_ID is not defined");
        })(),
      secretAccessKey:
        process.env.AWS_SECRET_ACCESS_KEY ??
        (() => {
          throw new Error("AWS_SECRET_ACCESS_KEY is not defined");
        })(),
    },
  });

  async getUploadNewImageUrl(
    bucketName: string,
    key: string,
    fileType: string
  ): Promise<getSignedUrlResponse> {
    const allowedFileType = [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/jpg",
      "image/webp",
    ];
    if (!allowedFileType.includes(fileType)) {
      return { signedUrl: null, error: "File type not supported" };
    }
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: fileType,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });
      return { signedUrl, error: null };
    } catch (err) {
      console.log(err);
      return { signedUrl: null, error: "Error getting signed url" };
    }
  }
}

export const s3Service = new S3Service();
