export const NOTE_COLORS = {
  1: '#FFE4E1', // Misty Rose
  2: '#E0FFFF', // Light Cyan
  3: '#F0FFF0', // Honeydew
  4: '#FFF0F5', // Lavender Blush
  5: '#FFFACD', // Lemon Chiffon
  6: '#FFE4B5', // Moccasin
} as const

export type NoteColorKey = keyof typeof NOTE_COLORS

export const getNoteColor = (index: number): string => {
  const colorIndex = (((index - 1) % 6) + 1) as NoteColorKey
  return NOTE_COLORS[colorIndex]
}

export const MENTION_REGEX = /(@\w+)/g
