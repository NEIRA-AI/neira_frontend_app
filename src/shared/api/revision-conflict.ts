import axios from "axios";

export function isRevisionConflict(error: unknown): boolean {
  if (!axios.isAxiosError(error) || error.response?.status !== 409) {
    return false;
  }
  const detail: unknown = error.response.data?.detail;
  return (
    typeof detail === "object" &&
    detail !== null &&
    "code" in detail &&
    detail.code === "revision_conflict"
  );
}
