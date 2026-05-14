import type { UserModel } from "@/model";
import {
  createMetadataJob,
  type CreateMetadataPayload,
} from "./Jobs/createMetadata.job";
import { InMemoryQueue } from "./Queue";

export const metadataQueueHandler = new InMemoryQueue<
  CreateMetadataPayload,
  UserModel
>(createMetadataJob, { maxRetries: 3, retryDelayMs: 3000 });
