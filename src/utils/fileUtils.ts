/**
 * Formats a date string into a human-readable format
 * @param dateString - ISO date string or date string
 * @returns Formatted date string or "—" if invalid
 */
export const formatDate = (dateString: string): string => {
  if (!dateString || dateString === "Unknown") return "—";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
};

/**
 * Converts file type string to a human-readable label
 * @param type - File type string (directory, file, symlink, unknown)
 * @returns Human-readable label for the file type
 */
export const getFileTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    directory: "Folder",
    file: "File",
    symlink: "Link",
    unknown: "Unknown",
  };
  return labels[type] || type;
};

/**
 * Calculates the usage percentage of disk space
 * @param used - Used space in bytes
 * @param total - Total space in bytes
 * @returns Usage percentage (0-100)
 */
export const calculateUsagePercentage = (
  used: number,
  total: number
): number => {
  if (total === 0) return 0;
  return Math.round((used / total) * 100);
};

/**
 * Gets the color for disk usage based on percentage
 * @param percentage - Usage percentage (0-100)
 * @returns Hex color code for the usage level
 */
export const getUsageColor = (percentage: number): string => {
  if (percentage >= 90) return "#ef4444"; // Red
  if (percentage >= 75) return "#3b82f6"; // Blue
  if (percentage >= 50) return "#60a5fa"; // Light Blue
  return "#10b981"; // Green
};
