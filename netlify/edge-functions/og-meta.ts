import { Context } from "https://edge.netlify.com";

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // Extract slug from path (/invite/slug or /invite/slug/to/guest)
  const matches = path.match(/^\/invite\/([^\/]+)/);
  if (!matches) {
    return context.next();
  }
  const slug = matches[1];

  // Extract guest name if present
  let guestName = "";
  const guestMatch = path.match(/\/to\/([^\/]+)/);
  if (guestMatch) {
    try {
      guestName = decodeURIComponent(guestMatch[1]).trim();
    } catch (_) {
      guestName = guestMatch[1];
    }
  }

  // Fetch the original static index.html response from Netlify publish directory
  const response = await context.next();
  let html = await response.text();

  // Load Supabase variables from Environment (fallback to default credentials if not set)
  const supabaseUrl = Deno.env.get("VITE_SUPABASE_URL") || "https://jxtmjmsxziowyihktpoq.supabase.co";
  const supabaseKey = Deno.env.get("VITE_SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dG1qbXN4emlvd3lpaGt0cG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDMzNjIsImV4cCI6MjA5NTQ3OTM2Mn0.D_PvewaYa0CAQDziwYkPUMkzZl_BkbUk6h2bwsAQCD4";

  try {
    // 1. Fetch public profile by slug
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles_public?slug=eq.${encodeURIComponent(slug)}`, {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`
      }
    });
    const profiles = await profileRes.json();
    const profile = profiles?.[0];

    if (profile && profile.user_id) {
      // 2. Fetch active settings for the profile owner (contains hero_image and event configuration)
      const settingsRes = await fetch(`${supabaseUrl}/rest/v1/settings?user_id=eq.${profile.user_id}`, {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`
        }
      });
      const settingsList = await settingsRes.json();
      const settings = settingsList?.[0];

      // Resolve couple names, event description and background photo dynamically
      const coupleNames = settings?.couple_names || `${profile.groom_name || ""} & ${profile.bride_name || ""}`;
      const heroImage = settings?.hero_image || "https://jxtmjmsxziowyihktpoq.supabase.co/storage/v1/object/public/photos/8f013aa5-2e26-4383-a5c1-39c443873108.jpeg";
      
      let metaTitle = `${coupleNames} Wedding Invitation | សំបុត្រមង្គលការ`;
      if (guestName) {
        metaTitle = `Dear ${guestName} - You are invited to ${coupleNames}'s Wedding!`;
      }
      
      const metaDesc = settings?.event_title_en 
        ? `Warmly invite you to celebrate our ${settings.event_title_en.toLowerCase()}. RSVP online.`
        : `Warmly invite you to celebrate our special day. RSVP online.`;

      // Replace open graph & twitter tags dynamically
      // Title
      html = html.replace(/<title>[^<]*<\/title>/gi, `<title>${metaTitle}</title>`);
      html = html.replace(/<meta[^>]*property="og:title"[^>]*>/gi, `<meta property="og:title" content="${metaTitle}">`);
      html = html.replace(/<meta[^>]*name="twitter:title"[^>]*>/gi, `<meta name="twitter:title" content="${metaTitle}">`);

      // Description
      html = html.replace(/<meta[^>]*name="description"[^>]*>/gi, `<meta name="description" content="${metaDesc}">`);
      html = html.replace(/<meta[^>]*property="og:description"[^>]*>/gi, `<meta property="og:description" content="${metaDesc}">`);
      html = html.replace(/<meta[^>]*name="twitter:description"[^>]*>/gi, `<meta name="twitter:description" content="${metaDesc}">`);

      // Image
      html = html.replace(/<link[^>]*rel="preload"[^>]*as="image"[^>]*>/gi, `<link rel="preload" href="${heroImage}" as="image">`);
      html = html.replace(/<meta[^>]*property="og:image"[^>]*>/gi, `<meta property="og:image" content="${heroImage}">`);
      html = html.replace(/<meta[^>]*name="twitter:image"[^>]*>/gi, `<meta name="twitter:image" content="${heroImage}">`);
    }
  } catch (err) {
    console.error("Error setting dynamic link preview metadata:", err);
  }

  return new Response(html, {
    headers: response.headers
  });
};
