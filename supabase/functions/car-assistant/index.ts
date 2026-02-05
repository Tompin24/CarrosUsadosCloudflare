import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CarFilters {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  location?: string;
  maxMileage?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, use AI to extract filters from user message (supports Portuguese and English)
    const filterExtractionPrompt = `You are a filter extraction assistant for CarrosUsados.pt, a Portuguese car marketplace. Analyze the user message (in Portuguese or English) and extract car search filters.

Available filters:
- brand: car brand (Audi, BMW, Toyota, Mercedes-Benz, Citroen, Renault, Peugeot, Volkswagen, Fiat, Opel, etc.)
- minPrice / maxPrice: price range in EUR (euros)
- minYear / maxYear: year range
- fuelType: Gasolina, Gasóleo, Elétrico, Híbrido, GPL (or English: Petrol, Diesel, Electric, Hybrid, LPG)
- transmission: Manual, Automático, Semi-automático (or English: Manual, Automatic, Semi-automatic)
- bodyType: Berlina, Carrinha, SUV, Coupé, Descapotável, Monovolume, Comercial, Pick-up (or English equivalents)
- color: Preto, Branco, Cinzento, Prata, Azul, Vermelho, Verde, Castanho, Bege, Amarelo, Laranja (or English equivalents)
- location: Lisboa, Porto, Braga, Faro, Coimbra, Setúbal, Aveiro, Leiria, Viseu, Santarém, Évora, Castelo Branco, Viana do Castelo, Vila Real, Bragança, Guarda, Portalegre, Beja, Açores, Madeira
- maxMileage: maximum kilometers

Respond ONLY with a JSON object containing the extracted filters. Use null for filters not mentioned.
Example: {"brand": "Toyota", "maxPrice": 15000, "fuelType": "Gasóleo", "location": "Lisboa"}

If the user is NOT asking about finding/searching cars (e.g., asking general questions, greetings, advice), respond with: {"isSearch": false}`;

    const filterResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: filterExtractionPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 200,
      }),
    });

    const filterData = await filterResponse.json();
    const filterText = filterData.choices?.[0]?.message?.content || "{}";
    
    let filters: CarFilters & { isSearch?: boolean } = {};
    try {
      const cleanedText = filterText.replace(/```json\n?|\n?```/g, "").trim();
      filters = JSON.parse(cleanedText);
    } catch {
      console.log("Could not parse filters:", filterText);
    }

    let carsContext = "";
    let matchedCars: any[] = [];

    // If user is searching for cars, query the database
    if (filters.isSearch !== false && Object.keys(filters).some(k => k !== "isSearch")) {
      let query = supabase
        .from("cars")
        .select("*")
        .eq("is_sold", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (filters.brand) query = query.ilike("brand", `%${filters.brand}%`);
      if (filters.minPrice) query = query.gte("price", filters.minPrice);
      if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
      if (filters.minYear) query = query.gte("year", filters.minYear);
      if (filters.maxYear) query = query.lte("year", filters.maxYear);
      if (filters.fuelType) query = query.eq("fuel_type", filters.fuelType);
      if (filters.transmission) query = query.eq("transmission", filters.transmission);
      if (filters.bodyType) query = query.eq("body_type", filters.bodyType);
      if (filters.color) query = query.eq("color", filters.color);
      if (filters.location) query = query.ilike("location", `%${filters.location}%`);
      if (filters.maxMileage) query = query.lte("mileage", filters.maxMileage);

      const { data: cars, error } = await query;

      if (error) {
        console.error("Database error:", error);
      } else if (cars && cars.length > 0) {
        matchedCars = cars;
        carsContext = `\n\nEncontrei ${cars.length} carro(s) que correspondem aos critérios:\n` +
          cars.map((car, i) => 
            `${i + 1}. ${car.title} - ${car.brand} ${car.model} (${car.year})\n` +
            `   Preço: ${car.price.toLocaleString("pt-PT")} €\n` +
            `   ${car.fuel_type || "N/A"} | ${car.transmission || "N/A"} | ${car.mileage ? car.mileage.toLocaleString("pt-PT") + " km" : "N/A"}\n` +
            `   Localização: ${car.location || "N/A"}\n` +
            `   ID: ${car.id}`
          ).join("\n\n");
      } else {
        carsContext = "\n\nNão encontrei carros com esses critérios. Pode ajustar os filtros ou ver todos os anúncios disponíveis.";
      }
    }

    const systemPrompt = `You are a helpful car marketplace assistant for CarrosUsados.pt, a Portuguese used car marketplace. You help users in both Portuguese and English - respond in the same language they use.

You help users:
- Find cars based on their preferences (brand, budget, fuel type, location in Portugal, etc.)
- Answer questions about car listings
- Provide guidance on buying/selling cars in Portugal
- Give tips on car maintenance and ownership

When presenting car results:
- List the cars clearly with key details
- Always show prices in euros (€) formatted for Portugal (e.g., 15.000 €)
- Mention price, year, fuel type, transmission, mileage
- Be enthusiastic but honest
- Suggest users click on listings for more details

${carsContext ? `RESULTADOS DA PESQUISA:${carsContext}` : ""}

Be friendly, concise, and helpful. Format your responses nicely with bullet points or numbered lists when appropriate. If the user writes in Portuguese, respond in Portuguese. If they write in English, respond in English.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    const assistantResponse = data.choices?.[0]?.message?.content || "Sorry, I could not process that.";

    return new Response(JSON.stringify({ 
      response: assistantResponse,
      cars: matchedCars,
      filters: filters.isSearch !== false ? filters : null
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Car assistant error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
