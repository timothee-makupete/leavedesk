import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    first_name: z.string().trim().min(2, "First name is required").max(50),
    last_name: z.string().trim().min(2, "Last name is required").max(50),
    email: z.string().trim().email("Enter a valid email").max(255),
    phone_number: z.string().trim().min(7, "Enter a valid phone number").max(20),
    department: z.string().trim().min(1, "Select a department"),
    employee_id: z.string().trim().min(1, "Employee ID is required").max(20),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirm: z.string().min(8, "Confirm your password"),
  })
  .refine((v) => v.password === v.password_confirm, {
    path: ["password_confirm"],
    message: "Passwords do not match",
  });
export type RegisterValues = z.infer<typeof registerSchema>;
