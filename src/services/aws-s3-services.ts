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

function streamToString(stream: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on("data", (chunk: any) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    stream.on("error", reject);
  });
}

async function readObjectFromS3(keyList: string[]): Promise<jsonData[]> {
  try {
    const response = await Promise.all(
      keyList.map(async (key) => {
        const getObjectParams = {
          Bucket: AWS_S3_BUCKETNAME,
          Key: key,
        };

        const fileData = await s3.getObject(getObjectParams);
        const content = await streamToString(fileData.Body);

        // Parse the JSON content to ensure it's of type `jsonData`
        const parsedContent: jsonData = JSON.parse(content);
        return parsedContent;
      })
    );

    // console.log("Response from readObjectFromS3 = ", response);

    return response;
  } catch (error) {
    console.log("Error while reading object from s3 = ", error);
    throw new ApiError(500, "Error while reading object from s3");
  }
}
async function retrieveFilesFromS3() {
  try {
    const listParams = {
      Bucket: AWS_S3_BUCKETNAME,
    };

    const data = await s3.listObjectsV2(listParams);

    if (!data.Contents || data.Contents.length === 0) {
      throw new ApiError(500, "No files found in S3 bucket");
    }

    const keyList = data.Contents.map((item) => item.Key).filter(
      (key): key is string => !!key
    );

    if (!keyList || keyList.length === 0) {
      throw new ApiError(500, "No keys for the files found in S3 bucket");
    }

    const response = await readObjectFromS3(keyList);

    return response;
  } catch (error) {
    console.log("Error while retrieving files from s3 = ", error);
    throw new ApiError(500, "Error while retrieving files from s3");
  }
}

export { uploadFileToS3, retrieveFilesFromS3 };
