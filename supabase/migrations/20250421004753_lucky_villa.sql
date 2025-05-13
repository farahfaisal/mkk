/*
  # Add dairy products to meals table

  1. Changes
    - Add various milk products
    - Add yogurt products
    - Add cheese products
    - Add other dairy products
    - Each product includes calories, protein, carbs, and fat values
*/

-- Insert dairy products into meals table
INSERT INTO meals (
  name,
  calories,
  protein,
  carbs,
  fat,
  description,
  category
) VALUES
-- Milk products
('Milk, cow, 3% fat', 60, 3.3, 4.6, 3, 'حليب بقر كامل الدسم', 'breakfast'),
('Milk, cow, 1% fat', 43, 3.3, 5.1, 1, 'حليب بقر قليل الدسم', 'breakfast'),
('Milk, goat, 4% fat', 69, 3.6, 4.5, 4.1, 'حليب ماعز كامل الدسم', 'breakfast'),
('Milk, sheep, 7% fat', 108, 6, 5.4, 7, 'حليب غنم كامل الدسم', 'breakfast'),
('Milk, camel', 58, 3.1, 4.7, 3, 'حليب ناقة', 'breakfast'),

-- Yogurt products
('Yogurt, 4.5% fat', 68, 3.3, 3.5, 4.5, 'زبادي كامل الدسم', 'breakfast'),
('Yogurt, 1.5% fat', 48, 3.6, 4.3, 1.5, 'زبادي قليل الدسم', 'breakfast'),
('Yogurt, plain, 3% fat', 65, 4.7, 4.7, 3, 'زبادي طبيعي متوسط الدسم', 'breakfast'),
('Yogurt, 0% fat, with fruit', 40, 4.8, 4.9, 0, 'زبادي خالي الدسم مع الفواكه', 'breakfast'),
('Yogurt drink, 1.5% fat', 94, 3.1, 17.2, 1.5, 'مشروب زبادي', 'breakfast'),

-- Cheese products
('Cheese, cottage, 5% fat', 91, 8, 3.5, 5, 'جبنة قريش', 'breakfast'),
('Cheese, cream, 9% fat', 127, 8, 3.5, 9, 'جبنة كريمية', 'breakfast'),
('Cheese, feta style, 16% fat', 166, 9, 1.1, 16, 'جبنة فيتا', 'breakfast'),
('Cheese, hard, yellow, 28% fat', 350, 25, 2, 28, 'جبنة صفراء صلبة', 'breakfast'),
('Cheese, mozzarella', 280, 22, 2.2, 22, 'جبنة موزاريلا', 'breakfast'),
('Cheese, parmesan', 420, 38, 3.2, 29, 'جبنة بارميزان', 'breakfast'),

-- Other dairy products
('Butter, salted', 717, 0.9, 0.1, 81, 'زبدة مملحة', 'breakfast'),
('Cream, sour, 15% fat', 170, 2.5, 3.5, 15, 'قشدة حامضة', 'breakfast'),
('Cream, sweet, 38% fat', 380, 2.1, 3.1, 38, 'قشدة حلوة', 'breakfast'),
('Milk substitute, almond', 30, 1.1, 3.5, 1.5, 'بديل حليب اللوز', 'breakfast'),
('Milk substitute, soy', 54, 3.3, 4.5, 2.3, 'بديل حليب الصويا', 'breakfast'),
('Whey protein powder', 400, 80, 10, 7, 'مسحوق بروتين مصل اللبن', 'breakfast');

-- Delete any existing meals with the same names to avoid duplicates
-- This is a safer approach than using ON CONFLICT when we don't have a unique constraint
DO $$
DECLARE
  meal_name text;
  meal_names text[] := ARRAY[
    'Milk, cow, 3% fat', 'Milk, cow, 1% fat', 'Milk, goat, 4% fat', 'Milk, sheep, 7% fat', 'Milk, camel',
    'Yogurt, 4.5% fat', 'Yogurt, 1.5% fat', 'Yogurt, plain, 3% fat', 'Yogurt, 0% fat, with fruit', 'Yogurt drink, 1.5% fat',
    'Cheese, cottage, 5% fat', 'Cheese, cream, 9% fat', 'Cheese, feta style, 16% fat', 'Cheese, hard, yellow, 28% fat', 
    'Cheese, mozzarella', 'Cheese, parmesan', 'Butter, salted', 'Cream, sour, 15% fat', 'Cream, sweet, 38% fat',
    'Milk substitute, almond', 'Milk substitute, soy', 'Whey protein powder'
  ];
BEGIN
  FOREACH meal_name IN ARRAY meal_names LOOP
    -- Skip the meal we just inserted
    DELETE FROM meals 
    WHERE name = meal_name 
    AND id NOT IN (
      SELECT id FROM meals 
      WHERE name = meal_name 
      ORDER BY created_at DESC 
      LIMIT 1
    );
  END LOOP;
END $$;