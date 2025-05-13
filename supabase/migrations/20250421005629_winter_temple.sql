/*
  # Add dairy products to meals table

  1. Changes
    - Insert additional dairy products into the meals table
    - Ensure proper categorization for each product
    - Add Arabic descriptions for better user experience
*/

-- Insert additional dairy products into meals table
INSERT INTO meals (
  name,
  calories,
  protein,
  carbs,
  fat,
  description,
  category
) VALUES
-- Infant formulas and medical foods
('Infant formula, GOOD NIGHT, thick consistency', 506, 11, 58.5, 25.3, 'تركيبة حليب للرضع، سميكة القوام', 'breakfast'),
('Infant formula, dairy, Stage 1, powder', 500, 10.5, 57, 25, 'تركيبة حليب للرضع، المرحلة الأولى', 'breakfast'),
('Infant formula, dairy, Stage 2, powder', 500, 11, 56, 25, 'تركيبة حليب للرضع، المرحلة الثانية', 'breakfast'),
('Infant formula, dairy, Stage 3, powder', 500, 11.5, 55, 25, 'تركيبة حليب للرضع، المرحلة الثالثة', 'breakfast'),
('Infant formula, non-dairy, from age 1, ready to drink', 67, 1.6, 7.3, 3.5, 'تركيبة نباتية للرضع، جاهزة للشرب', 'breakfast'),

-- Milk puddings and desserts
('Milk pudding, 1.5% fat, chocolate', 120, 3.5, 22, 1.5, 'حلوى الحليب بالشوكولاتة، قليلة الدسم', 'snack'),
('Milk pudding, 3% fat, chocolate', 140, 3.5, 22, 3, 'حلوى الحليب بالشوكولاتة، متوسطة الدسم', 'snack'),
('Milk pudding, 3% fat, vanilla', 130, 3.5, 20, 3, 'حلوى الحليب بالفانيلا، متوسطة الدسم', 'snack'),
('Milk pudding with rice, vanilla', 150, 3, 25, 3, 'حلوى الحليب مع الأرز بالفانيلا', 'snack'),
('Milk pudding, 3% fat, strawberry/peach/pineapple', 135, 3.5, 21, 3, 'حلوى الحليب بنكهة الفراولة/الخوخ/الأناناس', 'snack'),
('Milk pudding, 4% fat, banana', 145, 3.5, 22, 4, 'حلوى الحليب بنكهة الموز', 'snack'),
('Milk pudding, 6-12% fat, with cream, chocolate', 200, 3.5, 25, 8, 'حلوى الحليب مع الكريمة بالشوكولاتة', 'snack'),
('Milk pudding, Malabi', 140, 3, 22, 3, 'حلوى المهلبية', 'snack'),
('Milk pudding 0% fat, chocolate/vanilla, with sweetener', 90, 3.5, 15, 0, 'حلوى الحليب خالية الدسم، بالشوكولاتة/الفانيلا، مع محلي', 'snack'),

-- Ice creams
('Ice cream, rich, berry/cherry/vanilla', 220, 3.5, 24, 12, 'آيس كريم غني بالتوت/الكرز/الفانيلا', 'snack'),
('Ice cream, dulce de leche/chocolate/brownies/coffee', 240, 4, 26, 13, 'آيس كريم بنكهة دولسي دي ليتشي/شوكولاتة/براونيز/قهوة', 'snack'),
('Ice cream, homemade', 250, 4, 25, 14, 'آيس كريم محضر منزلياً', 'snack'),
('Ice cream, vegetable fat, vanilla with additions', 200, 3, 25, 10, 'آيس كريم بدهون نباتية، فانيلا مع إضافات', 'snack'),
('Ice cream, rich, flavors other than chocolate', 230, 3.5, 25, 12, 'آيس كريم غني بنكهات متنوعة غير الشوكولاتة', 'snack'),
('Ice cream, rich, chocolate', 250, 4, 26, 14, 'آيس كريم غني بالشوكولاتة', 'snack'),
('Ice cream, vegetable fat, vanilla', 180, 3, 22, 9, 'آيس كريم بدهون نباتية، فانيلا', 'snack'),
('Ice cream, non-dairy', 170, 2.5, 25, 7, 'آيس كريم نباتي', 'snack'),
('Ice cream, light, no added sugar, various flavors', 120, 3, 18, 4, 'آيس كريم خفيف، بدون سكر مضاف، نكهات متنوعة', 'snack'),

