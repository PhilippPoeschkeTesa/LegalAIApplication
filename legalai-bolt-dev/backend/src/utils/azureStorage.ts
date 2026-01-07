import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
const containerName = process.env.AZURE_STORAGE_CONTAINER || 'legal-documents';

if (!connectionString) {
  console.warn('AZURE_STORAGE_CONNECTION_STRING is not set. Azure Storage operations will fail until it is provided.');
}

let blobServiceClient: BlobServiceClient | null = null;
let containerClient: ContainerClient | null = null;

function getBlobServiceClient(): BlobServiceClient {
  if (!blobServiceClient) {
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  }
  return blobServiceClient;
}

async function getContainerClient(): Promise<ContainerClient> {
  if (containerClient) return containerClient;
  const client = getBlobServiceClient();
  const c = client.getContainerClient(containerName);
  const exists = await c.exists();
  if (!exists) {
    await c.create();
  }
  containerClient = c;
  return containerClient;
}

export async function uploadBuffer(buffer: Buffer, blobName: string, contentType?: string, directory?: string) {
  if (!connectionString) throw new Error('Azure Storage connection string is not configured');
  const container = await getContainerClient();
  const fullBlobName = directory ? `${directory}/${blobName}` : blobName;
  const blockBlobClient = container.getBlockBlobClient(fullBlobName);
  const options = contentType ? { blobHTTPHeaders: { blobContentType: contentType } } : undefined;
  await blockBlobClient.uploadData(buffer, options);
  return blockBlobClient.url;
}

export default {
  uploadBuffer,
};
