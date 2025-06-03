// apps/api/src/storage/storage.service.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Readable } from "stream";

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;

  constructor(private readonly config: ConfigService) {
    this.s3 = new S3Client({
      region: "auto",
      endpoint: this.config.get("R2_ENDPOINT"),
      credentials: {
        accessKeyId: this.config.get("R2_ACCESS_KEY_ID"),
        secretAccessKey: this.config.get("R2_SECRET_ACCESS_KEY"),
      },
    });

    this.bucket = this.config.get("R2_BUCKET_NAME");
  }

  async uploadChapter(chapterId: string, content: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: `${chapterId}.txt`,
      Body: content,
      ContentType: "text/plain",
    });

    await this.s3.send(command);
    return `${chapterId}.txt`;
  }

  async getChapter(chapterId: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: `${chapterId}.txt`,
    });

    const response = await this.s3.send(command);
    const stream = response.Body as Readable;

    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }

    return Buffer.concat(chunks).toString("utf-8");
  }

  async deleteChapter(chapterId: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: `${chapterId}.txt`,
    });

    await this.s3.send(command);
  }
}
