"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { auth } from "@/lib/firebase/client";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogout() {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await signOut(auth).catch(() => undefined);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        setErrorMessage("Unable to sign out. Please try again.");
        return;
      }

      router.replace("/admin/login");
      router.refresh();
    } catch {
      setErrorMessage("Unable to sign out. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isSubmitting}
        className="rounded-full border border-brown-900/15 bg-white px-4 py-2 text-sm font-bold text-brown-900 transition hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing out…" : "Sign out"}
      </button>
      {errorMessage ? (
        <p role="alert" className="text-xs text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
