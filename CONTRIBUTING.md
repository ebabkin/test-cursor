# Contributing Guidelines

## Development Requirements

### How to change the codebase
1. When making changes:
   - Review `db/schema.sql` to understand existing data structures
   - Avoid unnecessary changes to the database schema unless the prompt explicitly asks for it; OR if you need to change the DB - you should confirmed that with the reviewer
   - Ensure existing tests and documentation are updated
   - Add tests and documentation for new features
   - Verify that documentation reflects the current API behavior
   - Refer to all sections below 

### API Testing and Documentation
1. All API calls must be covered with one or more tests
2. All API calls must be documented using OpenAPI specification

### Quality Assurance
4. Before submitting changes:
   - Review the entire project to ensure changes don't break existing functionality
   - Run the full test suite
   - Validate API documentation accuracy

### Documentation
5. README.md must be kept up to date with:
   - Setup instructions
   - New features
   - Changed functionality
   - Updated dependencies

## Development Workflow

1. Create a new branch for your feature or fix
2. Write tests for new functionality
3. Implement your changes
4. Update documentation:
   - API documentation if endpoints are modified
   - README.md if necessary
   - Any relevant code comments
5. Run the test suite:
   ```bash
   npm test
   ```
6. Verify API documentation is accurate:
   - Start the development server: `npm run dev`
   - Check documentation at http://localhost:3000/api-docs
7. Submit a pull request

## Code Style

- Follow the existing code style and formatting
- Use TypeScript for all new files
- Include appropriate type definitions
- Add JSDoc comments for API documentation

## Testing

- Write tests for all new functionality
- Update existing tests when modifying features
- Ensure all tests pass before submitting changes
- Include both positive and negative test cases

## Documentation Standards

- Use OpenAPI 3.0.0 specification for API documentation
- Keep documentation clear and concise
- Include examples where appropriate
- Document error responses and edge cases

## Database Management

### Schema Documentation
1. The database schema is documented in `db/schema.sql`
   - This is the source of truth for database structure
   - AI systems and developers should refer to this file for database information
   - The file must be kept up to date with any database changes

### Database Changes
1. Before making any database changes:
   - Review `db/schema.sql` to understand existing data structures
   - Assess impact on existing features and data
   - Discuss significant structural changes with reviewers

2. When implementing database changes:
   - Create appropriate migration files
   - Update `db/schema.sql` to reflect the new structure
   - Add comments explaining the purpose of changes
   - Document any new constraints or dependencies

3. Pull Request Requirements:
   - Include both migration files and schema documentation updates
   - Explain why the database change is necessary
   - Document any data migration steps if applicable
   - Get explicit approval for schema changes from reviewers

### Schema Review Guidelines
1. Reviewers must:
   - Compare migration files against schema documentation
   - Verify documentation accuracy and completeness
   - Ensure changes don't break existing functionality
   - Check for proper handling of existing data

2. Changes that require extra scrutiny:
   - Column removals or renames
   - Changes to column types
   - New constraints on existing columns
   - Changes affecting unique indexes 