import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: "website" | "article" | "product";
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
  children?: React.ReactNode;
}

const SITE_NAME = "Carros Usados.pt";
const DEFAULT_DESCRIPTION = "Find thousands of quality used cars from trusted sellers. Buy and sell vehicles with confidence on Portugal's premier car marketplace.";
const DEFAULT_OG_IMAGE = "/og-image.jpg";

export const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt,
  noIndex = false,
  children,
}: SEOHeadProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const metaDescription = description.length > 160 ? description.slice(0, 157) + "..." : description;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={ogType} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {children}
    </Helmet>
  );
};
