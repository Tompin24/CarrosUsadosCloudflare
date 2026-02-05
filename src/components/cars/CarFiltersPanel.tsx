import { useState } from "react";
import { CarFilters, CAR_BRANDS, FUEL_TYPES, TRANSMISSIONS, BODY_TYPES, COLORS, LOCATIONS, MILEAGE_RANGES } from "@/types/car";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CarFiltersProps {
  filters: CarFilters;
  onFiltersChange: (filters: CarFilters) => void;
}

const ALL_VALUE = "__all__";

export const CarFiltersPanel = ({ filters, onFiltersChange }: CarFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const handleReset = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== "");

  const handleSelectChange = (value: string, key: keyof CarFilters) => {
    onFiltersChange({
      ...filters,
      [key]: value === ALL_VALUE ? undefined : value,
    });
  };

  const handleNumberSelectChange = (value: string, key: keyof CarFilters) => {
    onFiltersChange({
      ...filters,
      [key]: value === ALL_VALUE ? undefined : Number(value),
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar carros..."
          className="pl-10"
          value={filters.search || ""}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
        />
      </div>

      {/* Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {isExpanded ? "Ocultar Filtros" : "Mais Filtros"}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 text-destructive">
            <X className="h-4 w-4" />
            Limpar Tudo
          </Button>
        )}
      </div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Brand */}
              <div className="space-y-2">
                <Label>Marca</Label>
                <Select
                  value={filters.brand || ALL_VALUE}
                  onValueChange={(v) => handleSelectChange(v, "brand")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as Marcas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>Todas as Marcas</SelectItem>
                    {CAR_BRANDS.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <Label>Preço Mínimo (€)</Label>
                <Input
                  type="number"
                  placeholder="Mín"
                  value={filters.minPrice || ""}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      minPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Preço Máximo (€)</Label>
                <Input
                  type="number"
                  placeholder="Máx"
                  value={filters.maxPrice || ""}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      maxPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              {/* Year Range */}
              <div className="space-y-2">
                <Label>Ano Mínimo</Label>
                <Select
                  value={filters.minYear?.toString() || ALL_VALUE}
                  onValueChange={(v) => handleNumberSelectChange(v, "minYear")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>Qualquer</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ano Máximo</Label>
                <Select
                  value={filters.maxYear?.toString() || ALL_VALUE}
                  onValueChange={(v) => handleNumberSelectChange(v, "maxYear")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>Qualquer</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fuel Type */}
              <div className="space-y-2">
                <Label>Combustível</Label>
                <Select
                  value={filters.fuelType || ALL_VALUE}
                  onValueChange={(v) => handleSelectChange(v, "fuelType")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>Qualquer</SelectItem>
                    {FUEL_TYPES.map((fuel) => (
                      <SelectItem key={fuel} value={fuel}>
                        {fuel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transmission */}
              <div className="space-y-2">
                <Label>Transmissão</Label>
                <Select
                  value={filters.transmission || ALL_VALUE}
                  onValueChange={(v) => handleSelectChange(v, "transmission")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>Qualquer</SelectItem>
                    {TRANSMISSIONS.map((trans) => (
                      <SelectItem key={trans} value={trans}>
                        {trans}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Body Type */}
              <div className="space-y-2">
                <Label>Tipo de Carroçaria</Label>
                <Select
                  value={filters.bodyType || ALL_VALUE}
                  onValueChange={(v) => handleSelectChange(v, "bodyType")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>Qualquer</SelectItem>
                    {BODY_TYPES.map((body) => (
                      <SelectItem key={body} value={body}>
                        {body}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label>Cor</Label>
                <Select
                  value={filters.color || ALL_VALUE}
                  onValueChange={(v) => handleSelectChange(v, "color")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer Cor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>Qualquer Cor</SelectItem>
                    {COLORS.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mileage Range */}
              <div className="space-y-2">
                <Label>Quilometragem Mínima</Label>
                <Input
                  type="number"
                  placeholder="Mín"
                  value={filters.minMileage || ""}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      minMileage: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Quilometragem Máxima</Label>
                <Select
                  value={filters.maxMileage?.toString() || ALL_VALUE}
                  onValueChange={(v) => handleNumberSelectChange(v, "maxMileage")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>Qualquer</SelectItem>
                    {MILEAGE_RANGES.map((range) => (
                      <SelectItem key={range.max} value={range.max.toString()}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Localização</Label>
                <Select
                  value={filters.location || ALL_VALUE}
                  onValueChange={(v) => handleSelectChange(v, "location")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as Localizações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>Todas as Localizações</SelectItem>
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
