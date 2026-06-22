import { z } from "zod";

export const employeeCreateSchema = z.object({
  first_name: z.string().trim().min(2, "First name required"),
  last_name: z.string().trim().min(2, "Last name required"),
  email: z.string().trim().email("Enter a valid email"),
  phone_number: z.string().trim().min(7, "Enter a valid phone"),
  department: z.string().trim().min(1, "Department required"),
  employee_id: z.string().trim().min(1, "Employee ID required"),
  role: z.enum(["EMPLOYEE", "ADMIN"]),
  is_active: z.boolean().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type EmployeeCreateValues = z.infer<typeof employeeCreateSchema>;

export const employeeUpdateSchema = z.object({
  first_name: z.string().trim().min(2, "First name required"),
  last_name: z.string().trim().min(2, "Last name required"),
  phone_number: z.string().trim().min(7, "Enter a valid phone"),
  department: z.string().trim().min(1, "Department required"),
  role: z.enum(["EMPLOYEE", "ADMIN"]),
  is_active: z.boolean().optional(),
  password: z.string().min(8, "Min 8 characters").optional().or(z.literal("")),
});
export type EmployeeUpdateValues = z.infer<typeof employeeUpdateSchema>;
