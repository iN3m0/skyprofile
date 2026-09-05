/**
 * Renderer-side handle onto the typed IPC bridge exposed by the preload
 * script (see src/preload/index.ts). Import this instead of touching
 * `window.api` directly so call sites don't need to know it lives on
 * `window`.
 */
export const api = window.api
