# TypeScript Unified Validation

![NPM Version](https://img.shields.io/npm/v/%2540shambay%252Fvalidation?logo=npm&logoColor=red)
[![CI](https://github.com/sham-bay/ts-validation/actions/workflows/publish-to-npm.yml/badge.svg)](https://github.com/sham-bay/ts-validation/actions/workflows/publish-to-npm.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Unified validation abstraction layer with pluggable adapters (Zod, Yup, Joi, etc.)

One API – many validators. Switch between validation libraries without changing your application code.

## Features

- Single interface – `Validator<T>` with `validate()` method
- Pluggable adapters – Zod, Yup, Joi, and more (just add your own)
- Dynamic imports – adapter loads only when used; no unnecessary bloat
- Typed results – `ValidationResult<T>` with `success` flag and typed `data` or `errors`
- Zero‑cost abstraction – no performance penalty, just a thin wrapper
- Fully typed – TypeScript‑first, with full inference support

## Installation

```bash
npm install @shambay/validation
```

Then install the validation library you need (only **one** is required, the rest are optional):

```bash
npm install zod
# or
npm install yup
# or
npm install joi
```

## Quick Start

### With Zod

```typescript
import { zodAdapter } from '@shambay/validation';
import { z } from 'zod';

const userSchema = z.object({
	name: z.string().min(2),
	age: z.number().positive()
});

const validator = await zodAdapter(userSchema);

const result = validator.validate({ name: 'John', age: 30 });
if (result.success) {
	console.log(result.data); // { name: 'John', age: 30 }
} else {
	console.error(result.errors); // { 'name': ['String must contain at least 2 character(s)'] }
}
```

### With Yup (example – once implemented)

```typescript
import { yupAdapter } from '@shambay/validation';
import * as yup from 'yup';

const schema = yup.object({
	name: yup.string().min(2).required(),
	age: yup.number().positive().required()
});

const validator = await yupAdapter(schema);
// same `validate()` API
```

### With Joi (example – once implemented)

```typescript
import { joiAdapter } from '@shambay/validation';
import Joi from 'joi';

const schema = Joi.object({
	name: Joi.string().min(2).required(),
	age: Joi.number().positive().required()
});

const validator = await joiAdapter(schema);
// same `validate()` API
```

## API Reference

### `Validator<T>`

```typescript
interface Validator<T> {
	validate(data: unknown): ValidationResult<T>;
}
```

### `ValidationResult<T>`

```typescript
type ValidationResult<T> =
	{ success: true; data: T } | { success: false; errors: Record<string, string[]>; data?: T };
```

- **`success: true`** – validation passed; `data` contains the validated value (type `T`).
- **`success: false`** – validation failed; `errors` is an object where keys are field paths and values are arrays of error messages.

### Adapters

All adapters are asynchronous factories that return a `Validator`:

- `zodAdapter<T>(schema: z.ZodType<T>): Promise<Validator<T>>`
- `yupAdapter<T>(schema: yup.Schema<T>): Promise<Validator<T>>` _(coming soon)_
- `joiAdapter<T>(schema: joi.Schema<T>): Promise<Validator<T>>` _(coming soon)_

## Custom Adapter

You can easily implement your own adapter by implementing the `Validator` interface:

```typescript
import type { Validator, ValidationResult } from '@shambay/validation';

function myValidator<T>(): Validator<T> {
  return {
    validate(data: unknown): ValidationResult<T> {
      // your custom logic
      if (/* valid */) {
        return { success: true, data: data as T };
      } else {
        return { success: false, errors: { '': ['Invalid'] } };
      }
    },
  };
}
```

## Why this abstraction?

- Library‑agnostic – your business logic doesn't depend on a specific validation library.
- Easy migration – switch from Zod to Yup (or vice‑versa) with minimal changes.
- Testability – mock the `Validator` interface in unit tests.
- Lightweight – adapters are loaded on‑demand, so you only pay for what you use.

## License

Apache 2.0 © [Sham Bay](https://github.com/sham-bay)
