// Basic country information for list views
export interface CountryBasic {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  cca3: string;
  region: string;
  population: number;
  flags: {
    png: string;
    svg: string;
  };
  capital: string[];
}

// Detailed country information for detail pages
export interface Country {
  name: {
    common: string;
    official: string;
    nativeName?: {
      [key: string]: {
        official: string;
        common: string;
      };
    };
  };
  cca2: string;
  cca3: string;
  ccn3?: string;
  region: string;
  subregion?: string;
  population: number;
  area?: number;
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  coatOfArms?: {
    png?: string;
    svg?: string;
  };
  capital?: string[];
  languages?: {
    [key: string]: string;
  };
  currencies?: {
    [key: string]: {
      name: string;
      symbol?: string;
    };
  };
  timezones?: string[];
  continents?: string[];
  borders?: string[];
  tld?: string[];
  callingCodes?: string[];
  independent?: boolean;
  status?: string;
  unMember?: boolean;
  landlocked?: boolean;
  maps?: {
    googleMaps?: string;
    openStreetMaps?: string;
  };
  car?: {
    side?: string;
    signs?: string[];
  };
  fifa?: string;
  gini?: {
    [key: string]: number;
  };
  startOfWeek?: string;
  capitalInfo?: {
    latlng?: number[];
  };
  latlng?: number[];
  demonyms?: {
    eng?: {
      f: string;
      m: string;
    };
    fra?: {
      f: string;
      m: string;
    };
  };
  postalCode?: {
    format?: string;
    regex?: string;
  };
}

// Search and filter interfaces
export interface SearchFilters {
  searchTerm: string;
  region: string;
  sortBy: 'name' | 'population' | 'area';
  sortOrder: 'asc' | 'desc';
}

// API response types
export interface CountryApiResponse {
  data: CountryBasic[];
  total: number;
  page?: number;
  limit?: number;
}

export interface CountryDetailApiResponse {
  data: Country;
}

// Helper types for formatting
export interface FormattedCountryData {
  basicInfo: {
    officialName: string;
    commonName: string;
    nativeNames: string[];
    region: string;
    subregion: string;
    capital: string;
    population: string;
    area: string;
    independent: boolean;
    unMember: boolean;
    landlocked: boolean;
  };
  geography: {
    coordinates: string;
    timezones: string[];
    continents: string[];
    borders: string[];
    maps: {
      google?: string;
      openStreetMap?: string;
    };
  };
  culture: {
    languages: string[];
    currencies: Array<{
      name: string;
      symbol: string;
      code: string;
    }>;
    demonyms: {
      male: string;
      female: string;
    };
    callingCodes: string[];
    topLevelDomains: string[];
  };
  additional: {
    carSide: string;
    startOfWeek: string;
    fifaCode: string;
    giniIndex: string;
    status: string;
  };
} 