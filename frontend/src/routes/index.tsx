import { createFileRoute } from "@tanstack/react-router";
import { AppMount } from "../app/AppMount";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Leave Management System" },
      { name: "description", content: "Employee Leave Management System for HR teams" },
    ],
  }),
  component: AppMount,
});
