import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const placeholderImage = "https://suppriva.vercel.app/assets/hero-supplements.webp";

const categories = [
  "Weight Loss",
  "General Wellness",
  "Men's Health",
  "Women's Health",
  "Hair Health",
  "Blood Sugar & Diabetes",
  "Bone & Joint Health",
  "Gut Health",
  "Brain & Memory",
  "Sleep & Relaxation",
  "Heart Health",
  "Immunity",
  "Skin Care",
  "Sexual Health",
  "Energy & Athletic Performance",
  "Prostate Health",
  "Lung Health",
  "Nervous System Health",
  "Vision Health",
  "Hearing Health",
  "Teeth & Gums",
  "Nail Care",
].map((title) => ({
  title,
  slug: slugify(title),
  description: `${title} category pages help readers compare relevant supplements, ingredients, and supporting blog content in one place.`,
  seoTitle: `${title} Supplements and Ingredients | Suppriva`,
  seoDescription: `Browse Suppriva's ${title.toLowerCase()} library to compare products, ingredient profiles, and practical wellness research in one place.`,
}));

const masterCategoryMap = new Map(categories.map((category) => [category.slug, category]));

const masterIngredients = flattenGroups({
  "sleep-relaxation": [
    ingredient("Ashwagandha (KSM-66)", {
      slug: "ashwagandha",
      scientificName: "Withania somnifera",
      evidenceLevel: "Moderate",
      featured: true,
      origin: "India",
      partUsed: "Root extract",
      form: "Capsule or powder",
      taste: "Earthy",
    }),
    ingredient("Melatonin", {
      evidenceLevel: "Strong",
      featured: true,
      partUsed: "Nutrient compound",
      form: "Capsule, gummy, or tablet",
      taste: "Neutral",
    }),
    ingredient("Magnesium Glycinate", {
      slug: "magnesium-glycinate",
      evidenceLevel: "Strong",
      featured: true,
      partUsed: "Mineral chelate",
      form: "Capsule or powder",
      taste: "Neutral",
    }),
    ingredient("Valerian Root", {
      scientificName: "Valeriana officinalis",
      partUsed: "Root extract",
      form: "Capsule or tincture",
      taste: "Earthy and bitter",
    }),
    ingredient("Passionflower", {
      scientificName: "Passiflora incarnata",
      partUsed: "Aerial parts extract",
      form: "Capsule or tea blend",
      taste: "Mild herbal",
    }),
    ingredient("5-HTP", {
      slug: "5-htp",
      scientificName: "5-Hydroxytryptophan",
      evidenceLevel: "Moderate",
      featured: true,
      origin: "West Africa",
      partUsed: "Seed extract derivative",
      form: "Capsule",
      taste: "Neutral",
    }),
    ingredient("California Poppy Seed", {
      scientificName: "Eschscholzia californica",
      partUsed: "Seed and aerial parts",
      form: "Capsule or tincture",
      taste: "Mild herbal",
    }),
    ingredient("Chamomile Extract", {
      scientificName: "Matricaria chamomilla",
      partUsed: "Flower extract",
      form: "Capsule or tea blend",
      taste: "Floral",
    }),
  ],
  "nervous-system-health": [
    ingredient("Holy Basil (Tulsi)", {
      slug: "holy-basil",
      scientificName: "Ocimum tenuiflorum",
      partUsed: "Leaf extract",
      form: "Capsule or tincture",
      taste: "Herbal and spicy",
    }),
    ingredient("Schisandra Berry", {
      scientificName: "Schisandra chinensis",
      partUsed: "Berry extract",
      form: "Capsule or powder",
      taste: "Tart and earthy",
    }),
  ],
  "brain-memory": [
    ingredient("Bacopa Monnieri", {
      scientificName: "Bacopa monnieri",
      featured: true,
      partUsed: "Whole herb extract",
      form: "Capsule",
      taste: "Herbal and bitter",
    }),
    ingredient("Lion's Mane Mushroom", {
      slug: "lions-mane",
      scientificName: "Hericium erinaceus",
      featured: true,
      partUsed: "Fruiting body extract",
      form: "Capsule or powder",
      taste: "Savory and mild",
    }),
    ingredient("Phosphatidylserine", {
      evidenceLevel: "Moderate",
      partUsed: "Phospholipid compound",
      form: "Softgel or capsule",
      taste: "Neutral",
    }),
    ingredient("L-Theanine", {
      slug: "l-theanine",
      evidenceLevel: "Moderate",
      featured: true,
      partUsed: "Tea-derived amino acid",
      form: "Capsule or gummy",
      taste: "Mild savory",
    }),
    ingredient("Huperzine A", {
      partUsed: "Moss-derived compound",
      form: "Capsule",
      taste: "Neutral",
    }),
    ingredient("Alpha-GPC", {
      evidenceLevel: "Moderate",
      partUsed: "Choline compound",
      form: "Capsule or powder",
      taste: "Neutral",
    }),
    ingredient("Citicoline", {
      evidenceLevel: "Moderate",
      partUsed: "Choline compound",
      form: "Capsule",
      taste: "Neutral",
    }),
    ingredient("DMAE", {
      partUsed: "Nutrient compound",
      form: "Capsule",
      taste: "Neutral",
    }),
  ],
  "hearing-health": [
    ingredient("Ginkgo Biloba", {
      scientificName: "Ginkgo biloba",
      evidenceLevel: "Moderate",
      partUsed: "Leaf extract",
      form: "Capsule or tablet",
      taste: "Herbal and slightly bitter",
    }),
  ],
  "energy-athletic-performance": [
    ingredient("Rhodiola Rosea", {
      slug: "rhodiola-rosea",
      scientificName: "Rhodiola rosea",
      evidenceLevel: "Moderate",
      featured: true,
      partUsed: "Root extract",
      form: "Capsule",
      taste: "Bitter and floral",
    }),
    ingredient("Eleuthero (Siberian Ginseng)", {
      slug: "eleuthero",
      scientificName: "Eleutherococcus senticosus",
      partUsed: "Root extract",
      form: "Capsule",
      taste: "Earthy and bitter",
    }),
    ingredient("Cordyceps Extract", {
      scientificName: "Cordyceps militaris",
      partUsed: "Fruiting body extract",
      form: "Capsule or powder",
      taste: "Earthy",
    }),
  ],
  "sexual-health": [
    ingredient("Maca Root", {
      scientificName: "Lepidium meyenii",
      partUsed: "Root powder",
      form: "Capsule or powder",
      taste: "Malty and earthy",
    }),
    ingredient("Cnidium Monnieri", {
      scientificName: "Cnidium monnieri",
      partUsed: "Seed extract",
      form: "Capsule",
      taste: "Herbal",
    }),
  ],
  "blood-sugar-diabetes": [
    ingredient("Berberine", {
      slug: "berberine",
      evidenceLevel: "Moderate",
      featured: true,
      partUsed: "Root and bark extract",
      form: "Capsule",
      taste: "Bitter",
    }),
    ingredient("Chromium Picolinate", {
      partUsed: "Trace mineral compound",
      form: "Capsule",
      taste: "Neutral",
    }),
    ingredient("Cinnamon Bark Extract", {
      partUsed: "Bark extract",
      form: "Capsule",
      taste: "Warm and spicy",
    }),
    ingredient("Gymnema Sylvestre", {
      scientificName: "Gymnema sylvestre",
      partUsed: "Leaf extract",
      form: "Capsule",
      taste: "Herbal",
    }),
    ingredient("Bitter Melon Extract", {
      scientificName: "Momordica charantia",
      partUsed: "Fruit extract",
      form: "Capsule",
      taste: "Bitter",
    }),
    ingredient("Banaba Leaf Extract", {
      scientificName: "Lagerstroemia speciosa",
      partUsed: "Leaf extract",
      form: "Capsule",
      taste: "Herbal",
    }),
    ingredient("Alpha Lipoic Acid (ALA)", {
      slug: "alpha-lipoic-acid",
      evidenceLevel: "Moderate",
      partUsed: "Antioxidant compound",
      form: "Capsule",
      taste: "Neutral",
    }),
    ingredient("Corosolic Acid", {
      partUsed: "Plant-derived compound",
      form: "Capsule",
      taste: "Neutral",
    }),
    ingredient("Berberine HCl", {
      slug: "berberine-hcl",
      evidenceLevel: "Moderate",
      partUsed: "Alkaloid salt compound",
      form: "Capsule",
      taste: "Bitter",
    }),
  ],
  "weight-loss": [
    ingredient("Green Tea Extract (EGCG)", {
      slug: "green-tea-extract",
      evidenceLevel: "Moderate",
      partUsed: "Leaf extract",
      form: "Capsule",
      taste: "Herbal",
    }),
    ingredient("Garcinia Cambogia", {
      partUsed: "Fruit rind extract",
      form: "Capsule",
      taste: "Tart",
    }),
    ingredient("Glucomannan", {
      evidenceLevel: "Moderate",
      partUsed: "Fiber root extract",
      form: "Capsule or powder",
      taste: "Neutral",
    }),
    ingredient("Green Coffee Bean Extract", {
      partUsed: "Coffee bean extract",
      form: "Capsule",
      taste: "Earthy and bitter",
    }),
    ingredient("Cayenne Pepper (Capsaicin)", {
      slug: "cayenne-pepper",
      partUsed: "Pepper fruit extract",
      form: "Capsule",
      taste: "Hot and spicy",
    }),
    ingredient("Raspberry Ketones", {
      partUsed: "Aromatic compound",
      form: "Capsule",
      taste: "Sweet and fruity",
    }),
    ingredient("CLA (Conjugated Linoleic Acid)", {
      slug: "cla",
      evidenceLevel: "Moderate",
      partUsed: "Fatty acid compound",
      form: "Softgel",
      taste: "Neutral",
    }),
    ingredient("L-Carnitine", {
      partUsed: "Amino acid derivative",
      form: "Capsule or liquid",
      taste: "Neutral",
    }),
    ingredient("Coleus Forskohlii (Forskolin)", {
      slug: "coleus-forskohlii",
      scientificName: "Coleus forskohlii",
      partUsed: "Root extract",
      form: "Capsule",
      taste: "Earthy",
    }),
    ingredient("African Mango Extract", {
      partUsed: "Seed extract",
      form: "Capsule",
      taste: "Neutral",
    }),
    ingredient("Apple Cider Vinegar", {
      slug: "apple-cider-vinegar",
      featured: true,
      partUsed: "Fermented apple liquid or powder",
      form: "Capsule, gummy, or liquid",
      taste: "Sharp and acidic",
    }),
  ],
  "gut-health": [
    ingredient("Lactobacillus Acidophilus", {
      partUsed: "Probiotic culture strain",
      form: "Capsule",
      taste: "Neutral",
    }),
    ingredient("Bifidobacterium Longum", {
      partUsed: "Probiotic culture strain",
      form: "Capsule",
      taste: "Neutral",
    }),
    ingredient("Bacillus Coagulans", {
      partUsed: "Probiotic culture strain",
      form: "Capsule",
      taste: "Neutral",
    }),
    ingredient("Inulin (Prebiotic Fiber)", {
      slug: "inulin",
      partUsed: "Prebiotic fiber",
      form: "Powder or capsule",
      taste: "Mildly sweet",
    }),
    ingredient("Chicory Root Inulin", {
      scientificName: "Cichorium intybus",
      partUsed: "Root fiber extract",
      form: "Powder",
      taste: "Mildly sweet",
    }),
    ingredient("Psyllium Husk", {
      evidenceLevel: "Strong",
      partUsed: "Seed husk fiber",
      form: "Powder or capsule",
      taste: "Neutral",
    }),
    ingredient("Digestive Enzymes", {
      partUsed: "Enzyme blend",
      form: "Capsule",
      taste: "Neutral",
    }),
    ingredient("Aloe Vera", {
      scientificName: "Aloe barbadensis miller",
      partUsed: "Leaf gel extract",
      form: "Capsule or liquid",
      taste: "Mild bitter",
    }),
  ],
  "general-wellness": [
    ingredient("Ginger Root", {
      scientificName: "Zingiber officinale",
      partUsed: "Root extract",
      form: "Capsule or tea blend",
      taste: "Warm and spicy",
    }),
    ingredient("Dandelion Root", {
      scientificName: "Taraxacum officinale",
      partUsed: "Root extract",
      form: "Capsule or tea blend",
      taste: "Earthy and bitter",
    }),
    ingredient("Milk Thistle (Silymarin)", {
      slug: "milk-thistle",
      scientificName: "Silybum marianum",
      partUsed: "Seed extract",
      form: "Capsule",
      taste: "Mild and earthy",
    }),
    ingredient("Artichoke Extract", {
      scientificName: "Cynara scolymus",
      partUsed: "Leaf extract",
      form: "Capsule",
      taste: "Herbal",
    }),
    ingredient("Dandelion Extract", {
      scientificName: "Taraxacum officinale",
      partUsed: "Root and leaf extract",
      form: "Capsule",
      taste: "Earthy and bitter",
    }),
    ingredient("Chlorella", {
      partUsed: "Microalgae powder",
      form: "Powder or tablet",
      taste: "Earthy",
    }),
    ingredient("BioPerine (Black Pepper Extract)", {
      slug: "bioperine",
      partUsed: "Fruit extract",
      form: "Capsule",
      taste: "Peppery",
    }),
  ],
  "mens-health": [
    ingredient("Tongkat Ali", {
      scientificName: "Eurycoma longifolia",
      partUsed: "Root extract",
      form: "Capsule",
      taste: "Bitter",
    }),
    ingredient("Tribulus Terrestris", {
      scientificName: "Tribulus terrestris",
      partUsed: "Fruit and aerial parts extract",
      form: "Capsule",
      taste: "Herbal",
    }),
    ingredient("Fenugreek Extract", {
      partUsed: "Seed extract",
      form: "Capsule",
      taste: "Nutty and bitter",
    }),
    ingredient("D-Aspartic Acid", {
      partUsed: "Amino acid compound",
      form: "Powder or capsule",
      taste: "Neutral",
    }),
    ingredient("Boron", {
      partUsed: "Trace mineral compound",
      form: "Capsule",
      taste: "Neutral",
    }),
    ingredient("Chrysin", {
      partUsed: "Flavonoid compound",
      form: "Capsule",
      taste: "Neutral",
    }),
  ],
  "prostate-health": [
    ingredient("Saw Palmetto", {
      scientificName: "Serenoa repens",
      partUsed: "Berry extract",
      form: "Softgel or capsule",
      taste: "Neutral",
    }),
    ingredient("Zinc", {
      partUsed: "Trace mineral compound",
      form: "Capsule",
      taste: "Neutral",
    }),
  ],
  "womens-health": [
    ingredient("Vitex (Chaste Tree Berry)", {
      slug: "vitex",
      scientificName: "Vitex agnus-castus",
      partUsed: "Berry extract",
      form: "Capsule",
      taste: "Herbal",
    }),
    ingredient("Dong Quai", {
      scientificName: "Angelica sinensis",
      partUsed: "Root extract",
      form: "Capsule",
      taste: "Earthy",
    }),
    ingredient("Black Cohosh Root", {
      scientificName: "Actaea racemosa",
      partUsed: "Root extract",
      form: "Capsule",
      taste: "Bitter",
    }),
    ingredient("Evening Primrose Oil", {
      scientificName: "Oenothera biennis",
      partUsed: "Seed oil",
      form: "Softgel",
      taste: "Neutral",
    }),
    ingredient("Folate (Methylfolate)", {
      slug: "folate",
      partUsed: "Vitamin compound",
      form: "Capsule or tablet",
      taste: "Neutral",
    }),
    ingredient("Iron Bisglycinate", {
      partUsed: "Mineral chelate",
      form: "Capsule",
      taste: "Neutral",
    }),
    ingredient("DIM (Diindolylmethane)", {
      slug: "dim",
      partUsed: "Plant-derived compound",
      form: "Capsule",
      taste: "Neutral",
    }),
  ],
  "nail-care": [
    ingredient("Biotin (Vitamin B7)", {
      slug: "biotin",
      evidenceLevel: "Moderate",
      partUsed: "Vitamin compound",
      form: "Capsule or gummy",
      taste: "Neutral",
    }),
  ],
  "hair-health": [
    ingredient("Collagen Peptides", {
      partUsed: "Hydrolyzed peptides",
      form: "Powder",
      taste: "Neutral",
    }),
    ingredient("Horsetail Extract (Silica)", {
      slug: "horsetail-extract",
      scientificName: "Equisetum arvense",
      partUsed: "Aerial parts extract",
      form: "Capsule",
      taste: "Herbal",
    }),
    ingredient("Fo-Ti (He Shou Wu)", {
      slug: "fo-ti",
      scientificName: "Reynoutria multiflora",
      partUsed: "Root extract",
      form: "Capsule",
      taste: "Earthy",
    }),
    ingredient("Bamboo Extract", {
      partUsed: "Stem silica extract",
      form: "Capsule",
      taste: "Neutral",
    }),
  ],
  "skin-care": [
    ingredient("Hyaluronic Acid", {
      partUsed: "Hydration-support compound",
      form: "Capsule",
      taste: "Neutral",
    }),
    ingredient("Bearberry Extract (Arbutin)", {
      slug: "bearberry-extract",
      scientificName: "Arctostaphylos uva-ursi",
      partUsed: "Leaf extract",
      form: "Capsule",
      taste: "Herbal",
    }),
  ],
  "vision-health": [
    ingredient("Astaxanthin", {
      evidenceLevel: "Moderate",
      partUsed: "Carotenoid compound",
      form: "Softgel",
      taste: "Neutral",
    }),
  ],
  "heart-health": [
    ingredient("Omega-3 (EPA/DHA)", {
      slug: "omega-3",
      evidenceLevel: "Strong",
      featured: true,
      partUsed: "Marine oil concentrate",
      form: "Softgel",
      taste: "Neutral",
    }),
    ingredient("CoQ10 (Coenzyme Q10)", {
      slug: "coq10",
      evidenceLevel: "Strong",
      partUsed: "Coenzyme compound",
      form: "Softgel or capsule",
      taste: "Neutral",
    }),
    ingredient("Beet Root Extract", {
      partUsed: "Root extract",
      form: "Capsule or powder",
      taste: "Earthy and sweet",
    }),
    ingredient("Arjuna Bark Extract", {
      scientificName: "Terminalia arjuna",
      partUsed: "Bark extract",
      form: "Capsule",
      taste: "Bitter",
    }),
    ingredient("Vitamin K2 (MK-7)", {
      slug: "vitamin-k2",
      evidenceLevel: "Moderate",
      partUsed: "Vitamin compound",
      form: "Softgel or capsule",
      taste: "Neutral",
    }),
  ],
  "bone-joint-health": [
    ingredient("Bromelain", {
      partUsed: "Pineapple enzyme extract",
      form: "Capsule",
      taste: "Mild fruit",
    }),
    ingredient("Magnesium", {
      partUsed: "Mineral compound",
      form: "Capsule or powder",
      taste: "Neutral",
    }),
    ingredient("Turmeric (Curcumin + BioPerine)", {
      slug: "turmeric-curcumin",
      scientificName: "Curcuma longa",
      evidenceLevel: "Moderate",
      featured: true,
      partUsed: "Rhizome extract",
      form: "Capsule",
      taste: "Warm and earthy",
    }),
  ],
  "teeth-gums": [
    ingredient("Vitamin C", {
      evidenceLevel: "Strong",
      partUsed: "Vitamin compound",
      form: "Capsule, tablet, or powder",
      taste: "Citrus and tart",
    }),
  ],
  "immunity": [
    ingredient("Vitamin D3", {
      evidenceLevel: "Strong",
      partUsed: "Vitamin compound",
      form: "Softgel or capsule",
      taste: "Neutral",
    }),
    ingredient("Elderberry Extract", {
      scientificName: "Sambucus nigra",
      partUsed: "Berry extract",
      form: "Capsule, syrup, or gummy",
      taste: "Berry sweet",
    }),
    ingredient("Quercetin", {
      partUsed: "Plant flavonoid compound",
      form: "Capsule",
      taste: "Neutral",
    }),
    ingredient("Zinc (as Zinc Picolinate)", {
      slug: "zinc-picolinate",
      evidenceLevel: "Moderate",
      partUsed: "Trace mineral compound",
      form: "Capsule",
      taste: "Neutral",
    }),
    ingredient("Echinacea Extract", {
      scientificName: "Echinacea purpurea",
      partUsed: "Aerial parts extract",
      form: "Capsule or tincture",
      taste: "Herbal",
    }),
    ingredient("Astragalus Root", {
      scientificName: "Astragalus membranaceus",
      partUsed: "Root extract",
      form: "Capsule",
      taste: "Mild and earthy",
    }),
    ingredient("Chaga Mushroom Extract", {
      scientificName: "Inonotus obliquus",
      partUsed: "Mushroom extract",
      form: "Capsule or powder",
      taste: "Earthy",
    }),
  ],
  "lung-health": [
    ingredient("Black Seed Oil (Nigella Sativa)", {
      slug: "black-seed-oil",
      scientificName: "Nigella sativa",
      partUsed: "Seed oil",
      form: "Softgel",
      taste: "Peppery",
    }),
    ingredient("NAC (N-Acetyl Cysteine)", {
      slug: "nac",
      evidenceLevel: "Moderate",
      partUsed: "Amino acid derivative",
      form: "Capsule",
      taste: "Neutral",
    }),
  ],
});

