"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";

import {
  CHECKOUT_NAME_MAX_LENGTH,
  CHECKOUT_NOTE_MAX_LENGTH,
  CHECKOUT_PHONE_MAX_LENGTH,
  createCheckoutSchema,
  type CheckoutValidationMessages,
} from "@/lib/checkout/schema";
import {
  ORDER_TYPES,
  type CheckoutDetails,
  type CheckoutField,
  type OrderType,
} from "@/lib/checkout/types";

export type CheckoutLabels = {
  customerDetails: string;
  detailsDescription: string;
  firstName: string;
  lastName: string;
  phone: string;
  orderType: string;
  dineIn: string;
  pickup: string;
  delivery: string;
  note: string;
  optional: string;
  reviewOrder: string;
  reviewHeading: string;
  reviewDescription: string;
  customer: string;
  items: string;
  unitPrice: string;
  lineTotal: string;
  total: string;
  validation: CheckoutValidationMessages;
};

type CheckoutDraft = {
  firstName: string;
  lastName: string;
  phone: string;
  orderType: OrderType | "";
  note: string;
};

type CheckoutFormProps = {
  labels: CheckoutLabels;
  onValidatedChange: (details: CheckoutDetails | null) => void;
};

const initialDraft: CheckoutDraft = {
  firstName: "",
  lastName: "",
  phone: "",
  orderType: "",
  note: "",
};

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-none border border-brown-900/20 bg-white px-4 py-3 text-base text-brown-900 outline-none transition-colors placeholder:text-brown-700/55 focus:border-caramel-500 focus:ring-2 focus:ring-caramel-400/30 aria-invalid:border-red-700 aria-invalid:ring-1 aria-invalid:ring-red-700";

export function CheckoutForm({ labels, onValidatedChange }: CheckoutFormProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [errors, setErrors] = useState<Partial<Record<CheckoutField, string>>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const schema = useMemo(
    () => createCheckoutSchema(labels.validation),
    [labels.validation],
  );
  const orderTypeLabels: Record<OrderType, string> = {
    "Dine-in": labels.dineIn,
    Pickup: labels.pickup,
    Delivery: labels.delivery,
  };

  function updateField<Field extends keyof CheckoutDraft>(
    field: Field,
    value: CheckoutDraft[Field],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
    onValidatedChange(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = schema.safeParse(draft);

    if (!result.success) {
      const nextErrors: Partial<Record<CheckoutField, string>> = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0];

        if (typeof field === "string" && !(field in nextErrors)) {
          nextErrors[field as CheckoutField] = issue.message;
        }
      }

      setErrors(nextErrors);
      onValidatedChange(null);

      const firstInvalidField = result.error.issues[0]?.path[0];

      if (typeof firstInvalidField === "string") {
        formRef.current
          ?.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)
          ?.focus();
      }

      return;
    }

    setErrors({});
    setDraft((current) => ({
      ...current,
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      phone: result.data.phone,
      note: result.data.note ?? "",
    }));
    onValidatedChange(result.data);
  }

  return (
    <section className="mt-8 border-t border-brown-900/12 pt-8" aria-labelledby="checkout-heading">
      <h3 id="checkout-heading" className="text-xl font-black">
        {labels.customerDetails}
      </h3>
      <p id="checkout-description" className="mt-2 leading-7 text-brown-700">
        {labels.detailsDescription}
      </p>

      <form
        ref={formRef}
        className="mt-6 space-y-5"
        noValidate
        aria-describedby="checkout-description"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <CheckoutTextField
            id="checkout-first-name"
            name="firstName"
            label={labels.firstName}
            value={draft.firstName}
            error={errors.firstName}
            autoComplete="given-name"
            maxLength={CHECKOUT_NAME_MAX_LENGTH}
            onChange={(value) => updateField("firstName", value)}
          />
          <CheckoutTextField
            id="checkout-last-name"
            name="lastName"
            label={labels.lastName}
            value={draft.lastName}
            error={errors.lastName}
            autoComplete="family-name"
            maxLength={CHECKOUT_NAME_MAX_LENGTH}
            onChange={(value) => updateField("lastName", value)}
          />
        </div>

        <CheckoutTextField
          id="checkout-phone"
          name="phone"
          label={labels.phone}
          value={draft.phone}
          error={errors.phone}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={CHECKOUT_PHONE_MAX_LENGTH}
          dir="ltr"
          onChange={(value) => updateField("phone", value)}
        />

        <fieldset
          className="min-w-0"
          aria-invalid={errors.orderType ? "true" : undefined}
          aria-describedby={errors.orderType ? "checkout-order-type-error" : undefined}
        >
          <legend className="font-bold text-brown-900">{labels.orderType}</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {ORDER_TYPES.map((orderType) => (
              <label
                key={orderType}
                className="flex min-h-12 cursor-pointer items-center gap-3 border border-brown-900/20 bg-white px-4 py-3 font-bold text-brown-900 transition-colors has-checked:border-caramel-500 has-checked:bg-cream-100 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-caramel-500"
              >
                <input
                  type="radio"
                  name="orderType"
                  value={orderType}
                  required
                  checked={draft.orderType === orderType}
                  onChange={() => updateField("orderType", orderType)}
                  className="size-5 shrink-0 accent-caramel-500"
                />
                <span>{orderTypeLabels[orderType]}</span>
              </label>
            ))}
          </div>
          {errors.orderType ? (
            <p id="checkout-order-type-error" className="mt-2 text-sm font-bold text-red-700" role="alert">
              {errors.orderType}
            </p>
          ) : null}
        </fieldset>

        <div>
          <label htmlFor="checkout-note" className="font-bold text-brown-900">
            {labels.note}{" "}
            <span className="font-normal text-brown-700">({labels.optional})</span>
          </label>
          <textarea
            id="checkout-note"
            name="note"
            value={draft.note}
            maxLength={CHECKOUT_NOTE_MAX_LENGTH}
            rows={4}
            aria-invalid={errors.note ? "true" : undefined}
            aria-describedby={errors.note ? "checkout-note-error" : undefined}
            onChange={(event) => updateField("note", event.target.value)}
            className={`${fieldClassName} min-h-28 resize-y`}
          />
          {errors.note ? (
            <p id="checkout-note-error" className="mt-2 text-sm font-bold text-red-700" role="alert">
              {errors.note}
            </p>
          ) : null}
        </div>

        <div className="border-t border-brown-900/12 pt-5">
          <button
            type="submit"
            className="min-h-12 w-full bg-brown-900 px-6 py-3 font-black text-cream-50 transition-colors hover:bg-caramel-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500"
          >
            {labels.reviewOrder}
          </button>
        </div>
      </form>
    </section>
  );
}

type CheckoutTextFieldProps = {
  id: string;
  name: "firstName" | "lastName" | "phone";
  label: string;
  value: string;
  error?: string;
  type?: "text" | "tel";
  inputMode?: "text" | "tel";
  autoComplete: string;
  maxLength: number;
  dir?: "ltr";
  onChange: (value: string) => void;
};

function CheckoutTextField({
  id,
  name,
  label,
  value,
  error,
  type = "text",
  inputMode,
  autoComplete,
  maxLength,
  dir,
  onChange,
}: CheckoutTextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="font-bold text-brown-900">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        maxLength={maxLength}
        required
        dir={dir}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`${fieldClassName}${dir === "ltr" ? " text-left" : ""}`}
      />
      {error ? (
        <p id={errorId} className="mt-2 text-sm font-bold text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
