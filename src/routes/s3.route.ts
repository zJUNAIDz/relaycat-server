import "dotenv/config";
import { Context, Hono } from "hono";
import { s3Service } from "../services/S3.service";
import { getEnv } from "../utils/env";

const s3Routes = new Hono();
s3Routes.get("/uploadNewImage", async (c: Context) => {
  const { serverName, fileType } = c.req.query();
  if (!serverName || serverName.trim() === "") {
    return c.json({ error: "serverName is required" }, 400);
  }

  if (!fileType || fileType.trim() === "")
    return c.json({ error: "fileType is required" }, 400);

  const fileExtension = fileType.split("/")[1];
  if (!["png", "jpg", "jpeg", "webp"].includes(fileExtension)) {
    return c.json({ error: "fileType is not supported" }, 400);
  }
  const key = `${serverName}-${crypto.randomUUID()}.${fileExtension}`;
  const bucketName = getEnv("AWS_S3_BUCKET_NAME");
  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME is not defined");
  }

  const { data, error } = await s3Service.getUploadNewImageUrl(key, fileType);
  if (error) return c.json({ error }, 500);
  const signedUrl = data?.signedUrl;
  return c.json({ signedUrl, key, bucketName });
});

export default s3Routes;
