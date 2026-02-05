import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ExtractedCarData {
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  body_type?: string;
  color?: string;
  location?: string;
  description?: string;
  images?: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Importing listing from: ${url}`);

    // Validate URL is from allowed domains
    const allowedDomains = ["standvirtual.com", "olx.pt", "custojusto.pt", "autoscout24.pt"];
    const urlObj = new URL(url);
    const isAllowedDomain = allowedDomains.some(domain => urlObj.hostname.includes(domain));
    
    if (!isAllowedDomain) {
      return new Response(
        JSON.stringify({ error: "Domínio não suportado. Domínios permitidos: StandVirtual, OLX, CustoJusto, AutoScout24" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch URL: ${response.status}`);
      return new Response(
        JSON.stringify({ error: "Não foi possível aceder ao anúncio. Verifique o URL." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = await response.text();
    console.log(`Fetched HTML length: ${html.length}`);

    // Extract a reasonable portion of the HTML (limit to avoid token limits)
    const truncatedHtml = html.substring(0, 50000);

    // Use Lovable AI Gateway to extract structured data
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert at extracting structured car listing data from HTML. 
Extract the following fields from the provided HTML of a Portuguese car listing website:
- title: The full title of the listing
- brand: Car manufacturer (e.g., BMW, Mercedes, Audi, Porsche)
- model: Car model (e.g., Série 3, Classe C, A4, 911)
- year: Year of manufacture (number)
- price: Price in euros (number only, no currency symbol)
- mileage: Kilometers driven (number only)
- fuel_type: Type of fuel (Gasolina, Gasóleo, Elétrico, Híbrido, GPL)
- transmission: Type of transmission (Manual, Automático)
- body_type: Body type (Berlina, SUV, Carrinha, Coupé, Cabrio, Monovolume, Comercial)
- color: Color of the car in Portuguese
- location: City/region in Portugal
- description: Full description text
- images: Array of image URLs (only include direct image URLs, not thumbnails)

IMPORTANT:
- Return ONLY valid JSON, no markdown or explanations
- Use null for missing fields
- Price and mileage must be numbers without formatting
- Year must be a 4-digit number
- Extract all available images from the listing`
          },
          {
            role: "user",
            content: `Extract the car listing data from this HTML:\n\n${truncatedHtml}`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const aiError = await aiResponse.text();
      console.error(`AI extraction failed: ${aiError}`);
      return new Response(
        JSON.stringify({ error: "Erro ao processar o anúncio. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await aiResponse.json();
    const extractedContent = aiResult.choices?.[0]?.message?.content;
    
    console.log(`AI response: ${extractedContent?.substring(0, 500)}`);

    if (!extractedContent) {
      return new Response(
        JSON.stringify({ error: "Não foi possível extrair dados do anúncio." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response
    let carData: ExtractedCarData;
    try {
      // Remove markdown code blocks if present
      let jsonStr = extractedContent.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/```json\n?/, "").replace(/\n?```$/, "");
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/```\n?/, "").replace(/\n?```$/, "");
      }
      
      carData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error(`Failed to parse AI response: ${parseError}`);
      console.error(`Raw content: ${extractedContent}`);
      return new Response(
        JSON.stringify({ error: "Erro ao processar dados extraídos." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required fields
    if (!carData.title || !carData.brand || !carData.year || !carData.price) {
      console.warn("Missing required fields in extracted data");
    }

    console.log(`Successfully extracted: ${carData.title}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: carData,
        source_url: url 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error(`Import error: ${error}`);
    return new Response(
      JSON.stringify({ error: "Erro interno. Tente novamente mais tarde." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
