# Contributing Guidelines

## Development Requirements

### API Testing and Documentation
1. All API calls must be covered with one or more tests
2. All API calls must be documented using OpenAPI specification
3. When making changes:
   - Ensure existing tests and documentation are updated
   - Add tests and documentation for new features
   - Verify that documentation reflects the current API behavior

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