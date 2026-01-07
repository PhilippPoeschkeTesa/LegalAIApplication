# Database Migrations

This directory contains SQL migration files for the PostgreSQL database.

## Running Migrations

To run the migrations, execute the SQL files in order using `psql`:

```bash
psql -h localhost -U postgres -d postgres -f migrations/001_create_use_cases_table.sql
```

Or use the PostgreSQL connection from your `.env` file:

```bash
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f migrations/001_create_use_cases_table.sql
```

## Migration Files

- `001_create_use_cases_table.sql` - Creates the main use_cases table with all necessary columns, indexes, and constraints

## Notes

- Migrations use `IF NOT EXISTS` and `IF EXISTS` clauses to be idempotent
- All timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- JSONB columns are used for flexible data storage (arrays and objects)
- Indexes are created on frequently queried columns
- Check constraints ensure data integrity
