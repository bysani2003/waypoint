// Deterministically maps a tag/category string to one of a fixed set of accent colors,
// so the same tag always renders the same color across cards.
const PALETTE = [
  { bar: '#e0714a', text: '#b3552f', tint: '#fbeae1' }, // orange
  { bar: '#4c9a6a', text: '#2f6b4b', tint: '#e3f1e7' }, // green
  { bar: '#5b7fbd', text: '#3d5c94', tint: '#e7ecf7' }, // blue
  { bar: '#9370b8', text: '#6e4f91', tint: '#f0e9f6' }, // purple
  { bar: '#3fa396', text: '#2a7a70', tint: '#e1f3f0' }, // teal
  { bar: '#c77da0', text: '#9a5578', tint: '#f6e7ee' }, // rose
]

export function colorForTag(tag) {
  const key = (tag || 'general').trim().toLowerCase()
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]
}
