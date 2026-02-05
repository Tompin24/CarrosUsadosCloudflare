import { useStandProfile } from "@/hooks/useStandProfile";
import { Building2, Phone, Mail, Globe, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StandBadgeProps {
  userId: string;
  compact?: boolean;
}

export const StandBadge = ({ userId, compact = false }: StandBadgeProps) => {
  const { data: standProfile, isLoading } = useStandProfile(userId);

  if (isLoading || !standProfile) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {standProfile.logo_url ? (
          <img
            src={standProfile.logo_url}
            alt={standProfile.business_name}
            className="w-6 h-6 object-contain rounded"
          />
        ) : (
          <Building2 className="w-5 h-5 text-muted-foreground" />
        )}
        <span className="text-sm font-medium">{standProfile.business_name}</span>
        <Badge variant="secondary" className="text-xs">Stand</Badge>
      </div>
    );
  }

  return (
    <Card 
      className="overflow-hidden"
      style={{
        borderColor: standProfile.primary_color,
        borderWidth: "2px",
      }}
    >
      <div 
        className="h-2"
        style={{
          background: `linear-gradient(90deg, ${standProfile.primary_color}, ${standProfile.secondary_color})`,
        }}
      />
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {standProfile.logo_url ? (
            <img
              src={standProfile.logo_url}
              alt={standProfile.business_name}
              className="w-16 h-16 object-contain rounded-lg border bg-white p-1"
            />
          ) : (
            <div 
              className="w-16 h-16 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${standProfile.primary_color}20` }}
            >
              <Building2 
                className="w-8 h-8" 
                style={{ color: standProfile.primary_color }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{standProfile.business_name}</h3>
              <Badge 
                variant="secondary" 
                className="shrink-0"
                style={{ 
                  backgroundColor: `${standProfile.primary_color}20`,
                  color: standProfile.primary_color,
                }}
              >
                Stand Oficial
              </Badge>
            </div>
            {standProfile.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {standProfile.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {standProfile.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {standProfile.city}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contact buttons */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          {standProfile.phone && (
            <a href={`tel:${standProfile.phone}`}>
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-1" />
                Ligar
              </Button>
            </a>
          )}
          {standProfile.email && (
            <a href={`mailto:${standProfile.email}`}>
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
            </a>
          )}
          {standProfile.website && (
            <a href={standProfile.website} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Globe className="w-4 h-4 mr-1" />
                Website
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
