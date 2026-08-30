import type { z } from 'zod';
import type { Validator, ValidationResult } from '../types.js';

/**
 * Creates a Zod-based validator.
 */
export function zodAdapter<T extends z.ZodType>(schema: T): Validator<z.infer<T>> {
	return {
		validate(data: unknown): ValidationResult<z.infer<T>> {
			const result = schema.safeParse(data);
			if (result.success) {
				return { success: true, data: result.data };
			} else {
				const errors: Record<string, string[]> = {};
				result.error.issues.forEach((issue) => {
					const path = issue.path.join('.');
					if (!errors[path]) {
						errors[path] = [];
					}
					errors[path].push(issue.message);
				});
				return { success: false, errors, data: data as z.infer<T> };
			}
		}
	};
}
