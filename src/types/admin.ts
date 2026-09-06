import type { Timestamp } from "firebase/firestore";

export type AdminRole = "admin";

export type Admin = {
  uid: string;
  email: string;
  displayName?: string;
  role: AdminRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type AdminDocument = Omit<Admin, "uid">;
