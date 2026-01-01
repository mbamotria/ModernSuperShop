export const ALL_PRODUCTS = [
  { id: 1, name: 'Milk', price: 3.50, image: '🥛', stock: 50 }, 
  { id: 2, name: 'Bread', price: 2.75, image: '🍞', stock: 30 },
  { id: 3, name: 'Eggs', price: 4.20, image: '🥚', stock: 24 }, 
  { id: 4, name: 'Cereal', price: 5.00, image: '🥣', stock: 40 },
  { id: 5, name: 'Butter', price: 3.80, image: '🧈', stock: 25 }, 
  { id: 6, name: 'Coffee', price: 8.50, image: '☕', stock: 20 },
  { id: 7, name: 'Bananas', price: 1.99, image: '🍌', stock: 100 }, 
  { id: 8, name: 'Apples', price: 2.50, image: '🍎', stock: 60 },
  { id: 9, name: 'Chicken', price: 9.99, image: '🍗', stock: 15 }, 
  { id: 10, name: 'Pasta', price: 1.50, image: '🍝', stock: 80 },
  { id: 11, name: 'Pasta Sauce', price: 2.80, image: '🥫', stock: 35 }, 
  { id: 12, name: 'Cheese', price: 6.75, image: '🧀', stock: 20 },
  { id: 13, name: 'Yogurt', price: 1.25, image: '🍦', stock: 45 }, 
  { id: 14, name: 'Potatoes', price: 3.00, image: '🥔', stock: 70 },
];

export const PURCHASE_ASSOCIATIONS = {
  1: { 4: 85, 3: 60, 6: 45, 2: 40, 7: 30 }, 
  2: { 5: 90, 3: 75, 12: 65, 1: 40 }, 
  3: { 2: 75, 1: 60, 12: 50, 9: 40 },
  4: { 1: 85, 7: 55, 13: 30 }, 
  5: { 2: 90, 14: 40 }, 
  6: { 1: 45, 2: 35 }, 
  7: { 4: 55, 1: 30, 13: 35 },
  8: { 9: 40, 12: 35 }, 
  9: { 14: 60, 8: 40, 3: 35 }, 
  10: { 11: 95, 12: 70, 2: 30 }, 
  11: { 10: 95, 12: 60 },
  12: { 2: 75, 10: 70, 11: 65, 3: 50 }, 
  13: { 4: 40, 7: 35 }, 
  14: { 9: 60, 5: 45 }
};