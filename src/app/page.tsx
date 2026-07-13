import { redirect } from "next/navigation";

export default function RootPage() {
  // The command centre is the default landing surface.
  redirect("/dashboard");
}
