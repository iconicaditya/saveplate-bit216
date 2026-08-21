"use client";

import { Clock, CalendarPlus, ChefHat, Sparkles } from "lucide-react";
import type { MatchedRecipe } from "@/lib/recipes";

type RecipeSuggestionsProps = {
  recipes: MatchedRecipe[];
  disabled?: boolean;
  onAddRecipe: (recipe: MatchedRecipe) => void;
};

export default function RecipeSuggestions({ recipes, disabled = false, onAddRecipe }: RecipeSuggestionsProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F5E9]">
          <Sparkles className="h-4 w-4 text-[#2E7D32]" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Local recipe suggestions</h2>
          <p className="text-xs text-gray-500">Matched with ingredients currently in your inventory.</p>
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 px-4 py-9 text-center">
          <ChefHat className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm font-medium text-gray-700">No ingredient matches yet</p>
          <p className="mt-1 text-xs text-gray-500">Add food to your inventory to receive recipe recommendations.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe) => (
            <article key={recipe.id} className="flex flex-col rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-gray-900">{recipe.name}</h3>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-gray-500">
                  <Clock className="h-3.5 w-3.5" /> {recipe.cookingTime} min
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-gray-500">{recipe.description}</p>

              <div className="mt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Ingredients</p>
                <ul className="mt-1.5 space-y-1 text-xs text-gray-600">
                  {recipe.ingredients.map((ingredient) => {
                    const available = recipe.matchedIngredients.includes(ingredient.name);
                    return (
                      <li key={ingredient.name} className={available ? "font-medium text-[#2E7D32]" : ""}>
                        {available ? "Available: " : "Need: "}{ingredient.quantity} {ingredient.name}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <p className="mt-3 text-xs text-[#2E7D32]">{recipe.matchedIngredients.length} of {recipe.ingredients.length} ingredients available</p>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onAddRecipe(recipe)}
                className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-[#4CAF50]/40 bg-white text-xs font-semibold text-[#2E7D32] transition hover:bg-[#E8F5E9] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CalendarPlus className="h-3.5 w-3.5" /> Add Recipe to Calendar
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
