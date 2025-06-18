import { getAllCountries, getCountryByCode, getCountriesByCodes, CountryAPIError } from '@/lib/api';
import { CountryBasic, Country } from '@/types/country';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCountries', () => {
    const mockCountriesData: CountryBasic[] = [
      {
        cca2: 'US',
        name: { common: 'United States' },
        flags: { png: 'https://example.com/us.png' },
        population: 331000000,
        region: 'Americas',
        capital: ['Washington, D.C.']
      },
      {
        cca2: 'CA',
        name: { common: 'Canada' },
        flags: { png: 'https://example.com/ca.png' },
        population: 38000000,
        region: 'Americas',
        capital: ['Ottawa']
      }
    ];

    test('should fetch and return all countries successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCountriesData,
      } as Response);

      const result = await getAllCountries();

      expect(fetch).toHaveBeenCalledWith(
        'https://restcountries.com/v3.1/all?fields=cca2,name,flags,population,region,capital',
        { cache: 'force-cache' }
      );
      expect(result).toEqual(mockCountriesData);
    });

    test('should throw CountryAPIError on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getAllCountries()).rejects.toThrow(CountryAPIError);
      await expect(getAllCountries()).rejects.toThrow('Failed to fetch countries: Network error');
    });

    test('should throw CountryAPIError on HTTP error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(getAllCountries()).rejects.toThrow(CountryAPIError);
      await expect(getAllCountries()).rejects.toThrow('HTTP error! status: 500');
    });

    test('should throw CountryAPIError on validation failure', async () => {
      const invalidData = [
        {
          cca2: 'US',
          // Missing required fields
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => invalidData,
      } as Response);

      await expect(getAllCountries()).rejects.toThrow(CountryAPIError);
    });

    test('should handle empty response array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      const result = await getAllCountries();
      expect(result).toEqual([]);
    });
  });

  describe('getCountryByCode', () => {
    const mockCountryData: Country = {
      cca2: 'US',
      name: { 
        common: 'United States',
        official: 'United States of America'
      },
      flags: { 
        png: 'https://example.com/us.png',
        svg: 'https://example.com/us.svg'
      },
      population: 331000000,
      region: 'Americas',
      capital: ['Washington, D.C.'],
      languages: { eng: 'English' },
      currencies: { 
        USD: { name: 'United States dollar', symbol: '$' }
      },
      borders: ['CAN', 'MEX']
    };

    test('should fetch country by code successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockCountryData],
      } as Response);

      const result = await getCountryByCode('us');

      expect(fetch).toHaveBeenCalledWith(
        'https://restcountries.com/v3.1/alpha/us',
        { cache: 'force-cache' }
      );
      expect(result).toEqual(mockCountryData);
    });

    test('should normalize country code to lowercase', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockCountryData],
      } as Response);

      await getCountryByCode('US');

      expect(fetch).toHaveBeenCalledWith(
        'https://restcountries.com/v3.1/alpha/us',
        { cache: 'force-cache' }
      );
    });

    test('should throw error for empty code', async () => {
      await expect(getCountryByCode('')).rejects.toThrow('Country code is required');
    });

    test('should throw error when country not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      await expect(getCountryByCode('invalid')).rejects.toThrow('Country not found: invalid');
    });

    test('should handle 404 response gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(getCountryByCode('invalid')).rejects.toThrow('Country not found: invalid');
    });

    test('should throw CountryAPIError on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getCountryByCode('us')).rejects.toThrow(CountryAPIError);
    });

    test('should validate response data structure', async () => {
      const invalidData = [
        {
          cca2: 'US',
          // Missing required fields
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => invalidData,
      } as Response);

      await expect(getCountryByCode('us')).rejects.toThrow(CountryAPIError);
    });
  });

  describe('getCountriesByCodes', () => {
    const mockCountriesData: Country[] = [
      {
        cca2: 'US',
        name: { 
          common: 'United States',
          official: 'United States of America'
        },
        flags: { 
          png: 'https://example.com/us.png',
          svg: 'https://example.com/us.svg'
        },
        population: 331000000,
        region: 'Americas',
        capital: ['Washington, D.C.'],
        languages: { eng: 'English' },
        currencies: { 
          USD: { name: 'United States dollar', symbol: '$' }
        },
        borders: ['CAN', 'MEX']
      },
      {
        cca2: 'CA',
        name: { 
          common: 'Canada',
          official: 'Canada'
        },
        flags: { 
          png: 'https://example.com/ca.png',
          svg: 'https://example.com/ca.svg'
        },
        population: 38000000,
        region: 'Americas',
        capital: ['Ottawa'],
        languages: { 
          eng: 'English',
          fra: 'French'
        },
        currencies: { 
          CAD: { name: 'Canadian dollar', symbol: '$' }
        },
        borders: ['USA']
      }
    ];

    test('should fetch multiple countries by codes successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCountriesData,
      } as Response);

      const result = await getCountriesByCodes(['us', 'ca']);

      expect(fetch).toHaveBeenCalledWith(
        'https://restcountries.com/v3.1/alpha?codes=us,ca',
        { cache: 'force-cache' }
      );
      expect(result).toEqual(mockCountriesData);
    });

    test('should handle empty codes array', async () => {
      const result = await getCountriesByCodes([]);
      expect(result).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should normalize country codes to lowercase', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCountriesData,
      } as Response);

      await getCountriesByCodes(['US', 'CA']);

      expect(fetch).toHaveBeenCalledWith(
        'https://restcountries.com/v3.1/alpha?codes=us,ca',
        { cache: 'force-cache' }
      );
    });

    test('should filter out empty codes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockCountriesData[0]],
      } as Response);

      await getCountriesByCodes(['us', '', '  ']);

      expect(fetch).toHaveBeenCalledWith(
        'https://restcountries.com/v3.1/alpha?codes=us',
        { cache: 'force-cache' }
      );
    });

    test('should handle single country code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockCountriesData[0]],
      } as Response);

      const result = await getCountriesByCodes(['us']);

      expect(fetch).toHaveBeenCalledWith(
        'https://restcountries.com/v3.1/alpha?codes=us',
        { cache: 'force-cache' }
      );
      expect(result).toEqual([mockCountriesData[0]]);
    });

    test('should throw CountryAPIError on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getCountriesByCodes(['us', 'ca'])).rejects.toThrow(CountryAPIError);
    });

    test('should handle partial results when some countries not found', async () => {
      // API returns only one country when two are requested
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockCountriesData[0]],
      } as Response);

      const result = await getCountriesByCodes(['us', 'invalid']);

      expect(result).toEqual([mockCountriesData[0]]);
    });

    test('should handle 404 response by returning empty array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const result = await getCountriesByCodes(['invalid1', 'invalid2']);
      expect(result).toEqual([]);
    });
  });

  describe('CountryAPIError', () => {
    test('should create error with message and status', () => {
      const error = new CountryAPIError('Test error', 400);
      
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(400);
      expect(error.name).toBe('CountryAPIError');
      expect(error).toBeInstanceOf(Error);
    });

    test('should create error with just message', () => {
      const error = new CountryAPIError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.status).toBeUndefined();
    });
  });

  describe('Caching', () => {
    test('should use force-cache for all requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      await getAllCountries();
      await getCountryByCode('us');
      await getCountriesByCodes(['us', 'ca']);

      expect(mockFetch).toHaveBeenCalledTimes(3);
      mockFetch.mock.calls.forEach(call => {
        expect(call[1]).toEqual({ cache: 'force-cache' });
      });
    });
  });

  describe('Error Handling', () => {
    test('should preserve original error messages in CountryAPIError', async () => {
      const originalError = new Error('Original network error');
      mockFetch.mockRejectedValueOnce(originalError);

      try {
        await getAllCountries();
      } catch (error) {
        expect(error).toBeInstanceOf(CountryAPIError);
        expect((error as CountryAPIError).message).toContain('Original network error');
      }
    });

    test('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      await expect(getAllCountries()).rejects.toThrow(CountryAPIError);
    });

    test('should handle non-Error rejections', async () => {
      mockFetch.mockRejectedValueOnce('String error');

      await expect(getAllCountries()).rejects.toThrow(CountryAPIError);
    });
  });
}); 