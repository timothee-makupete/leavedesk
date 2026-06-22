import { z } from "zod";
import { LEAVE_TYPES } from "../api/types";

export const leaveSchema = z
  .object({
    leave_type: z.enum(LEAVE_TYPES),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    reason: z.string().trim().min(10, "Provide a brief reason (10+ chars)").max(500),
  })
  .refine((v) => new Date(v.end_date) >= new Date(v.start_date), {
    path: ["end_date"],
    message: "End date must be on or after start date",
  })
  .refine(
    (v) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(v.start_date) >= today;
    },
    { path: ["start_date"], message: "Start date cannot be in the past" },
  );
export type LeaveValues = z.infer<typeof leaveSchema>;
