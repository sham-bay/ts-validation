import { describe, it, expect } from 'vitest';
import { zodAdapter } from '../../src/adapters/zod.js';

// The variable is used in describe.runIf, so the rule is disabled for this line
// eslint-disable-next-line no-useless-assignment
let hasZod = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let z: any = null;

// Try to dynamically import zod – if it fails, all tests will be skipped
try {
	const module = await import('zod');
	z = module.z;
	hasZod = true;
} catch {
	hasZod = false;
}

describe.runIf(hasZod)('zodAdapter', () => {
	it('should return success:true and typed data for valid input', () => {
		const schema = z.object({
			name: z.string().min(2),
			age: z.number().positive()
		});
		const validator = zodAdapter(schema);

		const input = { name: 'John', age: 30 };
		const result = validator.validate(input);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual(input);
			expect(result.data.name).toBe('John');
			expect(result.data.age).toBe(30);
		}
	});

	it('should return success:false and errors for invalid input', () => {
		const schema = z.object({
			name: z.string().min(2),
			age: z.number().positive()
		});
		const validator = zodAdapter(schema);

		const input = { name: 'J', age: -5 };
		const result = validator.validate(input);

		expect(result.success).toBe(false);
		if (!result.success) {
			// Проверяем только наличие ключей ошибок, текст не важен
			expect(Object.keys(result.errors)).toEqual(['name', 'age']);
			expect(result.errors.name).toBeDefined();
			expect(result.errors.age).toBeDefined();
			expect(result.errors.name[0]).toContain('small'); // или просто проверяем, что есть строка
			expect(result.data).toBe(input);
		}
	});

	it('should handle nested object paths', () => {
		const schema = z.object({
			user: z.object({
				address: z.object({
					city: z.string().min(3)
				})
			})
		});
		const validator = zodAdapter(schema);

		const input = { user: { address: { city: 'NY' } } };
		const result = validator.validate(input);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(Object.keys(result.errors)).toEqual(['user.address.city']);
			expect(result.errors['user.address.city']).toBeDefined();
			expect(result.errors['user.address.city'][0]).toContain('small');
		}
	});

	it('should handle array fields', () => {
		const schema = z.object({
			tags: z.array(z.string().min(2))
		});
		const validator = zodAdapter(schema);

		const input = { tags: ['a', 'bc'] };
		const result = validator.validate(input);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(Object.keys(result.errors)).toEqual(['tags.0']);
			expect(result.errors['tags.0']).toBeDefined();
			expect(result.errors['tags.0'][0]).toContain('small');
		}
	});

	it('should work with optional fields', () => {
		const schema = z.object({
			name: z.string().optional(),
			age: z.number().optional()
		});
		const validator = zodAdapter(schema);

		const input = { name: 'John' };
		const result = validator.validate(input);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual(input);
		}
	});

	it('should preserve the original data on failure', () => {
		const schema = z.object({ id: z.number() });
		const validator = zodAdapter(schema);

		const input = { id: 'not-a-number' };
		const result = validator.validate(input);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.data).toBe(input);
		}
	});

	it('should work with primitive schemas', () => {
		const schema = z.string().email();
		const validator = zodAdapter(schema);

		const validResult = validator.validate('test@example.com');
		expect(validResult.success).toBe(true);
		if (validResult.success) {
			expect(validResult.data).toBe('test@example.com');
		}

		const invalidResult = validator.validate('not-email');
		expect(invalidResult.success).toBe(false);
		if (!invalidResult.success) {
			expect(Object.keys(invalidResult.errors)).toEqual(['']);
			expect(invalidResult.errors['']).toBeDefined();
			expect(invalidResult.errors[''][0]).toContain('email');
		}
	});

	it('should handle empty error paths gracefully', () => {
		const schema = z.object({}).strict(); // rejects extra keys
		const validator = zodAdapter(schema);

		const input = { extra: 'field' };
		const result = validator.validate(input);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(Object.keys(result.errors)).toEqual(['']);
			expect(result.errors['']).toBeDefined();
			// Сообщение может быть разным, но содержит слово "extra"
			expect(result.errors[''][0]).toContain('extra');
		}
	});
});