const ingredientNames = new Set(masterIngredients.map((item) => item.name));
if (ingredientNames.size !== masterIngredients.length) {
  throw new Error("Duplicate ingredient names detected in master list.");
}
const ingredientSlugs = new Set(masterIngredients.map((item) => item.slug));
if (ingredientSlugs.size !== masterIngredients.length) {
  throw new Error("Duplicate ingredient slugs detected in master list.");
}

const categoryCounts = new Map();
for (const ingredient of masterIngredients) {
  categoryCounts.set(
    ingredient.categorySlug,
    (categoryCounts.get(ingredient.categorySlug) ?? 0) + 1,
  );
}

const categoryFallbacks = {
  "nail-care": ["hair-health", "skin-care"],
  "vision-health": ["heart-health", "brain-memory"],
  "hearing-health": ["brain-memory", "nervous-system-health"],
  "teeth-gums": ["immunity", "bone-joint-health"],
  "lung-health": ["immunity", "general-wellness"],
  "prostate-health": ["mens-health", "sexual-health"],
  "sexual-health": ["mens-health", "womens-health"],
  "nervous-system-health": ["sleep-relaxation", "brain-memory"],
  "skin-care": ["hair-health", "general-wellness"],
};

const explicitRelated = {
  berberine: ["chromium-picolinate", "cinnamon-bark-extract", "gymnema-sylvestre"],
  "berberine-hcl": ["berberine", "chromium-picolinate", "alpha-lipoic-acid"],
  melatonin: ["5-htp", "valerian-root", "magnesium-glycinate"],
  "lions-mane": ["bacopa-monnieri", "alpha-gpc", "citicoline"],
  ashwagandha: ["rhodiola-rosea", "l-theanine", "holy-basil"],
  "magnesium-glycinate": ["melatonin", "5-htp", "valerian-root"],
  "turmeric-curcumin": ["bromelain", "magnesium", "collagen-peptides"],
  "omega-3": ["coq10", "beet-root-extract", "vitamin-k2"],
  "green-tea-extract": ["green-coffee-bean-extract", "l-carnitine", "african-mango-extract"],
  "5-htp": ["melatonin", "valerian-root", "magnesium-glycinate"],
};

