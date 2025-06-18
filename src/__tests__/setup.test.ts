/**
 * Basic setup test to verify Jest configuration is working
 */

describe('Jest Setup', () => {
  test('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  test('should have access to DOM APIs', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello, World!';
    expect(div.textContent).toBe('Hello, World!');
  });

  test('should support async/await', async () => {
    const promise = Promise.resolve('success');
    const result = await promise;
    expect(result).toBe('success');
  });

  test('should have TypeScript support', () => {
    interface TestInterface {
      name: string;
      value: number;
    }

    const testObject: TestInterface = {
      name: 'test',
      value: 42,
    };

    expect(testObject.name).toBe('test');
    expect(testObject.value).toBe(42);
  });

  test('should support modern JavaScript features', () => {
    const array = [1, 2, 3, 4, 5];
    const doubled = array.map(n => n * 2);
    const filtered = doubled.filter(n => n > 5);
    
    expect(filtered).toEqual([6, 8, 10]);
  });
});