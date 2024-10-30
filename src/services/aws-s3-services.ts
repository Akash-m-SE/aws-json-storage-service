import { S3 } from "@aws-sdk/client-s3";
import { generateUniqueName } from "./generateUniqueName";
import { ApiError } from "../utils/ApiError";
import dotenv from "dotenv";
import { jsonData, S3ResponseData } from "../types/types";
dotenv.config();

const AWS_S3_REGION = process.env.AWS_S3_REGION as string;
const AWS_S3_BUCKETNAME = process.env.AWS_S3_BUCKETNAME as string;
const AWS_S3_ACCESSKEYID = process.env.AWS_S3_ACCESSKEYID as string;
const AWS_S3_SECRETACCESSKEY = process.env.AWS_S3_SECRETACCESSKEY as string;

const s3 = new S3({
  region: AWS_S3_REGION,
  credentials: {
    accessKeyId: AWS_S3_ACCESSKEYID,
    secretAccessKey: AWS_S3_SECRETACCESSKEY,
  },
});

async function uploadFileToS3(data: jsonData) {
  try {
    const fileName = generateUniqueName();

    const uploadParams = {
      Bucket: AWS_S3_BUCKETNAME,
      Key: fileName,
      Body: JSON.stringify(data),
      ContentType: "application/json",
    };

    const result = await s3.putObject(uploadParams);

    if (!result.ETag) {
      throw new ApiError(500, "No ETag received from S3");
    }

    const e_tag = result.ETag.replace(/"/g, "");
    const url = `https://${AWS_S3_BUCKETNAME}.s3.${AWS_S3_REGION}.amazonaws.com/${fileName}`;

    const response: S3ResponseData = {
      e_tag,
      url,
    };

    return response;
  } catch (error: any) {
    console.log("Error while uploading file to s3 = ", error);
    throw new ApiError(500, "Error while uploading file to s3");
  }
}

export { uploadFileToS3 };
