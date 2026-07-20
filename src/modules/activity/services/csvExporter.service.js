/**
 * Lightweight CSV Streaming Service
 * Safely escapes CSV fields and streams them directly to the response object.
 */

// Helper to escape CSV strings
const escapeCsv = (val) => {
  if (val === null || val === undefined) return "";
  
  let stringVal = typeof val === "object" ? JSON.stringify(val) : String(val);
  
  // Mask sensitive data if it's metadata with passwords or tokens
  if (stringVal.toLowerCase().includes("password") || stringVal.toLowerCase().includes("token")) {
    stringVal = "[REDACTED]";
  }

  // If the string contains double quotes, commas, or newlines, we must wrap it in quotes
  // and escape double quotes by doubling them ("")
  if (/[",\n\r]/.test(stringVal)) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  
  return stringVal;
};

export const streamCsv = async (activities, res) => {
  // Define CSV Headers
  const headers = [
    "Activity ID",
    "Entity Type",
    "Entity ID",
    "Action",
    "Performed By",
    "Performed By Role",
    "Created At",
    "Old Value",
    "New Value",
    "Metadata"
  ];

  // Write headers to stream
  res.write(headers.map(escapeCsv).join(",") + "\n");

  // Write each row to stream
  for (const activity of activities) {
    const row = [
      activity.id,
      activity.entityType,
      activity.entityId,
      activity.action,
      activity.userId,
      activity.performedByRole,
      activity.createdAt ? new Date(activity.createdAt).toISOString() : "",
      activity.oldValue,
      activity.newValue,
      activity.metadata
    ];
    
    res.write(row.map(escapeCsv).join(",") + "\n");
  }

  // End the stream
  res.end();
};
