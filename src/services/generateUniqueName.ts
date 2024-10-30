export function generateUniqueName() {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const fileName = `file${timestamp}_${randomString}.json`;
  return fileName;
}
