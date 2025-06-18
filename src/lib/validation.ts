import { z } from 'zod';

// Basic country schema for list views
export const countryBasicSchema = z.object({
  name: z.object({
    common: z.string(),
    official: z.string(),
  }),
  cca2: z.string(),
  cca3: z.string(),
  region: z.string(),
  population: z.number(),
  flags: z.object({
    png: z.string().url(),
    svg: z.string().url(),
  }),
  capital: z.array(z.string()).optional().default([]),
});

// Native name schema for detailed country data
const nativeNameSchema = z.object({
  official: z.string(),
  common: z.string(),
});

// Currency schema
const currencySchema = z.object({
  name: z.string(),
  symbol: z.string().optional(),
});

// Maps schema
const mapsSchema = z.object({
  googleMaps: z.string().url().optional(),
  openStreetMaps: z.string().url().optional(),
});

// Car information schema
const carSchema = z.object({
  side: z.string().optional(),
  signs: z.array(z.string()).optional(),
});

// Demonyms schema
const demonymsLangSchema = z.object({
  f: z.string(),
  m: z.string(),
});

const demonymsSchema = z.object({
  eng: demonymsLangSchema.optional(),
  fra: demonymsLangSchema.optional(),
});

// Capital info schema
const capitalInfoSchema = z.object({
  latlng: z.array(z.number()).optional(),
});

// Postal code schema
const postalCodeSchema = z.object({
  format: z.string().optional(),
  regex: z.string().optional(),
});

// Coat of arms schema
const coatOfArmsSchema = z.object({
  png: z.string().url().optional(),
  svg: z.string().url().optional(),
});

// Detailed country schema for detail views
export const countryDetailSchema = z.object({
  name: z.object({
    common: z.string(),
    official: z.string(),
    nativeName: z.record(z.string(), nativeNameSchema).optional(),
  }),
  cca2: z.string(),
  cca3: z.string(),
  ccn3: z.string().optional(),
  region: z.string(),
  subregion: z.string().optional(),
  population: z.number(),
  area: z.number().optional(),
  flags: z.object({
    png: z.string().url(),
    svg: z.string().url(),
    alt: z.string().optional(),
  }),
  coatOfArms: coatOfArmsSchema.optional(),
  capital: z.array(z.string()).optional(),
  languages: z.record(z.string(), z.string()).optional(),
  currencies: z.record(z.string(), currencySchema).optional(),
  timezones: z.array(z.string()).optional(),
  continents: z.array(z.string()).optional(),
  borders: z.array(z.string()).optional(),
  tld: z.array(z.string()).optional(),
  callingCodes: z.array(z.string()).optional(),
  independent: z.boolean().optional(),
  status: z.string().optional(),
  unMember: z.boolean().optional(),
  landlocked: z.boolean().optional(),
  maps: mapsSchema.optional(),
  car: carSchema.optional(),
  fifa: z.string().optional(),
  gini: z.record(z.string(), z.number()).optional(),
  startOfWeek: z.string().optional(),
  capitalInfo: capitalInfoSchema.optional(),
  latlng: z.array(z.number()).optional(),
  demonyms: demonymsSchema.optional(),
  postalCode: postalCodeSchema.optional(),
});

// Search filters schema
export const searchFiltersSchema = z.object({
  searchTerm: z.string().default(''),
  region: z.string().default(''),
  sortBy: z.enum(['name', 'population', 'area']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// API response schemas
export const countryApiResponseSchema = z.object({
  data: z.array(countryBasicSchema),
  total: z.number(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export const countryDetailApiResponseSchema = z.object({
  data: countryDetailSchema,
});

// Validation functions
export const validateCountryBasic = (data: unknown) => {
  return countryBasicSchema.parse(data);
};

export const validateCountryDetail = (data: unknown) => {
  return countryDetailSchema.parse(data);
};

export const validateSearchFilters = (data: unknown) => {
  return searchFiltersSchema.parse(data);
};

export const validateCountryApiResponse = (data: unknown) => {
  return countryApiResponseSchema.parse(data);
};

export const validateCountryDetailApiResponse = (data: unknown) => {
  return countryDetailApiResponseSchema.parse(data);
};

// Safe validation functions that return result objects
export const safeValidateCountryBasic = (data: unknown) => {
  return countryBasicSchema.safeParse(data);
};

export const safeValidateCountryDetail = (data: unknown) => {
  return countryDetailSchema.safeParse(data);
};

export const safeValidateSearchFilters = (data: unknown) => {
  return searchFiltersSchema.safeParse(data);
};

// Type exports for use with TypeScript
export type CountryBasicType = z.infer<typeof countryBasicSchema>;
export type CountryDetailType = z.infer<typeof countryDetailSchema>;
export type SearchFiltersType = z.infer<typeof searchFiltersSchema>;
export type CountryApiResponseType = z.infer<typeof countryApiResponseSchema>;
export type CountryDetailApiResponseType = z.infer<typeof countryDetailApiResponseSchema>; 