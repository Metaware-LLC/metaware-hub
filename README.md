# MetaWare Hub

## Overview

MetaWare Hub is a comprehensive **metadata management and data standardization platform** that helps organizations transform raw data into structured, business-ready intelligence. It provides an intuitive interface for defining data structures, creating business glossaries, and publishing production-ready data models.

## What Does It Do?

MetaWare Hub streamlines the process of standardizing business data through three main workflows:

### 1. **Build Your Foundation**
- **Organize Data Landscapes**: Create namespaces and subject areas to logically organize your data
- **Define Entities**: Set up different types of entities including:
  - **Staging**: Raw data entities for initial data ingestion
  - **Glossary**: Business vocabulary and standardized terms
  - **Model**: Production-ready data models
  - **Reference**: Reference data and lookup tables
- **Upload & Load Data**: Import data files and automatically create metadata structures
- **Apply Data Quality Rules**: Define and apply validation rules to ensure data quality

### 2. **Design Your Blueprint**
- **Create Business Glossaries**: Define standardized business terms and concepts
- **Map Source Associations**: Link raw data columns to standardized glossary terms
- **Visualize Relationships**: View data connections through interactive relationship graphs
- **Generate Standardized Models**: Automatically create standardized data blueprints

### 3. **Publish & Deploy**
- **Build Production Models**: Transform glossary blueprints into deployable data models
- **Generate Artifacts**: Create SQL artifacts and execution plans
- **Load & Validate**: Deploy and validate models in target environments
- **Execute Semantic Plans**: Run multi-step data transformation workflows

## Key Features

- **📊 Metadata Management**: Comprehensive metadata tracking with full lineage
- **🔄 Data Transformation**: Rule-based transformations with visual rule editor
- **📚 Business Glossary**: Centralized business vocabulary management
- **🔍 Data Quality**: Built-in data quality rules and validation framework
- **🎯 Semantic Modeling**: Advanced semantic execution plans with step-by-step workflows
- **📈 Visual Analytics**: Interactive dashboards and relationship graphs using ReactFlow
- **💾 DuckDB Integration**: In-browser data processing with MotherDuck WASM client
- **🔗 GraphQL API**: Full GraphQL integration for metadata operations
- **🎨 Modern UI**: Beautiful, responsive interface built with shadcn/ui

## Technology Stack

### Core Framework
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server

### UI Components
- **shadcn/ui** - Beautiful, accessible component library
- **Radix UI** - Headless UI primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Data & State Management
- **@tanstack/react-query** - Powerful data fetching and caching
- **Apollo Client** - GraphQL client
- **RxJS** - Reactive programming
- **React Hook Form** - Form management with validation

### Data Processing
- **DuckDB WASM** - In-browser analytics database
- **@motherduck/wasm-client** - MotherDuck integration
- **Apache Arrow** - Columnar data format

### Visualization
- **ReactFlow** - Interactive node-based graphs
- **Recharts** - Chart and data visualization
- **React Resizable Panels** - Flexible layouts

### Routing & Navigation
- **React Router DOM** - Client-side routing

## Database Schema

The platform uses a comprehensive PostgreSQL database schema (`DB_SCRIPT.sql`) with tables for:
- **Metadata Organization**: Namespaces, Subject Areas, Entities
- **Data Structures**: Tables, Columns, Meta definitions
- **Transformations**: Rules, Rulesets, Transforms
- **Glossary**: Business terms, relations, associations
- **Execution Plans**: Semantic execution plans and steps
- **Artifacts**: Generated SQL and build artifacts
- **Batch Processing**: Task scheduling and execution

## Getting Started

### Prerequisites
- Node.js (LTS version recommended)
- npm, pnpm, or bun package manager
- PostgreSQL database (for backend)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd metaware-hub

# Install dependencies
npm install
# or
pnpm install
# or
bun install
```

### Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure your environment variables for database connection and API endpoints.

### Development

```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Build for development (with dev mode)
npm run build:dev

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Database Setup

Initialize the database using the provided SQL script:

```bash
psql -U your_user -d your_database -f DB_SCRIPT.sql
```

## Project Structure

```
metaware-hub/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── layout/      # Layout components
│   │   ├── rules/       # Rule editor components
│   │   └── ui/          # shadcn/ui components
│   ├── pages/           # Application pages/routes
│   │   ├── metadata/    # Metadata management pages
│   │   ├── Staging.tsx  # Data staging page
│   │   ├── Glossary.tsx # Business glossary page
│   │   ├── BuildModels.tsx # Model building page
│   │   └── ...
│   ├── graphql/         # GraphQL queries and mutations
│   ├── hooks/           # Custom React hooks
│   ├── contexts/        # React context providers
│   ├── services/        # Business logic and services
│   ├── lib/             # Utility functions
│   └── config/          # Configuration files
├── public/              # Static assets
└── DB_SCRIPT.sql        # Database schema
```

## Key Pages

- **Start Here** (`/`) - Guided tour and onboarding
- **Dashboard** (`/dashboard`) - Overview and metrics
- **Metadata** (`/metadata/*`) - Namespace, Subject Area, Entity, and Meta management
- **Staging** (`/staging`) - Raw data management and preview
- **Glossary** (`/glossary`) - Business glossary and term mapping
- **Build Models** (`/build-models`) - Model generation and artifact creation
- **Publish** (`/model`) - Model publishing and deployment

## Contributing

This project uses:
- ESLint for code quality
- TypeScript for type safety
- Prettier (via Lovable) for code formatting

Make sure to run `npm run lint` before committing changes.

## License

[Add your license information here]

## Support

For questions or issues, please contact the development team or open an issue in the repository.
