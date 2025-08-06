import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const formData = await req.formData();
  const incomingMsg = formData.get("Body")?.toString().trim().toLowerCase();
  const from = formData.get("From");

  if (incomingMsg === "bonjour" || incomingMsg === "hello") {
    return new Response(`👋 Bonjour! Veuillez répondre avec la ville, le quartier et le service dont vous avez besoin (par exemple: Dakar, Médina, Plomberie).`);
  }

  const [city, quartier, service] = incomingMsg.split(",").map((s) => s.trim());

  if (!city || !quartier || !service) {
    return new Response("❌ Format incorrect. Veuillez répondre dans ce format: Dakar, Médina, Plomberie");
  }

  const { data, error } = await supabase.rpc("get_provider_count", {
    city_input: city,
    quartier_input: quartier,
    service_input: service
  });

  const count = data || 0;

  const reply =
    count > 0
      ? `✅ Il y a ${count} prestataires disponibles pour "${service}" à ${quartier}, ${city}. Voulez-vous continuer?`
      : `😕 Aucun prestataire trouvé pour "${service}" à ${quartier}, ${city}. Réessayez avec une autre zone ou service.`;

  return new Response(reply);
});
