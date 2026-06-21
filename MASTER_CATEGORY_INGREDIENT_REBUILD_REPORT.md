# Suppriva Master Category & Ingredient Rebuild Report

## Summary

- Total approved categories: 22
- Total approved ingredients: 100
- Total related ingredient links: 295
- Duplicate ingredient names: None
- Duplicate ingredient slugs: None

## Category Mapping Report

- Weight Loss: 11 ingredients
- General Wellness: 7 ingredients
- Men's Health: 6 ingredients
- Women's Health: 7 ingredients
- Hair Health: 4 ingredients
- Blood Sugar & Diabetes: 9 ingredients
- Bone & Joint Health: 3 ingredients
- Gut Health: 8 ingredients
- Brain & Memory: 8 ingredients
- Sleep & Relaxation: 8 ingredients
- Heart Health: 5 ingredients
- Immunity: 7 ingredients
- Skin Care: 2 ingredients
- Sexual Health: 2 ingredients
- Energy & Athletic Performance: 3 ingredients
- Prostate Health: 2 ingredients
- Lung Health: 2 ingredients
- Nervous System Health: 2 ingredients
- Vision Health: 1 ingredients
- Hearing Health: 1 ingredients
- Teeth & Gums: 1 ingredients
- Nail Care: 1 ingredients

## Generated Files

- `supabase/migrations/202606210201_master_category_ingredient_rebuild.sql`
- `SUPABASE_MASTER_CATEGORY_INGREDIENT_REBUILD.sql`

## Backup Tables Used

- `public.category_backups`
- `public.ingredient_backups`
- `public.product_ingredient_backups`

## Notes

- Legacy categories are remapped to the approved 22-category system before archive.
- Legacy ingredients are backed up, canonicalized where possible, and archived after master seeding.
- Ingredient-to-product relationships are rebuilt from existing `products.ingredients` JSON using canonical slug aliases.
