"use client";

import {
  inMemoryPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { auth } from "@/lib/firebase/client";
import { adminLoginSchema } from "@/lib/validations/auth";

const GENERIC_LOGIN_ERROR = "Unable to sign in. Check your credentials and try again.";
const UNAUTHORIZED_ERROR = "You are not authorized to access the admin panel.";
const RATE_LIMIT_ERROR = "Too many attempts. Please wait a few minutes and try again.";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const result = adminLoginSchema.safeParse({ email, password });

    if (!result.success) {
      setErrorMessage(result.error.issues[0]?.message ?? GENERIC_LOGIN_ERROR);
      return;
    }

    setIsSubmitting(true);

    try {
      await setPersistence(auth, inMemoryPersistence);
      const credential = await signInWithEmailAndPassword(
        auth,
        result.data.email,
        result.data.password,
      );
      const idToken = await credential.user.getIdToken(true);
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ idToken }),
      });

      await signOut(auth);

      if (!response.ok) {
        if (response.status === 429) {
          setErrorMessage(RATE_LIMIT_ERROR);
        } else if (response.status === 403) {
          setErrorMessage(UNAUTHORIZED_ERROR);
        } else {
          setErrorMessage(GENERIC_LOGIN_ERROR);
        }

        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      await signOut(auth).catch(() => undefined);
      setErrorMessage(GENERIC_LOGIN_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-bold text-brown-900">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
          className="min-h-12 w-full rounded-2xl border border-brown-900/15 bg-white px-4 text-left text-charcoal-950 outline-none transition focus:border-caramel-500 focus:ring-4 focus:ring-caramel-400/15 disabled:cursor-not-allowed disabled:opacity-60"
          dir="ltr"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-bold text-brown-900">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
          className="min-h-12 w-full rounded-2xl border border-brown-900/15 bg-white px-4 text-left text-charcoal-950 outline-none transition focus:border-caramel-500 focus:ring-4 focus:ring-caramel-400/15 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      {errorMessage ? (
        <p role="alert" aria-live="polite" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-12 w-full rounded-2xl bg-brown-900 px-5 font-bold text-cream-50 shadow-lg shadow-brown-900/15 transition hover:bg-charcoal-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
