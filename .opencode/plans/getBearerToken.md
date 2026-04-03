# Plan: Implement getBearerToken Function

## Current State
- `src/auth.ts` has a stub for `getBearerToken(req: Request): string` (lines 60-61)
- `src/auth.test.ts` has tests for password hashing and JWT validation, but no tests for `getBearerToken`
- `src/api/errors.ts` has `UserNotAuthenticatedError` available for throwing errors

## Implementation Plan

### 1. Implement `getBearerToken` in `src/auth.ts`
Replace the empty function body with:
```typescript
export function getBearerToken(req: Request): string {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new UserNotAuthenticatedError("Authorization header not found");
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    throw new UserNotAuthenticatedError("Invalid authorization header");
  }

  return token;
}
```

This:
- Uses `req.get("Authorization")` to retrieve the header
- Throws `UserNotAuthenticatedError` if header is missing
- Strips the `Bearer ` prefix (case-insensitive) and trims whitespace
- Throws an error if no token remains after stripping
- Returns the clean token string

### 2. Add Unit Tests in `src/auth.test.ts`

Add a new test describe block for `getBearerToken`:

```typescript
import { getBearerToken } from "./auth.js";

describe("getBearerToken", () => {
  it("should return the token from a valid Authorization header", () => {
    const req = { get: () => "Bearer mytoken123" } as unknown as Request;
    expect(getBearerToken(req)).toBe("mytoken123");
  });

  it("should throw an error when Authorization header is missing", () => {
    const req = { get: () => undefined } as unknown as Request;
    expect(() => getBearerToken(req)).toThrow(UserNotAuthenticatedError);
  });

  it("should throw an error when Authorization header has no Bearer prefix", () => {
    const req = { get: () => "mytoken123" } as unknown as Request;
    expect(() => getBearerToken(req)).toThrow(UserNotAuthenticatedError);
  });

  it("should handle extra whitespace around the token", () => {
    const req = { get: () => "Bearer   mytoken123  " } as unknown as Request;
    expect(getBearerToken(req)).toBe("mytoken123");
  });
});
```

### 3. Run Tests
Run `npm test` to verify all tests pass.
