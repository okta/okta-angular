set -e

# Run lint and unit tests. E2E tests are run on Bacon
yarn lint && yarn test:unit
