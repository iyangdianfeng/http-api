# http-api

> ⚠️ **Development Status**: This library is currently in early development stage. The API interface and functionality may change significantly in future releases. While it's functional for basic use cases, some advanced features and comprehensive error handling are still being developed. Use with caution in production environments.

A lightweight and powerful TypeScript library for defining and consuming HTTP APIs with ease. This library provides a simple and intuitive way to define your API endpoints and their types, making HTTP requests more type-safe and maintainable.

## Features

- **Type-Safe**: Full TypeScript support with automatic type inference
- **Simple API Definition**: Define your API endpoints with minimal boilerplate
- **Request/Response Type Validation**: Automatic type checking for requests and responses
- **ESM Support**: Built with modern ES modules
- **Flexible Configuration**: Easy to customize and extend

## Installation

```bash
npm install @your-username/http-api
```

## Usage

### Define Your API

```typescript
import { DefApi, BuildApi } from '@your-username/http-api';

// Define your API endpoints
const api = DefApi({
  getUserInfo: {
    method: 'GET',
    path: '/user/:id',
    params: {} as { id: string },
    query: {} as { include?: string[] },
    response: {} as {
      id: string;
      name: string;
      email: string;
    }
  },
  createUser: {
    method: 'POST',
    path: '/user',
    body: {} as {
      name: string;
      email: string;
    },
    response: {} as {
      id: string;
      success: boolean;
    }
  }
});

// Build your API client
const client = BuildApi(api, {
  baseURL: 'https://api.example.com'
});

// Use your typed API client
async function example() {
  // TypeScript will infer all types automatically
  const user = await client.getUserInfo({
    params: { id: '123' },
    query: { include: ['profile'] }
  });

  const newUser = await client.createUser({
    body: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  });
}
```

## Why Use This Library?

- **Type Safety**: Catch errors at compile time instead of runtime
- **Developer Experience**: Great autocomplete support and inline documentation
- **Maintainability**: Single source of truth for your API definitions
- **Productivity**: Reduce boilerplate code and focus on business logic

## API Reference

### DefApi

Defines your API endpoints with full type inference:

```typescript
const api = DefApi({
  endpointName: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    path: string,
    params?: Record<string, any>,
    query?: Record<string, any>,
    body?: any,
    response: any
  }
});
```

### BuildApi

Creates an API client from your API definition:

```typescript
const client = BuildApi(apiDefinition, {
  baseURL: string,
  headers?: Record<string, string>,
  // ... other configuration options
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
