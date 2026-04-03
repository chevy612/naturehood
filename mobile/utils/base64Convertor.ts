import { File, Directory, Paths } from "expo-file-system";

/**
 * Convert a local image URI (e.g. from expo-image-picker) to a raw base64 string.
 * Returns the base64-encoded data WITHOUT the `data:image/...;base64,` prefix.
 */
export async function imageToBase64(imageUri: string): Promise<string> {
  const file = new File(imageUri);
  return await file.base64();
}
