import { z } from "zod";
const schema = z.object({
  departure: z.string().max(100),
  city: z.string().max(80),
  date: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/),
  month: z.string().regex(/^(\d{4}-\d{2})?$/),
  flexible: z.enum(["true", "false"]),
  datesSelected: z.literal("1"),
});
export type TravelDateChoice = z.infer<typeof schema>;
export function readTravelDateChoice(packageId: string): TravelDateChoice | null {
  try {
    const parsed = schema.safeParse(
      JSON.parse(localStorage.getItem(`ma-travel-dates:${packageId}`) || "null"),
    );
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
export function saveTravelDateChoice(packageId: string, choice: TravelDateChoice) {
  try {
    localStorage.setItem(`ma-travel-dates:${packageId}`, JSON.stringify(schema.parse(choice)));
  } catch {
    /* URL persistence remains available. */
  }
}
