function toHandle(name: string): string {
  return name
    .toLowerCase() // Convert to lowercase
    .replace(/\s+/g, '-') // Replace spaces with hyphen
    .replace(/[^a-z0-9-]/g, '') // Remove any character that is not a-z, 0-9, or hyphen
    .replace(/-+/g, '-'); // Replace multiple hyphens with a single hyphen
}

export default toHandle;
