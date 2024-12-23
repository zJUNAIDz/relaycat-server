import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import "dotenv/config";
import { getEnv } from "../utils/env";

interface getSignedUrlResponse {
  data: {
    signedUrl: string | null;
    bucketName: string;
  } | null;
  success: boolean;
  error: {
    message: string;
  } | null;
}

class S3Service {
  private s3Client = new S3Client({
    region: getEnv("AWS_REGION"),
    credentials: {
      accessKeyId: getEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY"),
    },
  });
  private bucketName = getEnv("AWS_S3_BUCKET_NAME");
  private static readonly ALLOWED_FILE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/jpg",
    "image/webp",
  ];
  /**
   * Returns a signed url for uploading a new image
   * @param key  The key of the object
   * @param fileType  The type of the file
   * @returns { data: {signedUrl:string, bucketName:string} | null, error: string | null }
   * @example getUploadNewImageUrl("my-bucket", "my-key", "image/png") => { signedUrl: "https://my-bucket.s3.amazonaws.com/my-key", error: null } || { signedUrl: null, error: "File type not supported" }
   */
  async getUploadNewImageUrl(
    key: string,
    fileType: string
  ): Promise<getSignedUrlResponse> {
    if (!S3Service.ALLOWED_FILE_TYPES.includes(fileType)) {
      return {
        data: null,
        success: false,
        error: {
          message:
            "File type not supported. must be one of these [png, jpeg, gif, jpg, webp] ",
        },
      };
    }
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: fileType,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });
      return {
        data: {
          signedUrl,
          bucketName: this.bucketName,
        },
        success: true,
        error: null,
      };
    } catch (err) {
      console.log(err);
      return {
        data: null,
        success: false,
        error: {
          message: `[s3Service/getUploadImageUrlError] getting signed url: ${err}`,
        },
      };
    }
  }

export const s3Service = new S3Service();
