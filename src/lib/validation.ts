import { z } from 'zod';

export const countryBasicSchema = z.object({
  cca2: z.string(),
  name: z.object({ common: z.string() }),
  flags: z.object({ png: z.string() }),
  population: z.number(),
  region: z.string(),
  capital: z.array(z.string()).optional(),
});

export const countryDetailSchema = countryBasicSchema.extend({
  name: z.object({ 
    common: z.string(), 
    official: z.string() 
  }),
  flags: z.object({ 
    png: z.string(), 
    svg: z.string() 
  }),
  languages: z.record(z.string()).optional(),
  currencies: z.record(z.object({
    name: z.string(),
    symbol: z.string()
  })).optional(),
  borders: z.array(z.string()).optional(),
});

// Type inference from Zod schemas
export type CountryBasicValidated = z.infer<typeof countryBasicSchema>;
export type CountryDetailValidated = z.infer<typeof countryDetailSchema>; 