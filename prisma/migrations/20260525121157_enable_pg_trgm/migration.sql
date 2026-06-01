-- Enable pg_trgm extension for fuzzy string matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN index on moduleNumber for similarity searches
CREATE INDEX IF NOT EXISTS "Module_moduleNumber_trgm_idx" ON "Module" USING gin ("moduleNumber" gin_trgm_ops);

-- Create GIN index on moduleName for similarity searches  
CREATE INDEX IF NOT EXISTS "Module_moduleName_trgm_idx" ON "Module" USING gin ("moduleName" gin_trgm_ops);