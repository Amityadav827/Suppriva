# SUPPRIVA Supabase Foundation

This foundation prepares SUPPRIVA for future Supabase integration without connecting a real backend yet.

No Supabase package was installed, no credentials were added, no CRUD APIs were created, and no frontend pages were modified.

## Folder Architecture

`src/lib/supabase/`
- `env.ts`: reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `client.ts`: browser-client placeholder factory.
- `server.ts`: server-client placeholder factory.
- `middleware.ts`: middleware context placeholder.

`src/repositories/`
- Repository interfaces for future data access.
- No implementation yet.
- Includes `ProductsRepository`, `CategoriesRepository`, `BlogsRepository`, `UsersRepository`, and `SeoRepository`.

`src/services/`
- Service placeholders that accept repositories through constructors.
- No business logic yet.
- Includes `ProductService`, `BlogService`, `CategoryService`, and `SeoService`.

`src/lib/validators/`
- Placeholder validators for products, blogs, and categories.
- Ready to be replaced with Zod or another validation library later.

`src/lib/errors/`
- Shared error classes:
  - `AppError`
  - `DatabaseError`
  - `ValidationError`

## Repository Pattern

Repositories define the persistence contract:

1. `getAll()`
2. `getById(id)`
3. `getBySlug(slug)` where applicable
4. `create(input)`
5. `update(id, input)`
6. `delete(id)`

Future Supabase implementations should live behind these interfaces, so UI and services do not depend directly on Supabase queries.

## Service Pattern

Services will orchestrate business rules later:

1. Validate input.
2. Call repository methods.
3. Normalize errors.
4. Return domain-ready data to API routes or server actions.

Current service classes are intentionally thin placeholders.

## Future CRUD Flow

Future request flow:

1. Dashboard form submits data.
2. API route or server action receives request.
3. Validator checks payload.
4. Service applies business rules.
5. Repository performs Supabase query.
6. Service maps errors to `AppError`, `DatabaseError`, or `ValidationError`.
7. UI receives typed response.

## Future Dashboard Integration

Dashboard pages can map to services like this:

- `/dashboard/products` -> `ProductService` -> `ProductsRepository`
- `/dashboard/categories` -> `CategoryService` -> `CategoriesRepository`
- `/dashboard/blogs` -> `BlogService` -> `BlogsRepository`
- `/dashboard/seo` -> `SeoService` -> `SeoRepository`
- `/dashboard/users` -> future `UserService` -> `UsersRepository`

## Environment

Use `.env.local` later with:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`.env.example` is included as the safe template.

## Supabase Readiness

This architecture is ready for:

- `@supabase/supabase-js`
- Supabase SSR helpers
- Server actions
- API routes
- Dashboard CRUD
- Typed repository implementations
- Validation library integration
- Centralized error handling

The project is prepared for Supabase integration while keeping the current app fully static and UI-only.