const ingredientsByCategory = new Map();
for (const ingredient of masterIngredients) {
  const bucket = ingredientsByCategory.get(ingredient.categorySlug) ?? [];
  bucket.push(ingredient);
  ingredientsByCategory.set(ingredient.categorySlug, bucket);
}

for (const ingredient of masterIngredients) {
  const sameCategory = (ingredientsByCategory.get(ingredient.categorySlug) ?? [])
    .filter((item) => item.slug !== ingredient.slug)
    .map((item) => item.slug);
  const fallbackCategories = categoryFallbacks[ingredient.categorySlug] ?? [];
  const fallbackSlugs = fallbackCategories.flatMap(
    (categorySlug) => (ingredientsByCategory.get(categorySlug) ?? []).map((item) => item.slug),
  );
  const combined = [
    ...(explicitRelated[ingredient.slug] ?? []),
    ...sameCategory,
    ...fallbackSlugs,
  ];
  ingredient.relatedSlugs = [...new Set(combined)]
    .filter((slug) => slug !== ingredient.slug)
    .slice(0, 3);
}

const relationshipCount = masterIngredients.reduce(
  (count, ingredient) => count + ingredient.relatedSlugs.length,
  0,
);

const migrationPath = path.join(
  repoRoot,
  "supabase",
  "migrations",
  "202606210201_master_category_ingredient_rebuild.sql",
);
const rootSqlPath = path.join(repoRoot, "SUPABASE_MASTER_CATEGORY_INGREDIENT_REBUILD.sql");
const reportPath = path.join(repoRoot, "MASTER_CATEGORY_INGREDIENT_REBUILD_REPORT.md");

