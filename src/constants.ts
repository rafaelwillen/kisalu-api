import { subYears } from "date-fns";

export const PORT = (process.env.PORT || 3500) as number;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const HTTP_STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  FORBIDDEN: 403,
  PAYLOAD_TOO_LARGE: 413,
  CONFLICT: 409,
};

export const ADULT_DATE_OF_BIRTH = subYears(new Date(), 17);
