import { Helmet } from "react-helmet-async";
import type { Car } from "@/types/car";

interface CarJsonLdProps {
  car: Car;
  url: string;
}

export const CarJsonLd = ({ car, url }: CarJsonLdProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: car.title,
    description: car.description || `${car.year} ${car.brand} ${car.model} for sale`,
    brand: {
      "@type": "Brand",
      name: car.brand,
    },
    model: car.model,
    vehicleModelDate: car.year.toString(),
    mileageFromOdometer: car.mileage
      ? {
          "@type": "QuantitativeValue",
          value: car.mileage,
          unitCode: "KMT",
        }
      : undefined,
    fuelType: car.fuel_type || undefined,
    vehicleTransmission: car.transmission || undefined,
    color: car.color || undefined,
    bodyType: car.body_type || undefined,
    image: car.images && car.images.length > 0 ? car.images : undefined,
    offers: {
      "@type": "Offer",
      price: car.price,
      priceCurrency: "EUR",
      availability: car.is_sold
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      url: url,
      itemCondition: "https://schema.org/UsedCondition",
    },
    vehicleIdentificationNumber: undefined, // Could add VIN if available
  };

  // Remove undefined values
  const cleanJsonLd = JSON.parse(JSON.stringify(jsonLd));

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(cleanJsonLd)}</script>
    </Helmet>
  );
};
