type DatabaseError = { code?: string; message?: string };

export function travelSaveError(error: DatabaseError): string {
  if (error.code === "23505") return "That record already exists. Use a unique package slug.";
  if (
    (error.code === "42703" || error.code === "PGRST204") &&
    error.message?.includes("flight_options")
  )
    return "Flight options are not enabled in the database yet. Apply the travel flight-options migration, then retry saving.";
  if (error.code === "42501" || error.code === "PGRST301")
    return "Your session cannot save this listing. Sign in again with an administrator account.";
  if (error.code === "23514")
    return "The database rejected the package settings. Check the price presentation, adult price and price basis.";
  if (error.code === "P0001" && error.message) return error.message;
  return "Could not save changes. Please try again.";
}
