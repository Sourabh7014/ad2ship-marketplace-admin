import { redirect } from "next/navigation";

export default function AdminAuthPage() {
  return redirect("/auth/login");
}
