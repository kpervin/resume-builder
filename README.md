# Resume Builder

A modern web application for creating, editing, and managing professional resumes. Built with Payload CMS for powerful backend management and Next.js for a seamless user experience.

## What is Resume Builder?

Resume Builder is a full-stack application that allows users to:

- Create and customize professional resumes with an intuitive interface
- Store and manage multiple resume versions
- Export resumes in various formats
- Leverage AI-powered suggestions to enhance resume content
- Manage resume data through a powerful CMS interface

The application is built on a modern tech stack featuring:

- **Frontend**: Next.js 16 with React 19 and TypeScript
- **Backend**: Payload CMS 3 with PostgreSQL
- **Styling**: Tailwind CSS
- **AI Integration**: Google GenAI for intelligent content suggestions
- **Testing**: Vitest and Playwright

## Getting Started

### Prerequisites

This project uses **Proto** for automated tool version management. The required versions are configured in `.prototools`:

- **Node.js**: LTS version (automatically managed)
- **pnpm**: Latest version (automatically managed)

If you don't have Proto installed, [install it here](https://moonrepo.dev/proto).

### Local Setup

1. **Install Proto** (if not already installed)

   ```bash
   # Follow instructions at https://moonrepo.dev/proto
   ```

2. **Clone the repository**

   ```bash
   git clone https://github.com/kpervin/resume-builder.git
   cd resume-builder
   ```

3. **Proto will automatically set up your environment**
   When you enter the directory, Proto automatically installs the correct versions of Node.js and pnpm as defined in `.prototools`. If auto-install is enabled, this happens automatically. Otherwise, run:

   ```bash
   proto install
   ```

4. **Install dependencies**

   ```bash
   pnpm install
   ```

5. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration (database URL, Google GenAI API keys, etc.)

6. **Start the development server**
   ```bash
   pnpm dev
   ```
   The application will be available at `http://localhost:3000`

### Docker

Docker should be installed on your system to handle the database and CAPTCHA service.

The Docker services include:

- **PostgreSQL**: Database service on port 5432
- **Flaresolverr**: CAPTCHA solving service on port 8191

### Proto Configuration

The `.prototools` file configures:

- `node = "lts"` - Automatically uses the latest Node.js LTS version
- `pnpm = "latest"` - Automatically uses the latest pnpm version
- `auto-install = true` - Tools are installed automatically when you enter the directory
- `auto-clean = true` - Unused tool versions are cleaned up automatically

You can override these settings locally by modifying `.prototools`.

## Development Workflow

### Available Commands

- `pnpm dev` - Start the development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run linting checks with oxlint
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm fmt` - Format code with oxfmt
- `pnpm fmt:check` - Check code formatting without making changes
- `pnpm test` - Run all tests (integration and e2e)
- `pnpm test:int` - Run integration tests only (Vitest)
- `pnpm test:e2e` - Run end-to-end tests (Playwright)
- `pnpm codegen` - Generate types, import maps, and database schemas

### Code Generation

The project uses automated code generation for type safety:

```bash
pnpm codegen
```

This generates:

- Import maps for Payload
- TypeScript types from Payload collections
- Database schemas
- Next.js type generation

## Project Structure

```
resume-builder/
├── src/
│   ├── app/               # Next.js app directory
│   ├── collections/       # Payload CMS collections
│   ├── components/        # React components
│   ├── fields/           # Custom Payload fields
│   ├── migrations/       # Database migrations
│   ├── server-functions/ # Server-side functions
│   ├── utils/            # Utility functions
│   ├── env.ts            # Environment variable validation
│   └── payload.config.ts # Payload CMS configuration
│
├── tests/
│   ├── _setup/           # Test setup and fixtures
│   ├── e2e/              # End-to-end tests (Playwright)
│   ├── int/              # Integration tests (Vitest)
│   ├── helpers/          # Test helper functions
│   └── types/            # Test type definitions
│
├── .prototools           # Proto version management
├── docker-compose.local.yml    # Local development Docker setup
├── docker-compose.test.yml     # Test Docker setup
├── playwright.config.ts  # Playwright configuration
├── vitest.config.mts    # Vitest configuration
└── package.json
```

## Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started with Contributing

1. **Fork the repository** on GitHub
2. **Clone and setup** following the [Local Setup](#local-setup) steps above
3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** and commit them with clear messages
5. **Push to your fork** and create a Pull Request

### Development Requirements

Ensure your development environment is properly configured:

- Proto is installed and your tools are up-to-date
- Run `pnpm install` to ensure all dependencies are current
- Docker is running if you're using Docker setup

### Code Standards

- Run `pnpm lint` before submitting a PR
- Fix any linting issues with `pnpm lint:fix`
- Format code with `pnpm fmt`
- Write tests for new features
- Ensure all tests pass: `pnpm test`

### Pull Request Process

1. Update the README if you're adding new features or changing setup instructions
2. Ensure all tests pass locally
3. Verify code formatting with `pnpm fmt:check`
4. Keep commits clean and well-documented
5. Link any related issues in your PR description
6. Wait for code review before merging

### Running Tests Locally

Before submitting a PR, make sure tests pass:

```bash
pnpm test:int      # Integration tests
pnpm test:e2e      # End-to-end tests
pnpm test          # Full test suite
```

### Reporting Issues

Found a bug? Please [open an issue](https://github.com/kpervin/resume-builder/issues) with:

- A clear description of the problem
- Steps to reproduce the issue
- Expected vs. actual behavior
- Your environment (Proto versions, Node version, OS, etc.)

## Testing

This project includes comprehensive testing:

- **Unit & Integration Tests**: Run with `pnpm test:int` (uses Vitest)
- **End-to-End Tests**: Run with `pnpm test:e2e` (uses Playwright)
- **Full Test Suite**: Run with `pnpm test`
- Tests run in Docker containers for isolation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues:

- Open a [GitHub Discussion](https://github.com/kpervin/resume-builder/discussions)
- Check existing [Issues](https://github.com/kpervin/resume-builder/issues)
- Review the [Payload CMS Documentation](https://payloadcms.com/docs)
- Check [Proto Documentation](https://moonrepo.dev/proto) for tool version management issues
