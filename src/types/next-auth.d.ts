import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "volunteer" | "organizer" | "admin";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "volunteer" | "organizer" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "volunteer" | "organizer" | "admin";
  }
}
