import path from "path";

/**
 * CDN Configuration Utility
 * Handles environment-specific CDN paths and URLs
 */

export const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Get the CDN directory path based on environment
 * - Development: Uses local public/uploads directory
 * - Production: Uses /var/www/cdn on server
 */
export function getCDNDir(): string {
  if (isDevelopment) {
    return path.join(process.cwd(), "public", "uploads");
  }
  return "/var/www/cdn";
}

/**
 * Get the CDN base URL based on environment
 * - Development: Uses Next.js API route /api/cdn/
 * - Production: Uses production CDN domain
 */
export function getCDNBaseUrl(): string {
  if (isDevelopment) {
    // Use localhost or environment variable
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return `${baseUrl}/api/cdn`;
  }
  return "https://raahiauctions.cloud/cdn";
}

/**
 * Generate a full CDN URL for a filename
 * @param filename - The filename to generate URL for
 * @returns Full CDN URL
 */
export function getCDNUrl(filename: string): string {
  const baseUrl = getCDNBaseUrl();
  return `${baseUrl}/${filename}`;
}

/**
 * Get CDN-specific subdirectories
 */
export const CDN_SUBDIRS = {
  properties: "properties",
  communities: "communities",
  notices: "notices",
  instagram: "instagram",
  team: "team",
  partners: "partners",
} as const;

/**
 * Get full path for a CDN subdirectory
 * @param subdir - Subdirectory name
 * @returns Full path to subdirectory
 */
export function getCDNSubdirPath(subdir: keyof typeof CDN_SUBDIRS): string {
  return path.join(getCDNDir(), CDN_SUBDIRS[subdir]);
}