const sql = generateSql();
const report = generateReport();

fs.writeFileSync(migrationPath, sql, "utf8");
fs.writeFileSync(rootSqlPath, sql, "utf8");
fs.writeFileSync(reportPath, report, "utf8");

console.log(
  JSON.stringify(
    {
      categories: categories.length,
      ingredients: masterIngredients.length,
      relationshipCount,
      migrationPath: path.relative(repoRoot, migrationPath),
      reportPath: path.relative(repoRoot, reportPath),
    },
    null,
    2,
  ),
);

function generateSql() {
  const categoryValues = categories
    .map(
      (category) =>
        `  (${sqlString(category.title)}, ${sqlString(category.slug)}, ${sqlString(category.description)}, ${sqlString(category.seoTitle)}, ${sqlString(category.seoDescription)})`,
    )
    .join(",\n");

  const ingredientValues = masterIngredients
    .map((ingredient) => {
      const relatedJson = JSON.stringify(
        ingredient.relatedSlugs.map((slug) => {
          const relatedIngredient = masterIngredients.find((item) => item.slug === slug);
          return { slug, name: relatedIngredient?.name ?? slug };
        }),
      );

      const benefitsJson = JSON.stringify(
        categoryBenefits(ingredient.categorySlug).map((item) => ({
          title: item.title,
          description: item.description.replaceAll("{name}", ingredient.name),
        })),
      );

      const sideEffectsJson = JSON.stringify(
        categorySideEffects(ingredient.categorySlug).map((item) => ({
          title: item.title,
          description: item.description.replaceAll("{name}", ingredient.name),
        })),
      );

      const faqJson = JSON.stringify([
        {
          question: `What is ${ingredient.name} commonly used for?`,
          answer: `${ingredient.name} is commonly researched in routines focused on ${categoryFocus(
            ingredient.categorySlug,
          )}.`,
        },
        {
          question: `What should I compare before buying a ${ingredient.name} supplement?`,
          answer: `Review dose transparency, delivery format, complementary ingredients, and any safety notes connected to ${ingredient.name}.`,
        },
      ]);

      const drugInteractionsJson = JSON.stringify(categoryDrugInteractionNotes(ingredient.categorySlug));
      const avoidJson = JSON.stringify(categoryAvoidNotes(ingredient.categorySlug));

      return [
        sqlString(ingredient.name),
        sqlString(ingredient.slug),
        sqlString(masterCategoryMap.get(ingredient.categorySlug)?.title ?? "General Wellness"),
        sqlNullableString(ingredient.scientificName),
        sqlString(placeholderImage),
        sqlString(placeholderImage),
        ingredient.rating.toFixed(1),
        sqlString(ingredient.evidenceLevel),
        sqlNullableString(ingredient.origin ?? categoryOrigin(ingredient.categorySlug)),
        sqlNullableString(ingredient.partUsed ?? inferPartUsed(ingredient.name)),
        sqlNullableString(ingredient.form ?? inferForm(ingredient.name)),
        sqlNullableString(ingredient.taste ?? inferTaste(ingredient.name)),
        sqlString(categoryDose(ingredient.categorySlug)),
        sqlString(categoryBestFor(ingredient.categorySlug)),
        sqlString(categorySafety(ingredient.categorySlug)),
        sqlString(shortDescription(ingredient)),
        sqlString(fullDescription(ingredient)),
        sqlString(overviewContent(ingredient)),
        sqlString(howItWorksContent(ingredient)),
        sqlString(interestingFact(ingredient)),
        sqlString(categoryBenefitTitles(ingredient.categorySlug).join("; ")),
        `${sqlJson(benefitsJson)}::jsonb`,
        sqlString(categorySideEffectTitles(ingredient.categorySlug).join("; ")),
        `${sqlJson(sideEffectsJson)}::jsonb`,
        `${sqlJson(drugInteractionsJson)}::jsonb`,
        `${sqlJson(avoidJson)}::jsonb`,
        `${sqlJson(faqJson)}::jsonb`,
        `${sqlJson(relatedJson)}::jsonb`,
        sqlString(categoryDose(ingredient.categorySlug)),
        sqlString(howItWorksContent(ingredient)),
        sqlString(`${ingredient.name} Benefits and Safety | Suppriva`),
        sqlString(
          `Explore ${ingredient.name} in Suppriva's ${masterCategoryMap
            .get(ingredient.categorySlug)
            ?.title.toLowerCase()} library, including supplement positioning, category mapping, and practical safety notes.`,
        ),
        ingredient.featured ? "true" : "false",
        sqlString(JSON.stringify(ingredient.aliasSlugs)),
      ];
    })
    .map(
      (values) =>
        `  (${values.join(", ")})`,
    )
    .join(",\n");

  return `-- SUPPRIVA MASTER CATEGORY + INGREDIENT DATABASE REBUILD
-- Generated from the approved 22-category and 100-ingredient master list.
-- Safe to run in Supabase SQL Editor after reviewing backups.
-- This script creates backups, archives legacy records, standardizes categories,
-- seeds canonical ingredients, rebuilds related ingredient data, and refreshes
-- product_ingredients relationships from existing product JSON.

create extension if not exists "pgcrypto";

create or replace function public.suppriva_slugify(value text)
returns text
language sql
immutable
as $$
  select trim(
    both '-'
    from regexp_replace(
      replace(lower(coalesce(value, '')), '''', ''),
      '[^a-z0-9]+',
      '-',
      'g'
    )
  );
$$;

alter table if exists public.categories
  add column if not exists title text,
  add column if not exists status public.content_status not null default 'draft',
  add column if not exists seo_keywords text[] not null default '{}';

update public.categories
set title = coalesce(title, name)
where title is null;

alter table if exists public.ingredients
  add column if not exists status public.content_status not null default 'draft',
  add column if not exists scientific_name text,
  add column if not exists ingredient_category text,
  add column if not exists image_url text,
  add column if not exists rating numeric,
  add column if not exists evidence_level text,
  add column if not exists origin_country text,
  add column if not exists part_used text,
  add column if not exists ingredient_form text,
  add column if not exists taste_profile text,
  add column if not exists typical_dose text,
  add column if not exists best_for text,
  add column if not exists safety_level text,
  add column if not exists overview_content text,
  add column if not exists how_it_works_content text,
  add column if not exists interesting_fact text,
  add column if not exists benefits_json jsonb not null default '[]'::jsonb,
  add column if not exists side_effects_json jsonb not null default '[]'::jsonb,
  add column if not exists drug_interactions_json jsonb not null default '[]'::jsonb,
  add column if not exists who_should_avoid_json jsonb not null default '[]'::jsonb,
  add column if not exists faq_json jsonb not null default '[]'::jsonb,
  add column if not exists related_ingredients_json jsonb not null default '[]'::jsonb,
  add column if not exists seo_title text,
  add column if not exists seo_description text;

create table if not exists public.category_backups (
  id bigint generated always as identity primary key,
  source_id uuid,
  slug text,
  title text,
  payload jsonb not null,
  backup_batch_id uuid not null,
  backed_up_at timestamptz not null default now()
);

create table if not exists public.ingredient_backups (
  id bigint generated always as identity primary key,
  source_id uuid,
  slug text,
  name text,
  payload jsonb not null,
  backup_batch_id uuid not null,
  backed_up_at timestamptz not null default now()
);

create table if not exists public.product_ingredient_backups (
  id bigint generated always as identity primary key,
  source_relation_id uuid,
  product_id uuid,
  ingredient_id uuid,
  payload jsonb not null,
  backup_batch_id uuid not null,
  backed_up_at timestamptz not null default now()
);

do $$
declare
  backup_batch_id uuid := gen_random_uuid();
begin
  insert into public.category_backups (source_id, slug, title, payload, backup_batch_id)
  select c.id, c.slug, coalesce(c.title, c.name), to_jsonb(c), backup_batch_id
  from public.categories c
  where c.deleted_at is null;

  insert into public.ingredient_backups (source_id, slug, name, payload, backup_batch_id)
  select i.id, i.slug, i.name, to_jsonb(i), backup_batch_id
  from public.ingredients i
  where i.deleted_at is null;

  insert into public.product_ingredient_backups (
    source_relation_id,
    product_id,
    ingredient_id,
    payload,
    backup_batch_id
  )
  select pi.id, pi.product_id, pi.ingredient_id, to_jsonb(pi), backup_batch_id
  from public.product_ingredients pi;
end $$;

create temp table _approved_categories (
  title text not null,
  slug text not null primary key,
  description text,
  seo_title text,
  seo_description text
) on commit drop;

insert into _approved_categories (title, slug, description, seo_title, seo_description)
values
${categoryValues};

update public.categories c
set
  title = ac.title,
  name = ac.title,
  description = ac.description,
  status = 'published'::public.content_status,
  seo_title = ac.seo_title,
  seo_description = ac.seo_description,
  seo_keywords = array[
    ac.title,
    replace(ac.title, '&', 'and'),
    ac.title || ' supplements',
    ac.title || ' ingredients'
  ],
  deleted_at = null,
  updated_at = now()
from _approved_categories ac
where c.slug = ac.slug;

insert into public.categories (
  id,
  title,
  name,
  slug,
  description,
  image,
  status,
  seo_title,
  seo_description,
  seo_keywords,
  created_at,
  updated_at,
  deleted_at
)
select
  gen_random_uuid(),
  ac.title,
  ac.title,
  ac.slug,
  ac.description,
  ${sqlString(placeholderImage)},
  'published'::public.content_status,
  ac.seo_title,
  ac.seo_description,
  array[
    ac.title,
    replace(ac.title, '&', 'and'),
    ac.title || ' supplements',
    ac.title || ' ingredients'
  ],
  now(),
  now(),
  null
from _approved_categories ac
where not exists (
  select 1
  from public.categories c
  where c.slug = ac.slug
);

create temp table _approved_category_ids on commit drop as
select c.id, c.slug, c.title
from public.categories c
join _approved_categories ac on ac.slug = c.slug
where c.deleted_at is null;

create temp table _legacy_category_map on commit drop as
select
  c.id as legacy_category_id,
  case
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(weight|fat|slim|metabolism)' then 'weight-loss'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(general|wellness)' then 'general-wellness'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(men|male|testoster|prostate)' then 'men''s-health'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(women|female|hormone|menopause)' then 'women''s-health'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(hair|scalp)' then 'hair-health'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(blood sugar|glucose|diabetes|insulin)' then 'blood-sugar-diabetes'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(bone|joint|mobility)' then 'bone-joint-health'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(gut|digest|microbiome)' then 'gut-health'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(brain|memory|focus|cognitive)' then 'brain-memory'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(sleep|calm|relax)' then 'sleep-relaxation'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(heart|cardio|blood pressure)' then 'heart-health'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(immune|immunity)' then 'immunity'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(skin|beauty)' then 'skin-care'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(sexual|libido)' then 'sexual-health'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(energy|athletic|sport|performance)' then 'energy-athletic-performance'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(lung|respiratory)' then 'lung-health'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(nervous|stress|adaptogen)' then 'nervous-system-health'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(vision|eye)' then 'vision-health'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(hearing|ear)' then 'hearing-health'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(teeth|gum|oral)' then 'teeth-gums'
    when lower(coalesce(c.title, c.name, c.slug)) ~ '(nail)' then 'nail-care'
    else 'general-wellness'
  end as approved_slug
from public.categories c
where c.deleted_at is null
  and not exists (
    select 1
    from _approved_categories ac
    where ac.slug = c.slug
  );

update public.products p
set
  category_id = aci.id,
  updated_at = now()
from _legacy_category_map lcm
join _approved_category_ids aci on aci.slug = lcm.approved_slug
where p.category_id = lcm.legacy_category_id;

update public.blogs b
set
  category_id = aci.id,
  updated_at = now()
from _legacy_category_map lcm
join _approved_category_ids aci on aci.slug = lcm.approved_slug
where b.category_id = lcm.legacy_category_id;

update public.categories c
set
  status = 'archived'::public.content_status,
  deleted_at = coalesce(c.deleted_at, now()),
  updated_at = now()
where c.deleted_at is null
  and not exists (
    select 1
    from _approved_categories ac
    where ac.slug = c.slug
  );

create temp table _approved_ingredients (
  name text not null,
  slug text not null primary key,
  ingredient_category text not null,
  scientific_name text,
  image_url text,
  featured_image text,
  rating numeric not null,
  evidence_level text not null,
  origin_country text,
  part_used text,
  ingredient_form text,
  taste_profile text,
  typical_dose text,
  best_for text,
  safety_level text,
  short_description text,
  full_description text,
  overview_content text,
  how_it_works_content text,
  interesting_fact text,
  benefits text,
  benefits_json jsonb,
  side_effects text,
  side_effects_json jsonb,
  drug_interactions_json jsonb,
  who_should_avoid_json jsonb,
  faq_json jsonb,
  related_ingredients_json jsonb,
  dosage text,
  scientific_notes text,
  seo_title text,
  seo_description text,
  is_featured boolean not null default false,
  alias_slugs jsonb not null
) on commit drop;

insert into _approved_ingredients (
  name,
  slug,
  ingredient_category,
  scientific_name,
  image_url,
  featured_image,
  rating,
  evidence_level,
  origin_country,
  part_used,
  ingredient_form,
  taste_profile,
  typical_dose,
  best_for,
  safety_level,
  short_description,
  full_description,
  overview_content,
  how_it_works_content,
  interesting_fact,
  benefits,
  benefits_json,
  side_effects,
  side_effects_json,
  drug_interactions_json,
  who_should_avoid_json,
  faq_json,
  related_ingredients_json,
  dosage,
  scientific_notes,
  seo_title,
  seo_description,
  is_featured,
  alias_slugs
)
values
${ingredientValues};

create temp table _ingredient_aliases on commit drop as
select
  ai.slug as master_slug,
  public.suppriva_slugify(value::text) as alias_slug
from _approved_ingredients ai
cross join lateral jsonb_array_elements_text(ai.alias_slugs) value
where public.suppriva_slugify(value::text) <> '';

create temp table _existing_ingredient_matches on commit drop as
select distinct on (ai.slug)
  ai.slug as master_slug,
  i.id as ingredient_id
from _approved_ingredients ai
join public.ingredients i
  on i.deleted_at is null
 and (
   i.slug = ai.slug
   or lower(i.name) = lower(ai.name)
   or exists (
     select 1
     from _ingredient_aliases ia
     where ia.master_slug = ai.slug
       and ia.alias_slug = i.slug
   )
 )
order by
  ai.slug,
  case
    when i.slug = ai.slug then 0
    when lower(i.name) = lower(ai.name) then 1
    else 2
  end,
  i.updated_at desc;

update public.ingredients i
set
  name = ai.name,
  slug = ai.slug,
  status = 'published'::public.content_status,
  scientific_name = coalesce(ai.scientific_name, i.scientific_name),
  ingredient_category = ai.ingredient_category,
  short_description = ai.short_description,
  full_description = ai.full_description,
  image_url = ai.image_url,
  featured_image = ai.featured_image,
  rating = ai.rating,
  evidence_level = ai.evidence_level,
  origin_country = ai.origin_country,
  part_used = ai.part_used,
  ingredient_form = ai.ingredient_form,
  taste_profile = ai.taste_profile,
  typical_dose = ai.typical_dose,
  best_for = ai.best_for,
  safety_level = ai.safety_level,
  overview_content = ai.overview_content,
  how_it_works_content = ai.how_it_works_content,
  interesting_fact = ai.interesting_fact,
  benefits = string_to_array(ai.benefits, '; '),
  benefits_json = ai.benefits_json,
  side_effects = string_to_array(ai.side_effects, '; '),
  side_effects_json = ai.side_effects_json,
  drug_interactions_json = ai.drug_interactions_json,
  who_should_avoid_json = ai.who_should_avoid_json,
  faq_json = ai.faq_json,
  related_ingredients_json = ai.related_ingredients_json,
  dosage = ai.dosage,
  scientific_notes = ai.scientific_notes,
  meta_title = ai.seo_title,
  meta_description = ai.seo_description,
  seo_title = ai.seo_title,
  seo_description = ai.seo_description,
  is_featured = ai.is_featured,
  deleted_at = null,
  updated_at = now()
from _existing_ingredient_matches eim
join _approved_ingredients ai on ai.slug = eim.master_slug
where i.id = eim.ingredient_id;

insert into public.ingredients (
  id,
  name,
  slug,
  status,
  scientific_name,
  ingredient_category,
  short_description,
  full_description,
  image_url,
  featured_image,
  rating,
  evidence_level,
  origin_country,
  part_used,
  ingredient_form,
  taste_profile,
  typical_dose,
  best_for,
  safety_level,
  overview_content,
  how_it_works_content,
  interesting_fact,
  benefits,
  side_effects,
  dosage,
  scientific_notes,
  benefits_json,
  side_effects_json,
  drug_interactions_json,
  who_should_avoid_json,
  faq_json,
  related_ingredients_json,
  meta_title,
  meta_description,
  seo_title,
  seo_description,
  is_featured,
  created_at,
  updated_at,
  deleted_at
)
select
  gen_random_uuid(),
  ai.name,
  ai.slug,
  'published'::public.content_status,
  ai.scientific_name,
  ai.ingredient_category,
  ai.short_description,
  ai.full_description,
  ai.image_url,
  ai.featured_image,
  ai.rating,
  ai.evidence_level,
  ai.origin_country,
  ai.part_used,
  ai.ingredient_form,
  ai.taste_profile,
  ai.typical_dose,
  ai.best_for,
  ai.safety_level,
  ai.overview_content,
  ai.how_it_works_content,
  ai.interesting_fact,
  string_to_array(ai.benefits, '; '),
  string_to_array(ai.side_effects, '; '),
  ai.dosage,
  ai.scientific_notes,
  ai.benefits_json,
  ai.side_effects_json,
  ai.drug_interactions_json,
  ai.who_should_avoid_json,
  ai.faq_json,
  ai.related_ingredients_json,
  ai.seo_title,
  ai.seo_description,
  ai.seo_title,
  ai.seo_description,
  ai.is_featured,
  now(),
  now(),
  null
from _approved_ingredients ai
where not exists (
  select 1
  from _existing_ingredient_matches eim
  where eim.master_slug = ai.slug
);

create temp table _canonical_ingredients on commit drop as
select i.id, i.slug, i.name
from public.ingredients i
join _approved_ingredients ai on ai.slug = i.slug
where i.deleted_at is null;

update public.ingredients i
set related_ingredients_json = coalesce(rel.related_json, '[]'::jsonb)
from (
  select
    ci.id,
    jsonb_agg(
      jsonb_build_object('slug', related_ci.slug, 'name', related_ci.name)
      order by related_ci.name
    ) filter (where related_ci.id is not null) as related_json
  from _canonical_ingredients ci
  join _approved_ingredients ai on ai.slug = ci.slug
  left join lateral jsonb_array_elements(ai.related_ingredients_json) rel_item on true
  left join _canonical_ingredients related_ci
    on related_ci.slug = rel_item ->> 'slug'
  group by ci.id
) rel
where i.id = rel.id;

delete from public.product_ingredients;

insert into public.product_ingredients (id, product_id, ingredient_id, created_at)
select
  gen_random_uuid(),
  matched.product_id,
  matched.ingredient_id,
  now()
from (
  select distinct
    p.id as product_id,
    ci.id as ingredient_id
  from public.products p
  cross join lateral jsonb_array_elements(coalesce(p.ingredients, '[]'::jsonb)) as ingredient_item
  join _ingredient_aliases ia
    on ia.alias_slug = public.suppriva_slugify(coalesce(ingredient_item ->> 'name', ''))
  join _canonical_ingredients ci
    on ci.slug = ia.master_slug
  where p.deleted_at is null
) matched
on conflict (product_id, ingredient_id) do nothing;

update public.ingredients i
set
  status = 'archived'::public.content_status,
  deleted_at = coalesce(i.deleted_at, now()),
  updated_at = now()
where i.deleted_at is null
  and not exists (
    select 1
    from _canonical_ingredients ci
    where ci.id = i.id
  );

notify pgrst, 'reload schema';

-- Verification queries
select count(*) as published_categories
from public.categories
where deleted_at is null
  and status = 'published'::public.content_status;

select count(*) as published_ingredients
from public.ingredients
where deleted_at is null
  and status = 'published'::public.content_status;

select slug, count(*) as slug_count
from public.categories
where deleted_at is null
group by slug
having count(*) > 1;

select slug, count(*) as slug_count
from public.ingredients
where deleted_at is null
group by slug
having count(*) > 1;

select ingredient_category, count(*) as ingredient_count
from public.ingredients
where deleted_at is null
  and status = 'published'::public.content_status
group by ingredient_category
order by ingredient_count desc, ingredient_category asc;

select sum(jsonb_array_length(coalesce(related_ingredients_json, '[]'::jsonb))) as related_ingredient_links
from public.ingredients
where deleted_at is null
  and status = 'published'::public.content_status;

select count(*) as product_ingredient_relations
from public.product_ingredients;
`;
}

