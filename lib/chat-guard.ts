export const CHAT_REFUSAL =
  'I can only help with PokéCraft — our plushies, orders, shipping, and custom requests. 🧶'

// "code" is a normal shopping word (discount code, PIN code), so these phrases are
// checked first and never count as a programming request.
const SHOP_CODE_PHRASE =
  /\b(discount|promo|coupon|voucher|gift|referral|pin|postal|zip|tracking|otp|verification)\s*-?\s*codes?\b/i

const CODE_REQUEST =
  /\b(write|generate|create|give|show|fix|debug|refactor|implement|explain)\b[^.?!]{0,60}\b(code|program|script|snippet|query)\b/i

// Deliberately excludes words that are ordinary in a plushie shop: swift (delivery),
// ruby (colour), react, rust (safety eyes), variable (sizes).
const OFF_TOPIC_PATTERNS: RegExp[] = [
  /```/,
  /\b(javascript|typescript|python|java|c\+\+|c#|golang|php|node\.?js|jquery|kotlin|sql|html|css)\b/i,
  /\b(array|algorithm|function|regex|recursion|boolean|compiler|leetcode|api|data structure|linked list|binary tree|for loop|unit test)\b/i,
  /\b(essay|homework|assignment|translate|resume|cover letter)\b/i,
]

/**
 * Deterministic scope check for the shop assistant. The system prompt asks the model
 * to stay on topic; this is the part that does not depend on the model complying.
 */
export function isOffTopic(text: string): boolean {
  if (OFF_TOPIC_PATTERNS.some((re) => re.test(text))) return true
  return CODE_REQUEST.test(text) && !SHOP_CODE_PHRASE.test(text)
}
