import { Link } from "react-router-dom";
import { Car } from "@/types/car";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gauge, Fuel, Settings2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { generateCarSlug } from "@/lib/slugify";
import { FavoriteButton } from "./FavoriteButton";

interface CarCardProps {
  car: Car;
  index?: number;
  showApprovalStatus?: boolean;
}

export const CarCard = ({ car, index = 0, showApprovalStatus = false }: CarCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number | null) => {
    if (!mileage) return "N/D";
    return new Intl.NumberFormat("pt-PT").format(mileage) + " km";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/carros/anuncio/${generateCarSlug(car.title, car.id)}`}>
        <Card className="group overflow-hidden border-border hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="aspect-[16/10] overflow-hidden bg-muted relative">
            {car.images && car.images.length > 0 ? (
              <img
                src={car.images[0]}
                alt={car.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <span className="text-muted-foreground">Sem imagem</span>
              </div>
            )}
            {car.is_sold && (
              <Badge className="absolute top-3 left-3 bg-destructive">
                Vendido
              </Badge>
            )}
            {showApprovalStatus && !car.is_approved && (
              <Badge className="absolute top-3 left-3 bg-orange-500 text-white flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Pendente
              </Badge>
            )}
            {showApprovalStatus && car.is_approved && (
              <Badge className="absolute top-3 left-3 bg-green-600 text-white">
                Aprovado
              </Badge>
            )}
            {/* Favorite Button */}
            <div className="absolute top-3 right-3">
              <FavoriteButton carId={car.id} size="sm" className="bg-background/80 hover:bg-background" />
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-display font-semibold text-lg line-clamp-1 group-hover:text-secondary transition-colors">
                {car.brand} {car.model}
              </h3>
              <span className="font-display font-bold text-lg text-secondary whitespace-nowrap">
                {formatPrice(car.price)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
              {car.title}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{car.year}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5" />
                <span>{formatMileage(car.mileage)}</span>
              </div>
              {car.fuel_type && (
                <div className="flex items-center gap-1.5">
                  <Fuel className="h-3.5 w-3.5" />
                  <span>{car.fuel_type}</span>
                </div>
              )}
              {car.transmission && (
                <div className="flex items-center gap-1.5">
                  <Settings2 className="h-3.5 w-3.5" />
                  <span>{car.transmission}</span>
                </div>
              )}
            </div>
            {car.location && (
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                📍 {car.location}
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};
