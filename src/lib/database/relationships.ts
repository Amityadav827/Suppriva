import { DATABASE_TABLES } from "./constants";

export type Relationship = {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: "one-to-many" | "many-to-one" | "one-to-one";
  description: string;
};

export const databaseRelationships: Relationship[] = [
  {
    fromTable: DATABASE_TABLES.products,
    fromColumn: "category_id",
    toTable: DATABASE_TABLES.categories,
    toColumn: "id",
    type: "many-to-one",
    description: "Each product belongs to one category. Categories can contain many products.",
  },
  {
    fromTable: DATABASE_TABLES.blogs,
    fromColumn: "category_id",
    toTable: DATABASE_TABLES.categories,
    toColumn: "id",
    type: "many-to-one",
    description: "Each blog can belong to one category. Categories can contain many blogs.",
  },
  {
    fromTable: DATABASE_TABLES.blogs,
    fromColumn: "author_id",
    toTable: DATABASE_TABLES.authors,
    toColumn: "id",
    type: "many-to-one",
    description: "Each blog can have one author. Authors can write many blogs.",
  },
  {
    fromTable: DATABASE_TABLES.productIngredients,
    fromColumn: "product_id",
    toTable: DATABASE_TABLES.products,
    toColumn: "id",
    type: "many-to-one",
    description: "Each product ingredient relation belongs to one product.",
  },
  {
    fromTable: DATABASE_TABLES.productIngredients,
    fromColumn: "ingredient_id",
    toTable: DATABASE_TABLES.ingredients,
    toColumn: "id",
    type: "many-to-one",
    description: "Each product ingredient relation belongs to one ingredient.",
  },
  {
    fromTable: DATABASE_TABLES.affiliateClicks,
    fromColumn: "product_id",
    toTable: DATABASE_TABLES.products,
    toColumn: "id",
    type: "many-to-one",
    description: "Each affiliate click belongs to one product. Products can have many clicks.",
  },
];

export const relationshipDiagram = `
categories
  ├─ products
  └─ blogs

authors
  └─ blogs

products
  ├─ product_ingredients
  └─ affiliate_clicks

ingredients
  └─ product_ingredients
`;
