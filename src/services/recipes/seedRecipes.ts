import { Recipe } from "@/types/recipe";

export const CURATED_GLOBAL_RECIPES: Recipe[] = [
  {
    id: "1",
    title: "Pan-Seared Salmon with Lemon Herb Butter",
    description: "Crispy skin salmon fillets coated in garlic herb butter with fresh dill and bright lemon zest.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    cuisine: "Mediterranean",
    diet: "pescatarian",
    dishTypes: ["dinner", "seafood", "main course"],
    readyInMinutes: 20,
    servings: 4,
    calories: 450,
    nutrition: { calories: 450, protein: 38, carbs: 4, fat: 30, fiber: 1, sugar: 0 },
    ingredients: [
      { name: "Salmon fillets", amount: 4, unit: "pieces" },
      { name: "Olive oil", amount: 2, unit: "tbsp" },
      { name: "Unsalted butter", amount: 3, unit: "tbsp" },
      { name: "Garlic", amount: 3, unit: "cloves" },
      { name: "Lemon", amount: 1, unit: "whole" },
      { name: "Fresh dill", amount: 2, unit: "tbsp" },
      { name: "Salt", amount: 1, unit: "tsp" },
      { name: "Black pepper", amount: 0.5, unit: "tsp" }
    ],
    instructions: [
      "Pat salmon fillets dry and season both sides generously with salt and freshly cracked pepper.",
      "Heat olive oil in a heavy stainless steel or cast iron skillet over medium-high heat until shimmering.",
      "Place salmon skin-side down and cook for 4-5 minutes undisturbed until the skin is crisp and golden.",
      "Flip carefully, reduce heat to medium, and add butter, minced garlic, and fresh dill to the skillet.",
      "Baste the salmon continuously with the bubbling garlic-dill butter for 2-3 minutes.",
      "Squeeze fresh lemon juice over the fish and remove from heat. Serve immediately with lemon wedges."
    ],
    tags: ["Seafood", "Keto", "High Protein", "Quick Dinner"],
    isFeatured: true
  },
  {
    id: "2",
    title: "Authentic North Indian Butter Chicken",
    description: "Tender roasted chicken marinated in spiced yogurt and simmered in a velvety aromatic tomato-fenugreek sauce.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    cuisine: "Indian",
    diet: "non-vegetarian",
    dishTypes: ["dinner", "curry", "main course"],
    readyInMinutes: 40,
    servings: 4,
    calories: 560,
    nutrition: { calories: 560, protein: 42, carbs: 14, fat: 38, fiber: 3, sugar: 6 },
    ingredients: [
      { name: "Boneless chicken thighs", amount: 600, unit: "g" },
      { name: "Greek yogurt", amount: 0.5, unit: "cup" },
      { name: "Garam masala", amount: 2, unit: "tsp" },
      { name: "Kashmiri chili powder", amount: 2, unit: "tsp" },
      { name: "Ginger garlic paste", amount: 2, unit: "tbsp" },
      { name: "Butter", amount: 3, unit: "tbsp" },
      { name: "Tomato puree", amount: 2, unit: "cups" },
      { name: "Heavy cream", amount: 0.5, unit: "cup" },
      { name: "Kasuri methi (Dried fenugreek)", amount: 1, unit: "tbsp" }
    ],
    instructions: [
      "Marinate diced chicken with yogurt, half of ginger-garlic paste, chili powder, and garam masala for at least 20 minutes.",
      "Sear marinated chicken in a hot skillet with 1 tablespoon of butter until charred on the edges (approx 6-8 minutes). Set aside.",
      "In the same pan, melt remaining butter and sauté remaining ginger-garlic paste for 1 minute.",
      "Pour in tomato puree and simmer over low heat for 12-15 minutes until oil separates.",
      "Stir in heavy cream, roasted kasuri methi crushed between your palms, and the cooked chicken pieces.",
      "Simmer on low for another 6-8 minutes until rich and thick. Serve with warm garlic naan or basmati rice."
    ],
    tags: ["Indian", "Comfort Food", "High Protein", "Curry"],
    isFeatured: true
  },
  {
    id: "3",
    title: "Mediterranean Quinoa & Roasted Veggie Bowl",
    description: "Fluffy quinoa topped with kalamata olives, crisp cucumbers, cherry tomatoes, and crumbled feta cheese with lemon oregano vinaigrette.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    cuisine: "Mediterranean",
    diet: "vegetarian",
    dishTypes: ["lunch", "salad", "bowl"],
    readyInMinutes: 25,
    servings: 2,
    calories: 380,
    nutrition: { calories: 380, protein: 14, carbs: 46, fat: 16, fiber: 7, sugar: 4 },
    ingredients: [
      { name: "Quinoa", amount: 1, unit: "cup" },
      { name: "Cherry tomatoes", amount: 1, unit: "cup" },
      { name: "Cucumber", amount: 1, unit: "medium" },
      { name: "Kalamata olives", amount: 0.5, unit: "cup" },
      { name: "Feta cheese", amount: 80, unit: "g" },
      { name: "Extra virgin olive oil", amount: 3, unit: "tbsp" },
      { name: "Lemon juice", amount: 2, unit: "tbsp" },
      { name: "Dried oregano", amount: 1, unit: "tsp" }
    ],
    instructions: [
      "Rinse quinoa under cold water. Simmer with 2 cups of salted water for 15 minutes until liquid is absorbed, then fluff with a fork.",
      "Halve cherry tomatoes, dice cucumber, and pit olives.",
      "Whisk olive oil, lemon juice, dried oregano, salt, and pepper in a small jar to make the dressing.",
      "Divide cooled quinoa into serving bowls, arrange vegetables and olives on top.",
      "Crumble fresh feta cheese over the bowl and drizzle with the dressing. Serve chilled or room temperature."
    ],
    tags: ["Vegetarian", "Healthy", "Meal Prep", "Mediterranean"],
    isFeatured: true
  },
  {
    id: "4",
    title: "Spicy Thai Basil Chicken (Pad Krapow Gai)",
    description: "A sizzling Thai street-food classic with minced chicken, fiery bird's eye chilies, garlic, and fresh fragrant Thai holy basil.",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    cuisine: "Thai",
    diet: "non-vegetarian",
    dishTypes: ["dinner", "stir-fry", "quick"],
    readyInMinutes: 15,
    servings: 2,
    calories: 410,
    nutrition: { calories: 410, protein: 36, carbs: 12, fat: 22, fiber: 2, sugar: 5 },
    ingredients: [
      { name: "Ground chicken", amount: 400, unit: "g" },
      { name: "Thai bird's eye chilies", amount: 4, unit: "pieces" },
      { name: "Garlic", amount: 5, unit: "cloves" },
      { name: "Oyster sauce", amount: 1.5, unit: "tbsp" },
      { name: "Soy sauce", amount: 1, unit: "tbsp" },
      { name: "Fish sauce", amount: 1, unit: "tbsp" },
      { name: "Brown sugar", amount: 1, unit: "tsp" },
      { name: "Thai basil leaves", amount: 1.5, unit: "cups" }
    ],
    instructions: [
      "Pound garlic and bird's eye chilies together in a mortar and pestle into a rough aromatic paste.",
      "Heat cooking oil in a wok over high heat. Add the chili-garlic paste and stir-fry for 20 seconds until fragrant.",
      "Add minced chicken, breaking up clumps quickly with your spatula until browned (3-4 minutes).",
      "Stir together oyster sauce, soy sauce, fish sauce, and sugar; pour into the wok and toss evenly.",
      "Turn off the heat, toss in the Thai basil leaves, and fold until wilted from residual heat. Serve with jasmine rice and a crispy fried egg."
    ],
    tags: ["Thai", "Spicy", "Quick Dinner", "High Protein"]
  },
  {
    id: "5",
    title: "South Indian Sambar with Seasonal Vegetables",
    description: "Traditional Tamil lentil stew simmered with drumsticks, shallots, tamarind pulp, and freshly ground sambar masala.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    cuisine: "Indian",
    diet: "vegan",
    dishTypes: ["lunch", "dinner", "soup", "stew"],
    readyInMinutes: 30,
    servings: 4,
    calories: 260,
    nutrition: { calories: 260, protein: 12, carbs: 42, fat: 5, fiber: 9, sugar: 6 },
    ingredients: [
      { name: "Toor dal (Split pigeon peas)", amount: 1, unit: "cup" },
      { name: "Shallots (Pearl onions)", amount: 10, unit: "pieces" },
      { name: "Tomatoes", amount: 2, unit: "medium" },
      { name: "Tamarind paste", amount: 1, unit: "tbsp" },
      { name: "Sambar powder", amount: 2, unit: "tbsp" },
      { name: "Turmeric powder", amount: 0.5, unit: "tsp" },
      { name: "Mustard seeds", amount: 1, unit: "tsp" },
      { name: "Curry leaves", amount: 12, unit: "leaves" }
    ],
    instructions: [
      "Pressure cook toor dal with turmeric and 3 cups of water until soft and mashable.",
      "In a pot, boil shallots, tomatoes, and vegetables in 1.5 cups water with salt and tamarind extract.",
      "Stir in sambar powder and simmer for 8 minutes until vegetables are tender.",
      "Add mashed cooked dal and adjust consistency with water. Bring to a gentle boil.",
      "In a small pan, temper mustard seeds, cumin, and curry leaves in hot oil; pour sizzling into the sambar and cover."
    ],
    tags: ["Indian", "Vegan", "Comfort Food", "Gluten-Free"]
  },
  {
    id: "6",
    title: "Classic Italian Creamy Wild Mushroom Risotto",
    description: "Arborio rice slowly cooked in rich vegetable broth with sautéed cremini and porcini mushrooms, finished with butter and aged Parmesan.",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    cuisine: "Italian",
    diet: "vegetarian",
    dishTypes: ["dinner", "main course"],
    readyInMinutes: 35,
    servings: 4,
    calories: 480,
    nutrition: { calories: 480, protein: 11, carbs: 62, fat: 18, fiber: 4, sugar: 3 },
    ingredients: [
      { name: "Arborio rice", amount: 1.5, unit: "cups" },
      { name: "Mixed wild mushrooms", amount: 350, unit: "g" },
      { name: "Shallot", amount: 1, unit: "finely chopped" },
      { name: "Garlic", amount: 2, unit: "cloves" },
      { name: "Dry white wine", amount: 0.5, unit: "cup" },
      { name: "Vegetable broth", amount: 4, unit: "cups (warm)" },
      { name: "Parmesan cheese", amount: 0.5, unit: "cup (grated)" },
      { name: "Butter", amount: 2, unit: "tbsp" }
    ],
    instructions: [
      "Sauté sliced wild mushrooms in 1 tablespoon butter until golden brown and caramelized. Set half aside for garnish.",
      "In a wide saucepan, sweat shallots and garlic in remaining butter until translucent.",
      "Add arborio rice and toast for 2 minutes until grains are translucent around edges.",
      "Pour in white wine and stir until fully absorbed.",
      "Ladle warm broth one cup at a time, stirring steadily until each ladle is absorbed before adding the next (approx 18-20 minutes).",
      "Stir in cooked mushrooms, parmesan, and black pepper. Cover for 2 minutes off heat and serve creamy."
    ],
    tags: ["Italian", "Vegetarian", "Comfort Food", "Dinner"]
  },
  {
    id: "7",
    title: "Japanese Tonkotsu-Style Miso Ramen",
    description: "Savory rich miso broth layered with springy ramen noodles, soft-boiled ajitsuke tamago, bamboo shoots, and tender scallions.",
    image: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    cuisine: "Japanese",
    diet: "non-vegetarian",
    dishTypes: ["dinner", "soup", "noodles"],
    readyInMinutes: 35,
    servings: 2,
    calories: 520,
    nutrition: { calories: 520, protein: 28, carbs: 64, fat: 19, fiber: 4, sugar: 5 },
    ingredients: [
      { name: "Fresh ramen noodles", amount: 250, unit: "g" },
      { name: "Chicken or vegetable stock", amount: 4, unit: "cups" },
      { name: "Red or white miso paste", amount: 3, unit: "tbsp" },
      { name: "Soy sauce", amount: 1.5, unit: "tbsp" },
      { name: "Sesame oil", amount: 1, unit: "tbsp" },
      { name: "Eggs", amount: 2, unit: "soft boiled" },
      { name: "Green onions", amount: 3, unit: "stalks" },
      { name: "Nori seaweed sheets", amount: 2, unit: "sheets" }
    ],
    instructions: [
      "Whisk miso paste, soy sauce, grated garlic, and sesame oil with 0.5 cup warm stock until smooth.",
      "Bring remaining stock to a gentle simmer, whisk in the miso tare mixture, and keep piping hot without boiling.",
      "Cook ramen noodles in boiling water for 90-120 seconds, then drain thoroughly.",
      "Divide noodles between deep bowls, pour steaming miso broth over them.",
      "Top with halved marinated soft-boiled eggs, sliced scallions, and nori sheets. Serve immediately."
    ],
    tags: ["Japanese", "Soup", "Noodles", "Comfort Food"]
  },
  {
    id: "8",
    title: "Zesty Mexican Street Tacos with Guacamole",
    description: "Warm corn tortillas filled with citrus-marinated grilled chicken or black beans, topped with fresh pico de gallo and cotija cheese.",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    cuisine: "Mexican",
    diet: "non-vegetarian",
    dishTypes: ["dinner", "street food", "quick"],
    readyInMinutes: 25,
    servings: 3,
    calories: 440,
    nutrition: { calories: 440, protein: 32, carbs: 38, fat: 18, fiber: 6, sugar: 3 },
    ingredients: [
      { name: "Chicken breast or black beans", amount: 400, unit: "g" },
      { name: "Corn tortillas", amount: 6, unit: "small" },
      { name: "Lime juice", amount: 2, unit: "tbsp" },
      { name: "Ground cumin", amount: 1, unit: "tsp" },
      { name: "Chili powder", amount: 1, unit: "tsp" },
      { name: "Ripe avocado", amount: 1, unit: "medium" },
      { name: "Cilantro (optional)", amount: 2, unit: "tbsp" },
      { name: "Red onion", amount: 0.5, unit: "finely diced" }
    ],
    instructions: [
      "Toss chicken or beans in lime juice, cumin, chili powder, salt, and olive oil.",
      "Sear in a hot skillet for 6-8 minutes until cooked through and lightly charred.",
      "Mash avocado with lime juice, salt, and diced red onion to make fresh guacamole.",
      "Warm corn tortillas directly over a dry skillet until soft and blistered.",
      "Assemble tacos with grilled fillings, spoonful of guacamole, and fresh lime wedges."
    ],
    tags: ["Mexican", "Street Food", "Quick", "High Protein"]
  },
  {
    id: "9",
    title: "Avocado & Poached Egg Sourdough Toast",
    description: "Creamy smashed Haas avocado on toasted whole-grain sourdough with a delicate runny poached egg and crushed red chili flakes.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    cuisine: "American",
    diet: "eggetarian",
    dishTypes: ["breakfast", "brunch", "quick"],
    readyInMinutes: 12,
    servings: 2,
    calories: 320,
    nutrition: { calories: 320, protein: 14, carbs: 24, fat: 19, fiber: 7, sugar: 2 },
    ingredients: [
      { name: "Artisan sourdough bread", amount: 2, unit: "thick slices" },
      { name: "Ripe avocados", amount: 1, unit: "large" },
      { name: "Eggs", amount: 2, unit: "farm fresh" },
      { name: "Lemon juice", amount: 1, unit: "tsp" },
      { name: "Red pepper flakes", amount: 0.25, unit: "tsp" },
      { name: "Flaky sea salt", amount: 0.5, unit: "tsp" },
      { name: "Extra virgin olive oil", amount: 1, unit: "tsp" }
    ],
    instructions: [
      "Toast sourdough slices until crispy and golden brown.",
      "Mash avocado in a bowl with lemon juice, sea salt, and a pinch of black pepper.",
      "Bring 3 inches of water in a small pot to a bare simmer. Swirl gently to create a whirlpool.",
      "Crack egg into the center and poach for 3 minutes for a luscious runny yolk.",
      "Spread creamy avocado across toast, carefully place poached egg on top, and dust with flaky salt and chili flakes."
    ],
    tags: ["Breakfast", "Eggetarian", "Quick", "Healthy"]
  },
  {
    id: "10",
    title: "Paneer Tikka Masala in Spiced Tomato Gravy",
    description: "Char-grilled fresh cottage cheese cubes cooked in a spiced velvety tomato, ginger, and onion gravy.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    cuisine: "Indian",
    diet: "vegetarian",
    dishTypes: ["dinner", "curry", "main course"],
    readyInMinutes: 35,
    servings: 4,
    calories: 460,
    nutrition: { calories: 460, protein: 22, carbs: 16, fat: 34, fiber: 4, sugar: 6 },
    ingredients: [
      { name: "Paneer (Cottage cheese)", amount: 350, unit: "g (cubed)" },
      { name: "Bell peppers", amount: 1, unit: "cubed" },
      { name: "Onions", amount: 2, unit: "finely chopped" },
      { name: "Tomato puree", amount: 1.5, unit: "cups" },
      { name: "Ginger garlic paste", amount: 1.5, unit: "tbsp" },
      { name: "Garam masala", amount: 1.5, unit: "tsp" },
      { name: "Heavy cream", amount: 3, unit: "tbsp" },
      { name: "Kasuri methi", amount: 1, unit: "tsp" }
    ],
    instructions: [
      "Pan-fry paneer cubes and bell pepper chunks with a pinch of turmeric and salt until golden.",
      "In a skillet, sauté chopped onions until deep caramelized brown.",
      "Add ginger-garlic paste, coriander powder, chili powder, and tomato puree. Simmer for 10 minutes until oil glazes the top.",
      "Gently fold in paneer cubes, cream, and crushed kasuri methi.",
      "Simmer for 4 minutes to let flavors permeate. Serve hot with roti or jeera rice."
    ],
    tags: ["Indian", "Vegetarian", "High Protein", "Curry"]
  },
  {
    id: "11",
    title: "Aromatic Hyderabadi Vegetable Biryani",
    description: "Layered fragrant long-grain basmati rice with spiced mixed vegetables, caramelized onions, saffron milk, and fresh mint.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    cuisine: "Indian",
    diet: "vegetarian",
    dishTypes: ["dinner", "rice", "festive"],
    readyInMinutes: 50,
    servings: 4,
    calories: 420,
    nutrition: { calories: 420, protein: 10, carbs: 70, fat: 12, fiber: 6, sugar: 4 },
    ingredients: [
      { name: "Basmati rice", amount: 2, unit: "cups" },
      { name: "Potatoes", amount: 2, unit: "cubed" },
      { name: "Carrots & peas", amount: 1.5, unit: "cups" },
      { name: "Biryani masala", amount: 2, unit: "tbsp" },
      { name: "Yogurt", amount: 0.5, unit: "cup" },
      { name: "Fried onions (Birista)", amount: 0.75, unit: "cup" },
      { name: "Saffron strands", amount: 1, unit: "pinch in warm milk" },
      { name: "Fresh mint leaves", amount: 0.5, unit: "cup" }
    ],
    instructions: [
      "Par-boil basmati rice with whole spices (cardamom, cloves, bay leaf) until 70% cooked. Drain immediately.",
      "Cook vegetables with yogurt, biryani masala, ginger-garlic, and salt until 80% tender.",
      "In a heavy pot, layer vegetable masala, par-boiled rice, fried onions, chopped mint, and saffron milk.",
      "Seal pot with a tight lid and cook on dum (very low heat) for 20 minutes.",
      "Fluff gently from the bottom and serve with cool cucumber raita."
    ],
    tags: ["Indian", "Vegetarian", "Aromatic", "Dinner"]
  },
  {
    id: "12",
    title: "Classic Spaghetti Alla Carbonara",
    description: "Traditional Roman pasta tossed with crispy guanciale or pancetta, freshly grated Pecorino Romano, egg yolks, and cracked black pepper.",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    cuisine: "Italian",
    diet: "non-vegetarian",
    dishTypes: ["dinner", "pasta", "quick"],
    readyInMinutes: 20,
    servings: 2,
    calories: 540,
    nutrition: { calories: 540, protein: 24, carbs: 58, fat: 26, fiber: 2, sugar: 2 },
    ingredients: [
      { name: "Spaghetti", amount: 220, unit: "g" },
      { name: "Pancetta or bacon", amount: 120, unit: "g" },
      { name: "Egg yolks", amount: 3, unit: "large" },
      { name: "Pecorino Romano or Parmesan", amount: 60, unit: "g" },
      { name: "Black pepper", amount: 1.5, unit: "tsp coarsely ground" }
    ],
    instructions: [
      "Boil spaghetti in salted water until strictly al dente. Reserve 0.5 cup starchy pasta cooking water.",
      "In a skillet, render diced pancetta until crispy. Turn off flame.",
      "Whisk egg yolks and grated cheese in a bowl with freshly ground black pepper.",
      "Transfer hot drained pasta directly into the pancetta pan, tossing to coat.",
      "Quickly pour in the egg-cheese mixture along with a splash of hot pasta water, stirring vigorously off heat to create a silky glossy sauce without curdling."
    ],
    tags: ["Italian", "Pasta", "Quick", "Dinner"]
  }
];
