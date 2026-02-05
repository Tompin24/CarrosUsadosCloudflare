import { Helmet } from "react-helmet-async";

interface OrganizationJsonLdProps {
  url: string;
}

export const OrganizationJsonLd = ({ url }: OrganizationJsonLdProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Carros Usados.pt",
    url: url,
    logo: `${url}/favicon.ico`,
    description: "Portugal's premier online marketplace for buying and selling used cars.",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Portuguese", "English"],
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};
