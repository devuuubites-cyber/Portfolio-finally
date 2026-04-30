export type SectionId = "name" | "skills" | "achievements" | "hobbies" | "closing"

export interface Section {
  id: SectionId
  start: number
  end: number
  /** Editorial label for the section overline. */
  overline: string
}

/**
 * Depth zones along the camera path (normalized 0..1 progress).
 * Tuned so a single piece of text owns the camera at any moment.
 */
export const SECTIONS: Section[] = [
  { id: "name", start: 0.04, end: 0.18, overline: "I." },
  { id: "skills", start: 0.24, end: 0.4, overline: "II." },
  { id: "achievements", start: 0.46, end: 0.64, overline: "III." },
  { id: "hobbies", start: 0.7, end: 0.86, overline: "IV." },
  { id: "closing", start: 0.92, end: 1.0, overline: "V." },
]
