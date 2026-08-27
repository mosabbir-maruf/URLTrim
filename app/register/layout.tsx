import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create your URLTrim account.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
