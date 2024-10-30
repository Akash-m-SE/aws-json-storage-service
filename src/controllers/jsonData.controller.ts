import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { jsonDataSchema } from "../schemas/jsonData.schema";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { uploadFileToS3 } from "../services/aws-s3-services";
import { S3ResponseData } from "../types/types";

const storeJson = asyncHandler(async (req: Request, res: Response) => {
  const data = await req.body;
  const parsedData = jsonDataSchema.safeParse(data);
  if (!parsedData.success) throw new ApiError(400, "Parsing data failed");

  const uploadJson: S3ResponseData = await uploadFileToS3(parsedData.data);

  return res.status(200).json(new ApiResponse(200, uploadJson, "Success"));
});

const retrieveJson = async (req: Request, res: Response) => {
  try {
  } catch (error) {}
};

export { storeJson, retrieveJson };