-- Creams and specialty products
('Cream, 15% fat, for cooking', 170, 2.5, 3.5, 15, 'كريمة للطبخ، 15% دهون', 'breakfast'),
('Cream, 38% fat, for whipping', 380, 2.1, 3.1, 38, 'كريمة للخفق، 38% دهون', 'breakfast'),
('Cream, whipped, 38% fat, sweetened', 400, 2, 10, 38, 'كريمة مخفوقة، محلاة، 38% دهون', 'breakfast'),
('Cream, 32% fat, for whipping', 320, 2.2, 3.2, 32, 'كريمة للخفق، 32% دهون', 'breakfast'),
('Cream substitute, light, 3.5% fat, liquid', 50, 1, 5, 3.5, 'بديل كريمة خفيف، سائل، 3.5% دهون', 'breakfast'),
('Cream substitute, non-dairy, 25% fat, for whipping', 250, 1, 5, 25, 'بديل كريمة نباتي للخفق، 25% دهون', 'breakfast'),
('Cream substitute, powdered', 35, 0.5, 4, 2, 'بديل كريمة مجفف', 'breakfast'),
('Cream, 9% fat', 127, 8, 3.5, 9, 'كريمة، 9% دهون', 'breakfast'),

-- Milk desserts and specialty items
('Milk dessert or milk candy (Dulce de leche)', 315, 7, 55, 8, 'حلوى الحليب (دولسي دي ليتشي)', 'snack'),
('Sachleb, water-based, prepared from powder', 120, 1, 25, 2, 'سحلب محضر من المسحوق، أساسه الماء', 'snack'),
('Mousse, chocolate, non-dairy, homemade', 250, 3, 30, 12, 'موس الشوكولاتة النباتي، محضر منزلياً', 'snack'),
('Creme bavarian, homemade', 280, 5, 25, 18, 'كريم بافاريا، محضر منزلياً', 'snack'),
('Creme brulee, homemade', 300, 4, 26, 20, 'كريم بروليه، محضر منزلياً', 'snack');

-- Delete any existing meals with the same names to avoid duplicates
DO $$
DECLARE
  meal_name text;
  meal_names text[] := ARRAY[
    'Infant formula, GOOD NIGHT, thick consistency', 'Infant formula, dairy, Stage 1, powder',
    'Infant formula, dairy, Stage 2, powder', 'Infant formula, dairy, Stage 3, powder',
    'Infant formula, non-dairy, from age 1, ready to drink', 'Milk pudding, 1.5% fat, chocolate',
    'Milk pudding, 3% fat, chocolate', 'Milk pudding, 3% fat, vanilla',
    'Milk pudding with rice, vanilla', 'Milk pudding, 3% fat, strawberry/peach/pineapple',
    'Milk pudding, 4% fat, banana', 'Milk pudding, 6-12% fat, with cream, chocolate',
    'Milk pudding, Malabi', 'Milk pudding 0% fat, chocolate/vanilla, with sweetener',
    'Ice cream, rich, berry/cherry/vanilla', 'Ice cream, dulce de leche/chocolate/brownies/coffee',
    'Ice cream, homemade', 'Ice cream, vegetable fat, vanilla with additions',
    'Ice cream, rich, flavors other than chocolate', 'Ice cream, rich, chocolate',
    'Ice cream, vegetable fat, vanilla', 'Ice cream, non-dairy',
    'Ice cream, light, no added sugar, various flavors', 'Cream, 15% fat, for cooking',
    'Cream, 38% fat, for whipping', 'Cream, whipped, 38% fat, sweetened',
    'Cream, 32% fat, for whipping', 'Cream substitute, light, 3.5% fat, liquid',
    'Cream substitute, non-dairy, 25% fat, for whipping', 'Cream substitute, powdered',
    'Cream, 9% fat', 'Milk dessert or milk candy (Dulce de leche)',
    'Sachleb, water-based, prepared from powder', 'Mousse, chocolate, non-dairy, homemade',
    'Creme bavarian, homemade', 'Creme brulee, homemade'
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