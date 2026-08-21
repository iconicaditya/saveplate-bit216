export type RecipeIngredient = {
  name: string;
  keywords: string[];
  quantity: string;
};

export type LocalRecipe = {
  id: string;
  name: string;
  description: string;
  cookingTime: number;
  ingredients: RecipeIngredient[];
};

export const localRecipes: LocalRecipe[] = [
  {
    id: "tomato-soup",
    name: "Tomato Soup",
    description: "A warming tomato soup with simple pantry ingredients.",
    cookingTime: 30,
    ingredients: [
      { name: "Tomatoes", keywords: ["tomato"], quantity: "6 medium" },
      { name: "Onion", keywords: ["onion"], quantity: "1" },
      { name: "Garlic", keywords: ["garlic"], quantity: "2 cloves" },
      { name: "Milk or cream", keywords: ["milk", "cream"], quantity: "1/2 cup" },
    ],
  },
  {
    id: "vegetable-stir-fry",
    name: "Vegetable Stir Fry",
    description: "A quick, flexible meal for fresh vegetables in your fridge.",
    cookingTime: 20,
    ingredients: [
      { name: "Mixed vegetables", keywords: ["carrot", "broccoli", "pepper", "zucchini", "spinach"], quantity: "3 cups" },
      { name: "Rice", keywords: ["rice"], quantity: "2 cups" },
      { name: "Garlic", keywords: ["garlic"], quantity: "2 cloves" },
    ],
  },
  {
    id: "banana-pancakes",
    name: "Banana Oat Pancakes",
    description: "Use ripe bananas for a fast and naturally sweet breakfast.",
    cookingTime: 20,
    ingredients: [
      { name: "Bananas", keywords: ["banana"], quantity: "2" },
      { name: "Eggs", keywords: ["egg"], quantity: "2" },
      { name: "Oats", keywords: ["oat"], quantity: "1/2 cup" },
      { name: "Milk", keywords: ["milk"], quantity: "1/4 cup" },
    ],
  },
  {
    id: "avocado-toast",
    name: "Avocado Toast",
    description: "A simple breakfast with toasted bread, avocado, and egg.",
    cookingTime: 10,
    ingredients: [
      { name: "Bread", keywords: ["bread", "loaf"], quantity: "2 slices" },
      { name: "Avocado", keywords: ["avocado"], quantity: "1" },
      { name: "Eggs", keywords: ["egg"], quantity: "2" },
    ],
  },
  {
    id: "yogurt-parfait",
    name: "Yogurt Fruit Parfait",
    description: "A no-cook snack or breakfast for yogurt and fresh fruit.",
    cookingTime: 5,
    ingredients: [
      { name: "Yogurt", keywords: ["yogurt", "yoghurt"], quantity: "1 cup" },
      { name: "Fresh fruit", keywords: ["apple", "banana", "berry", "mango", "fruit"], quantity: "1 cup" },
      { name: "Oats or granola", keywords: ["oat", "granola"], quantity: "1/4 cup" },
    ],
  },
  {
    id: "chicken-curry",
    name: "Chicken Tomato Curry",
    description: "A rich chicken curry using tomatoes and everyday spices.",
    cookingTime: 35,
    ingredients: [
      { name: "Chicken", keywords: ["chicken"], quantity: "500 g" },
      { name: "Tomatoes", keywords: ["tomato"], quantity: "2" },
      { name: "Onion", keywords: ["onion"], quantity: "1" },
      { name: "Garlic", keywords: ["garlic"], quantity: "3 cloves" },
    ],
  },
];

export type MatchedRecipe = LocalRecipe & {
  matchedIngredients: string[];
};

export function matchRecipes(inventory: Array<{ name: string }>): MatchedRecipe[] {
  const names = inventory.map((item) => item.name.toLowerCase());

  return localRecipes
    .map((recipe) => ({
      ...recipe,
      matchedIngredients: recipe.ingredients
        .filter((ingredient) => ingredient.keywords.some((keyword) => names.some((name) => name.includes(keyword))))
        .map((ingredient) => ingredient.name),
    }))
    .filter((recipe) => recipe.matchedIngredients.length > 0)
    .sort((a, b) => b.matchedIngredients.length - a.matchedIngredients.length);
}
