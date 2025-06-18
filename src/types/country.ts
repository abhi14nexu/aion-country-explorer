export interface Country {
  cca2: string;
  name: { 
    common: string; 
    official: string; 
  };
  flags: { 
    png: string; 
    svg: string; 
  };
  population: number;
  region: string;
  capital?: string[];
  languages?: { [key: string]: string };
  currencies?: { [key: string]: { name: string; symbol: string } };
  borders?: string[];
}

export interface CountryBasic {
  cca2: string;
  name: { common: string };
  flags: { png: string };
  population: number;
  region: string;
  capital?: string[];
} 