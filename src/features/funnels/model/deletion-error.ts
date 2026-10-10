import axios from "axios";

export function deletionErrorKey(error: unknown) {
  if (!axios.isAxiosError(error) || error.response?.status !== 409) {
    return "actionError" as const;
  }

  const detail: unknown = error.response.data?.detail;
  if (
    typeof detail === "object" &&
    detail !== null &&
    "code" in detail &&
    detail.code === "open_inquiries"
  ) {
    return "openInquiries" as const;
  }

  return "conflictError" as const;
}
