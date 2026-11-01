import { db, pool } from "./index";
import { categories, products, productVariants } from "./schema";

// Sample catalogue for development. Replace with real products before launch.
const sampleCategories = [
  { name: "Hand Knotted", slug: "hand-knotted" },
  { name: "Hand Tufted", slug: "hand-tufted" },
  { name: "Jute", slug: "jute" },
  { name: "Shaggy", slug: "shaggy" },
];

const sampleSizes = [
  { size: "5 x 7 ft", multiplier: 1 },
  { size: "6 x 9 ft", multiplier: 1.5 },
  { size: "8 x 10 ft", multiplier: 2.2 },
];

const sampleProducts = [
  {
    title: "Kashi",
    slug: "kashi",
    category: "hand-knotted",
    material: "Wool",
    colors: ["Ivory", "Charcoal"],
    basePaise: 3_499_900,
  },
  {
    title: "Varuna",
    slug: "varuna",
    category: "hand-tufted",
    material: "Wool",
    colors: ["Sand", "Beige"],
    basePaise: 1_899_900,
  },
  {
    title: "Sarnath",
    slug: "sarnath",
    category: "jute",
    material: "Jute",
    colors: ["Beige", "Sand"],
    basePaise: 749_900,
  },
  {
    title: "Ghat",
    slug: "ghat",
    category: "shaggy",
    material: "Wool",
    colors: ["Charcoal", "Ivory"],
    basePaise: 2_199_900,
  },
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

async function seed() {
  await db.insert(categories).values(sampleCategories).onConflictDoNothing();
  const savedCategories = await db.select().from(categories);

  for (const { category, basePaise, colors, ...product } of sampleProducts) {
    const categoryId = savedCategories.find(({ slug }) => slug === category)?.id;
    if (!categoryId) throw new Error(`Unknown category: ${category}`);

    const [saved] = await db
      .insert(products)
      .values({
        ...product,
        categoryId,
        color: colors[0],
        description: `${product.title} is a sample carpet, shaped by hand for quiet, everyday comfort.`,
        status: "active",
        isFeatured: true,
      })
      .onConflictDoNothing()
      .returning({ id: products.id });
    if (!saved) continue;

    await db.insert(productVariants).values(
      colors.flatMap((color) =>
        sampleSizes.map(({ size, multiplier }) => {
          const pricePaise = Math.round(basePaise * multiplier);
          return {
            productId: saved.id,
            size,
            color,
            sku: `${product.slug}-${slugify(color)}-${slugify(size)}`,
            pricePaise,
            mrpPaise: pricePaise,
            stock: 5,
          };
        }),
      ),
    );
  }

  console.log("Seed complete");
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