function generateReport() {
  const duplicateNames = findDuplicates(masterIngredients.map((ingredient) => ingredient.name));
  const duplicateSlugs = findDuplicates(masterIngredients.map((ingredient) => ingredient.slug));

  return `# Suppriva Master Category & Ingredient Rebuild Report

## Summary

- Total approved categories: ${categories.length}
- Total approved ingredients: ${masterIngredients.length}
- Total related ingredient links: ${relationshipCount}
- Duplicate ingredient names: ${duplicateNames.length ? duplicateNames.join(", ") : "None"}
- Duplicate ingredient slugs: ${duplicateSlugs.length ? duplicateSlugs.join(", ") : "None"}

## Category Mapping Report

${categories
  .map(
    (category) =>
      `- ${category.title}: ${categoryCounts.get(category.slug) ?? 0} ingredients`,
  )
  .join("\n")}

## Generated Files

- \`supabase/migrations/202606210201_master_category_ingredient_rebuild.sql\`
- \`SUPABASE_MASTER_CATEGORY_INGREDIENT_REBUILD.sql\`

## Backup Tables Used

- \`public.category_backups\`
- \`public.ingredient_backups\`
- \`public.product_ingredient_backups\`

## Notes

- Legacy categories are remapped to the approved 22-category system before archive.
- Legacy ingredients are backed up, canonicalized where possible, and archived after master seeding.
- Ingredient-to-product relationships are rebuilt from existing \`products.ingredients\` JSON using canonical slug aliases.
`;
}

