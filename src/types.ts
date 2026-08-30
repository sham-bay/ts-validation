export type ValidationResult<T> =
	{ success: true; data: T } | { success: false; errors: Record<string, string[]>; data?: T };

export interface Validator<T> {
	validate(data: unknown): ValidationResult<T>;
}
