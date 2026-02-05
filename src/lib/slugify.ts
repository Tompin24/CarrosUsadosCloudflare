export const generateCarSlug = (title: string, id: string): string => {
  const slugifiedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  // Use last 4 characters of the UUID as a short identifier
  const shortId = id.slice(-10);

  return `${slugifiedTitle}-${shortId}`;
};

export const extractIdFromSlug = (slug: string): string | null => {
  // The last 4 characters before potential query params are the short ID
  const shortId = slug.slice(-10);
  return shortId;
};
