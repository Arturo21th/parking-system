import { z } from "zod";

export const zoneSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(10),
  name: z.string().trim().min(1, "Name is required").max(60),
  covered: z.boolean().default(false),
});

export const spotSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(20),
  type: z.enum(["REGULAR", "HANDICAP", "RESERVED", "MOTORCYCLE"]),
  zoneId: z.string().min(1, "Zone is required"),
});

export const rateConfigSchema = z.object({
  hourlyRate: z.coerce.number().positive("Must be greater than 0"),
  gracePeriodMins: z.coerce.number().int().min(0).max(120),
  dailyMax: z.coerce.number().positive("Must be greater than 0"),
});

export const subscriberSchema = z.object({
  plate: z.string().trim().min(1, "Plate is required").max(20).toUpperCase(),
  holderName: z.string().trim().min(1, "Name is required").max(80),
  validUntil: z.string().min(1, "Date is required"),
});

export const checkInSchema = z.object({
  plate: z.string().trim().min(1, "Plate is required").max(20).toUpperCase(),
  zoneId: z.string().min(1, "Zone is required"),
});

export const checkOutSchema = z.object({
  sessionId: z.string().min(1),
});
