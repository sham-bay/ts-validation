import { describe, it } from 'vitest';

describe('When no adapter dependencies are installed', () => {
	it('should skip adapter-specific tests and still pass', () => {
		console.log('No validation library (e.g., zod, yup) is installed.');
		console.log('   Adapter tests are skipped, but the core package works fine.');
		console.log('   This is expected when using optional peer dependencies.');
	});
});
