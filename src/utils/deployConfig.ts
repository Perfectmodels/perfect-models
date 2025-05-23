
/**
 * Deployment configuration helper
 * This safely accesses package info without modifying package.json
 */
export const getAppVersion = (): string => {
  // Return a hardcoded version to avoid reading from package.json
  return "1.0.0";
};

export const getAppName = (): string => {
  // Return the app name directly
  return "Perfect Models Management";
};
