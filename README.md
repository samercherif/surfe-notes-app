# Surfe Notes App

[![Main CI Pipeline](https://github.com/samercherif/surfe-notes-app/actions/workflows/main.yml/badge.svg)](https://github.com/samercherif/surfe-notes-app/actions/workflows/main.yml)

## Tech Stack

- React 18.3.1
- TypeScript 5.6.2
- Vite 5.4.8
- Yarn 4.5.1 (with PnP)
- Jest & React Testing Library for unit tests
- ESLint & Prettier config included in this project

## Prerequisites

- Node.js 22.11.0
- Yarn 4.5.1

## Installation

```bash
# Clone the repository
git clone https://github.com/samercherif/surfe-notes-app.git
cd surfe-notes-app

# Install dependencies
yarn set version 4.5.1
yarn install
```

## Configuring Visual Studio Code

### Install the ZipFS extension
to allow VSCode to read directly from Yarn's zip files. Search for "Zip File System" in the VSCode extensions marketplace and install it.

### PnPify SDK Setup
For enhanced compatibility with TypeScript, ESLint, and other tools, you may need to run PnPify. This step generates a `.vscode/pnpify` directory and a `.vscode/settings.json` file configured for Yarn PnP.
  ```bash
   yarn dlx @yarnpkg/sdks vscode
   ```
Select the workspace versions of TypeScript and ESLint in VSCode when prompted, to ensure you're using the versions managed by Yarn PnP.

## Available Scripts

```bash
# Start development server: This will compile the app and serve it at `http://localhost:3000`. The project is now running and will be automatically accessed from the web browser.
yarn dev

# eslint check
yarn lint

# Eslint check with fix of auto-fixable issues
yarn lint:fix

# Build for production
yarn build

# Run tests
yarn test

# Run tests with coverage
yarn test:coverage

# Format code
yarn prettier
```
