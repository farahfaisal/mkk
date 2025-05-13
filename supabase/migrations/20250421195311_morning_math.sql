/*
  # Delete all meal data while preserving table structure

  1. Changes
    - First delete records from schedule_meals that reference meals
    - Then delete all records from the meals table
    - Preserve the table structure and constraints
    - Handle foreign key constraints properly
*/

-- First delete from schedule_meals to remove foreign key references
DELETE FROM schedule_meals;

-- Now we can safely delete all meals
DELETE FROM meals;

-- Log the operation
DO $$
BEGIN
  RAISE NOTICE 'All meal data has been deleted from the database while preserving the table structure';
END $$;