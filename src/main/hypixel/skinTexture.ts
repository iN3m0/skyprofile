/**
 * Shared Mojang profile-property decoding — the base64 blob format Hypixel
 * uses everywhere a custom item/pet/mob is implemented as a player head
 * with a custom skin (items' `skin.value`, and NEU's bestiary catalog's
 * per-mob `texture` field are both this same shape). Pulled out of
 * `resources.ts` so the bestiary service can reuse it instead of
 * duplicating the decode + http-upgrade logic.
 */
export function decodeSkinTextureUrl(base64Value: string): string | null {
  try {
    const decoded = JSON.parse(Buffer.from(base64Value, 'base64').toString('utf8')) as {
      textures?: { SKIN?: { url?: string } }
    }
    const url = decoded.textures?.SKIN?.url
    if (!url) return null
    // Mojang's stored URLs are still plain http:// — upgrade to https so the
    // renderer's img-src CSP (scheme-sensitive) actually allows loading them;
    // textures.minecraft.net serves both.
    return url.replace(/^http:/, 'https:')
  } catch {
    return null
  }
}