function flattenGroups(groups) {
  const flattened = [];
  for (const [categorySlug, entries] of Object.entries(groups)) {
    for (const entry of entries) {
      if (!masterCategoryMap?.has?.(categorySlug) && !categories.find((item) => item.slug === categorySlug)) {
        throw new Error(`Unknown category slug: ${categorySlug}`);
      }

      const slug = entry.slug ?? slugify(stripParenthetical(entry.name));
      const scientificName = entry.scientificName ?? inferScientificName(entry.name);
      const aliases = buildAliases(entry.name, slug, scientificName, entry.aliases ?? []);
      flattened.push({
        ...entry,
        slug,
        categorySlug,
        scientificName,
        aliases,
        aliasSlugs: aliases.map((value) => slugify(value)).filter(Boolean),
        evidenceLevel: entry.evidenceLevel ?? "Moderate",
        featured: entry.featured ?? false,
        rating: entry.rating ?? ratingForEvidence(entry.evidenceLevel ?? "Moderate"),
        relatedSlugs: [],
      });
    }
  }
  return flattened;
}

function ingredient(name, options = {}) {
  return { name, ...options };
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripParenthetical(value) {
  return value.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

function inferScientificName(name) {
  const manual = {
    "Ashwagandha (KSM-66)": "Withania somnifera",
    "Rhodiola Rosea": "Rhodiola rosea",
    "Eleuthero (Siberian Ginseng)": "Eleutherococcus senticosus",
    "Holy Basil (Tulsi)": "Ocimum tenuiflorum",
    "Bacopa Monnieri": "Bacopa monnieri",
    "Lion's Mane Mushroom": "Hericium erinaceus",
    "Ginkgo Biloba": "Ginkgo biloba",
    "Gymnema Sylvestre": "Gymnema sylvestre",
    "Banaba Leaf Extract": "Lagerstroemia speciosa",
    "Maca Root": "Lepidium meyenii",
    "Vitex (Chaste Tree Berry)": "Vitex agnus-castus",
    "Dong Quai": "Angelica sinensis",
    "Black Cohosh Root": "Actaea racemosa",
    "Evening Primrose Oil": "Oenothera biennis",
    "Valerian Root": "Valeriana officinalis",
    "Chamomile Extract": "Matricaria chamomilla",
    "Fo-Ti (He Shou Wu)": "Reynoutria multiflora",
    "Omega-3 (EPA/DHA)": "EPA / DHA",
    "Arjuna Bark Extract": "Terminalia arjuna",
    "Astragalus Root": "Astragalus membranaceus",
    "Echinacea Extract": "Echinacea purpurea",
    "Black Seed Oil (Nigella Sativa)": "Nigella sativa",
    "Chaga Mushroom Extract": "Inonotus obliquus",
    "Cordyceps Extract": "Cordyceps militaris",
    "Milk Thistle (Silymarin)": "Silybum marianum",
    "Turmeric (Curcumin + BioPerine)": "Curcuma longa",
    "Artichoke Extract": "Cynara scolymus",
    "Aloe Vera": "Aloe barbadensis miller",
    "Dandelion Root": "Taraxacum officinale",
    "Dandelion Extract": "Taraxacum officinale",
    "Ginger Root": "Zingiber officinale",
    "Bitter Melon Extract": "Momordica charantia",
    "Elderberry Extract": "Sambucus nigra",
  };

  if (manual[name]) {
    return manual[name];
  }

  if (!/[()]/.test(name) && /[A-Z][a-z]+ [A-Z][a-z]+/.test(name)) {
    return name;
  }

  return null;
}

function buildAliases(name, slug, scientificName, extraAliases) {
  const aliases = new Set([name, stripParenthetical(name), slug.replaceAll("-", " "), slug]);
  const parenthetical = [...name.matchAll(/\(([^)]*)\)/g)].map((match) => match[1]?.trim()).filter(Boolean);
  for (const item of parenthetical) {
    aliases.add(item);
  }
  if (scientificName) {
    aliases.add(scientificName);
  }
  for (const alias of extraAliases) {
    aliases.add(alias);
  }
  return [...aliases].filter(Boolean);
}

function ratingForEvidence(evidenceLevel) {
  if (evidenceLevel === "Strong") return 4.8;
  if (evidenceLevel === "Limited") return 4.3;
  return 4.6;
}

function categoryFocus(categorySlug) {
  const map = {
    "weight-loss": "metabolism support, appetite-aware routines, and healthy weight management",
    "general-wellness": "daily wellness support and label-friendly supplement comparison",
    "mens-health": "male vitality, performance, and hormone-aware supplement routines",
    "womens-health": "women's wellness, hormone balance, and nutrient support",
    "hair-health": "hair strength, scalp support, and appearance-focused routines",
    "blood-sugar-diabetes": "glucose-conscious routines and metabolic support",
    "bone-joint-health": "mobility, recovery, and joint comfort support",
    "gut-health": "digestion, microbiome support, and daily regularity",
    "brain-memory": "focus, recall, and cognitive support routines",
    "sleep-relaxation": "night routines, stress relief, and relaxation support",
    "heart-health": "circulation, cardiovascular support, and daily heart wellness",
    immunity: "immune resilience and seasonal wellness support",
    "skin-care": "hydration, tone, and beauty-support supplement routines",
    "sexual-health": "libido, intimacy, and vitality support routines",
    "energy-athletic-performance": "training, stamina, and daily energy support",
    "prostate-health": "male aging support and prostate-focused routines",
    "lung-health": "respiratory wellness and airway-conscious support",
    "nervous-system-health": "stress response and nervous-system balance",
    "vision-health": "eye comfort and visual wellness support",
    "hearing-health": "sensory support and healthy circulation around hearing wellness",
    "teeth-gums": "oral wellness and gum-friendly nutrient support",
    "nail-care": "nail strength and beauty-support routines",
  };
  return map[categorySlug] ?? "daily wellness support";
}

function categoryDose(categorySlug) {
  const map = {
    "weight-loss": "Use label-directed servings, often with meals or active routines",
    "general-wellness": "Use label-directed daily servings",
    "mens-health": "Use label-directed daily servings with consistency",
    "womens-health": "Use label-directed daily servings matched to the formula",
    "hair-health": "Use label-directed daily servings for long-term routines",
    "blood-sugar-diabetes": "Often taken with meals when the label recommends it",
    "bone-joint-health": "Use label-directed servings for movement and recovery routines",
    "gut-health": "Use label-directed servings with digestive tolerance in mind",
    "brain-memory": "Use label-directed servings during workday or focus routines",
    "sleep-relaxation": "Usually taken later in the day or before bedtime, depending on the formula",
    "heart-health": "Use label-directed daily servings with consistency",
    immunity: "Use label-directed servings during everyday or seasonal routines",
    "skin-care": "Use label-directed daily servings for appearance-focused routines",
    "sexual-health": "Use label-directed servings consistently",
    "energy-athletic-performance": "Use label-directed servings around training or performance goals",
    "prostate-health": "Use label-directed daily servings",
    "lung-health": "Use label-directed servings while monitoring tolerance",
    "nervous-system-health": "Use label-directed servings with stress-management routines",
    "vision-health": "Use label-directed daily servings",
    "hearing-health": "Use label-directed daily servings",
    "teeth-gums": "Use label-directed daily servings",
    "nail-care": "Use label-directed daily servings for long-term support",
  };
  return map[categorySlug] ?? "Use label-directed daily servings";
}

function categoryBestFor(categorySlug) {
  return `${masterCategoryMap.get(categorySlug)?.title ?? "General Wellness"} support routines`;
}

function categorySafety(categorySlug) {
  const map = {
    "blood-sugar-diabetes": "Use carefully if you already follow medication-based glucose routines",
    "sleep-relaxation": "Use carefully with sedating medications or stacked calming formulas",
    "heart-health": "Review medication interactions before adding concentrated heart-support formulas",
    immunity: "Use carefully with intensive medication or immune-modulating routines",
    "weight-loss": "Review caffeine load, appetite ingredients, and tolerance before stacking formulas",
    "energy-athletic-performance": "Monitor stimulation, hydration, and serving size in active routines",
  };
  return map[categorySlug] ?? "Review label directions and current medications before long-term use";
}

function categoryOrigin(categorySlug) {
  const map = {
    "brain-memory": "Global",
    "sleep-relaxation": "Global",
    "weight-loss": "Global",
    "gut-health": "Global",
    "hair-health": "Global",
    "heart-health": "Global",
    immunity: "Global",
  };
  return map[categorySlug] ?? "Global";
}

function inferPartUsed(name) {
  const lower = name.toLowerCase();
  if (lower.includes("root")) return "Root extract";
  if (lower.includes("leaf")) return "Leaf extract";
  if (lower.includes("bark")) return "Bark extract";
  if (lower.includes("berry")) return "Berry extract";
  if (lower.includes("mushroom")) return "Fruiting body extract";
  if (lower.includes("oil")) return "Seed or plant oil";
  if (lower.includes("peptides")) return "Hydrolyzed peptides";
  if (lower.includes("husk")) return "Seed husk fiber";
  if (lower.includes("enzymes")) return "Enzyme blend";
  if (lower.includes("vitamin") || lower.includes("magnesium") || lower.includes("zinc")) {
    return "Nutrient compound";
  }
  if (lower.includes("extract")) return "Botanical extract";
  return "Compound or extract blend";
}

function inferForm(name) {
  const lower = name.toLowerCase();
  if (lower.includes("oil")) return "Softgel";
  if (lower.includes("peptides") || lower.includes("creatine") || lower.includes("inulin")) {
    return "Powder or capsule";
  }
  return "Capsule";
}

function inferTaste(name) {
  const lower = name.toLowerCase();
  if (lower.includes("cayenne")) return "Spicy";
  if (lower.includes("ginger")) return "Warm and spicy";
  if (lower.includes("berry")) return "Berry and tart";
  if (lower.includes("tea")) return "Herbal";
  if (lower.includes("vinegar")) return "Sharp and acidic";
  if (lower.includes("oil")) return "Neutral";
  return "Neutral";
}

function shortDescription(ingredient) {
  return `${ingredient.name} is included in Suppriva's ${masterCategoryMap
    .get(ingredient.categorySlug)
    ?.title.toLowerCase()} library for supplement comparison, search visibility, and ingredient-focused research.`;
}

function fullDescription(ingredient) {
  return `${ingredient.name} is mapped to ${masterCategoryMap
    .get(ingredient.categorySlug)
    ?.title} because shoppers commonly research it for ${categoryFocus(
    ingredient.categorySlug,
  )}. This profile helps compare label positioning, delivery formats, and practical safety context before purchase.`;
}

function overviewContent(ingredient) {
  return `${ingredient.name} appears in Suppriva's ${masterCategoryMap
    .get(ingredient.categorySlug)
    ?.title.toLowerCase()} library so readers can compare ingredient positioning, routine fit, and supplement category relevance in one place.`;
}

function howItWorksContent(ingredient) {
  return `${ingredient.name} is usually evaluated through category fit, delivery format, daily serving structure, and how brands position it alongside complementary ingredients in ${masterCategoryMap
    .get(ingredient.categorySlug)
    ?.title.toLowerCase()} formulas.`;
}

function interestingFact(ingredient) {
  return `${ingredient.name} is often paired with related ingredients from the same wellness category to create more targeted supplement formulas.`;
}

function categoryBenefits(categorySlug) {
  const map = {
    "weight-loss": [
      {
        title: "Metabolism routine support",
        description: "{name} is commonly compared in formulas positioned around metabolism-friendly daily routines.",
      },
      {
        title: "Goal-focused wellness support",
        description: "{name} is often used in category research tied to appetite-aware and active lifestyle planning.",
      },
    ],
    "brain-memory": [
      {
        title: "Focus support",
        description: "{name} is often discussed in supplement stacks built around concentration and cognitive clarity.",
      },
      {
        title: "Memory routine support",
        description: "{name} is commonly researched in category pages that compare recall-friendly wellness ingredients.",
      },
    ],
    "sleep-relaxation": [
      {
        title: "Relaxation routine support",
        description: "{name} is commonly positioned in formulas built around calmer evening routines.",
      },
      {
        title: "Sleep preparation support",
        description: "{name} is often compared in bedtime-focused supplement stacks and label reviews.",
      },
    ],
  };

  return map[categorySlug] ?? [
    {
      title: `${masterCategoryMap.get(categorySlug)?.title ?? "General wellness"} support`,
      description: `{name} is researched in supplement routines focused on ${categoryFocus(categorySlug)}.`,
    },
    {
      title: "Label comparison support",
      description: "{name} is commonly reviewed by dose, format, and how it is stacked with supporting ingredients.",
    },
  ];
}

function categoryBenefitTitles(categorySlug) {
  return categoryBenefits(categorySlug).map((item) => item.title);
}

function categorySideEffects(categorySlug) {
  const map = {
    "sleep-relaxation": [
      {
        title: "Daytime grogginess",
        description: "{name} may feel too calming if serving size or timing is not a good fit for the user.",
      },
      {
        title: "Tolerance varies",
        description: "{name} should be reviewed carefully when mixed with other relaxation-focused ingredients.",
      },
    ],
    "blood-sugar-diabetes": [
      {
        title: "Medication overlap",
        description: "{name} belongs in a category where medication review is especially important before stacking ingredients.",
      },
      {
        title: "Digestive tolerance",
        description: "{name} may feel stronger when servings are introduced too aggressively or taken without enough planning.",
      },
    ],
  };

  return map[categorySlug] ?? [
    {
      title: "Tolerance varies by individual",
      description: "{name} should be introduced with label awareness and personal tolerance in mind.",
    },
    {
      title: "Review interactions",
      description: "{name} should be checked against current medications and overlapping supplements before daily use.",
    },
  ];
}

function categorySideEffectTitles(categorySlug) {
  return categorySideEffects(categorySlug).map((item) => item.title);
}

function categoryDrugInteractionNotes(categorySlug) {
  const map = {
    "blood-sugar-diabetes": [
      "Review existing blood-sugar medications before combining multiple metabolic ingredients.",
    ],
    "sleep-relaxation": [
      "Use caution when stacking with sedating medications or other heavy calming formulas.",
    ],
    "heart-health": [
      "Review circulation and anticoagulant medication considerations before stacking concentrated formulas.",
    ],
  };
  return map[categorySlug] ?? [
    "Review current medications and supplement overlap before introducing this ingredient.",
  ];
}

function categoryAvoidNotes(categorySlug) {
  const map = {
    "blood-sugar-diabetes": [
      "People already following medication-based glucose routines without clinician review.",
    ],
    "sleep-relaxation": [
      "People who are highly sensitive to calming ingredients or next-morning grogginess.",
    ],
    "energy-athletic-performance": [
      "People who are highly sensitive to stimulating formulas or aggressive stacking routines.",
    ],
  };
  return map[categorySlug] ?? [
    "People who are already managing complex medication routines without professional guidance.",
  ];
}

function findDuplicates(values) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlNullableString(value) {
  return value ? sqlString(value) : "null";
}

function sqlJson(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}
