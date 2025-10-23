export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "AI Media Generator";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

// Generation types
export const GENERATION_TYPES = {
  TEXT_TO_IMAGE: "text_to_image",
  TEXT_TO_VIDEO: "text_to_video",
  IMAGE_TO_IMAGE: "image_to_image",
} as const;

// Providers
export const PROVIDERS = {
  RUNWARE: "runware",
  REPLICATE: "replicate",
} as const;

// Default models
export const DEFAULT_MODELS = {
  RUNWARE_IMAGE: "runware:100@1",
  REPLICATE_IMAGE: "black-forest-labs/flux-schnell",
  REPLICATE_VIDEO: "stability-ai/stable-video-diffusion",
} as const;