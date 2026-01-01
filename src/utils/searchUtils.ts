// FileInfo interface (should match Context.tsx)
interface FileInfo {
  file_name: string;
  file_size: number;
  modification_date: string;
  formatted_size: string;
  file_path: string;
  file_type: string;
}

/**
 * Highlights matching text in a string
 * @param text - The text to search in
 * @param query - The search query
 * @returns Array of text parts with match indicators
 */
export const highlightMatch = (
  text: string,
  query: string
): Array<{ text: string; isMatch: boolean }> => {
  if (!query.trim()) {
    return [{ text, isMatch: false }];
  }

  const parts: Array<{ text: string; isMatch: boolean }> = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let lastIndex = 0;
  let index = lowerText.indexOf(lowerQuery, lastIndex);

  while (index !== -1) {
    // Add non-matching text before the match
    if (index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, index),
        isMatch: false,
      });
    }

    // Add matching text
    parts.push({
      text: text.substring(index, index + query.length),
      isMatch: true,
    });

    lastIndex = index + query.length;
    index = lowerText.indexOf(lowerQuery, lastIndex);
  }

  // Add remaining non-matching text
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      isMatch: false,
    });
  }

  return parts.length > 0 ? parts : [{ text, isMatch: false }];
};

/**
 * Truncates a file path to show only relevant parts
 * @param path - Full file path
 * @param maxLength - Maximum length before truncation
 * @returns Truncated path with ellipsis
 */
export const truncatePath = (path: string, maxLength: number = 60): string => {
  if (path.length <= maxLength) {
    return path;
  }

  // Try to show the end of the path (most relevant)
  const parts = path.split(/[/\\]/);
  if (parts.length <= 2) {
    return `...${path.slice(-maxLength + 3)}`;
  }

  // Show first part and last parts
  const first = parts[0];
  const last = parts.slice(-2).join("/");
  const available = maxLength - first.length - last.length - 5; // 5 for "..."

  if (available > 0) {
    return `${first}/.../${last}`;
  }

  return `.../${last}`;
};

/**
 * Gets the directory path from a full file path
 * @param filePath - Full file path
 * @returns Directory path
 */
export const getDirectoryPath = (filePath: string): string => {
  const lastSlash = Math.max(filePath.lastIndexOf("/"), filePath.lastIndexOf("\\"));
  return lastSlash > 0 ? filePath.substring(0, lastSlash) : "/";
};

/**
 * Formats search results for display
 * @param results - Array of FileInfo results
 * @param query - Search query
 * @returns Formatted results with highlighted matches
 */
export const formatSearchResults = (
  results: FileInfo[],
  query: string
): Array<FileInfo & { highlightedName: Array<{ text: string; isMatch: boolean }>; directoryPath: string }> => {
  return results.map((result) => ({
    ...result,
    highlightedName: highlightMatch(result.file_name, query),
    directoryPath: getDirectoryPath(result.file_path),
  }));
};

/**
 * Sorts search results by relevance
 * @param results - Array of FileInfo results
 * @param query - Search query
 * @returns Sorted results (exact matches first, then substring matches)
 */
export const sortSearchResults = (
  results: FileInfo[],
  query: string
): FileInfo[] => {
  const lowerQuery = query.toLowerCase();
  
  return [...results].sort((a, b) => {
    const aLower = a.file_name.toLowerCase();
    const bLower = b.file_name.toLowerCase();
    
    // Exact match gets highest priority
    if (aLower === lowerQuery && bLower !== lowerQuery) return -1;
    if (bLower === lowerQuery && aLower !== lowerQuery) return 1;
    
    // Starts with query gets second priority
    if (aLower.startsWith(lowerQuery) && !bLower.startsWith(lowerQuery)) return -1;
    if (bLower.startsWith(lowerQuery) && !aLower.startsWith(lowerQuery)) return 1;
    
    // Alphabetical order for same priority
    return aLower.localeCompare(bLower);
  });
};
