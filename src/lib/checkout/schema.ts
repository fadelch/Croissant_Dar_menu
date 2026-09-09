import { z } from "zod";

import { ORDER_TYPES, type CheckoutDetails } from "@/lib/checkout/types";

export const CHECKOUT_NAME_MAX_LENGTH = 80;
export const CHECKOUT_PHONE_MAX_LENGTH = 30;
export const CHECKOUT_DELIVERY_LOCATION_MAX_LENGTH = 200;
export const CHECKOUT_NOTE_MAX_LENGTH = 500;

const PHONE_CHARACTERS = /^[0-9+\-\s]+$/;
const PHONE_DIGIT_MIN_LENGTH = 6;
const PHONE_DIGIT_MAX_LENGTH = 20;

export type CheckoutValidationMessages = {
  firstNameRequired: string;
  firstNameTooLong: string;
  lastNameRequired: string;
  lastNameTooLong: string;
  phoneRequired: string;
  phoneInvalid: string;
  orderTypeRequired: string;
  deliveryLocationRequired: string;
  deliveryLocationTooLong: string;
  noteTooLong: string;
};

function isPracticalPhoneNumber(value: string): boolean {
  if (
    !PHONE_CHARACTERS.test(value) ||
    !/^(?:\+\s*)?\d/.test(value) ||
    !/\d$/.test(value)
  ) {
    return false;
  }

  const plusCount = value.match(/\+/g)?.length ?? 0;

  if (plusCount > 1 || (plusCount === 1 && !value.startsWith("+"))) {
    return false;
  }

  const digitCount = value.replace(/\D/g, "").length;
  return digitCount >= PHONE_DIGIT_MIN_LENGTH && digitCount <= PHONE_DIGIT_MAX_LENGTH;
}

export function createCheckoutSchema(messages: CheckoutValidationMessages) {
  return z.strictObject({
    firstName: z
      .string()
      .trim()
      .min(1, messages.firstNameRequired)
      .max(CHECKOUT_NAME_MAX_LENGTH, messages.firstNameTooLong),
    lastName: z
      .string()
      .trim()
      .min(1, messages.lastNameRequired)
      .max(CHECKOUT_NAME_MAX_LENGTH, messages.lastNameTooLong),
    phone: z
      .string()
      .trim()
      .min(1, messages.phoneRequired)
      .max(CHECKOUT_PHONE_MAX_LENGTH, messages.phoneInvalid)
      .refine(isPracticalPhoneNumber, messages.phoneInvalid),
    orderType: z.enum(ORDER_TYPES, { error: messages.orderTypeRequired }),
    deliveryLocation: z
      .string()
      .trim()
      .max(
        CHECKOUT_DELIVERY_LOCATION_MAX_LENGTH,
        messages.deliveryLocationTooLong,
      )
      .transform((value) => value || undefined),
    note: z
      .string()
      .trim()
      .max(CHECKOUT_NOTE_MAX_LENGTH, messages.noteTooLong)
      .transform((value) => value || undefined),
  })
    .superRefine((details, context) => {
      if (details.orderType === "Delivery" && !details.deliveryLocation) {
        context.addIssue({
          code: "custom",
          path: ["deliveryLocation"],
          message: messages.deliveryLocationRequired,
        });
      }
    })
    .transform((details) => ({
      ...details,
      deliveryLocation:
        details.orderType === "Delivery" ? details.deliveryLocation : undefined,
    })) satisfies z.ZodType<CheckoutDetails, unknown>;
}
