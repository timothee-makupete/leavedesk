import { createFileRoute } from "@tanstack/react-router";
import { AppMount } from "../app/AppMount";

export const Route = createFileRoute("/$")({
  component: AppMount,
});
