#!/bin/sh
rm -rf ../shared-api-client/src
rm -rf ../shared-api-client/dist
npx @openapitools/openapi-generator-cli generate -i ./open-api/swagger.json -g typescript-fetch -o ../shared-api-client --additional-properties=typescriptThreePlus=true,withInterfaces=true,npmName=shared-api-client,supportsES6=true,modelPropertyNaming=original,enumPropertyNaming=original
cp ./node_modules/@darraghor/nest-backend-libs/dist/open-api-generation/api-client-templates/api-client-ts-config-template.json ../shared-api-client/tsconfig.json
cp ./node_modules/@darraghor/nest-backend-libs/dist/open-api-generation/api-client-templates/package-json-template.json ../shared-api-client/package.json
cd ../shared-api-client
yarn

# install latest into the client
cd ../frontend
rm -rf ./node_modules/shared-api-client
yarn install --check-files

# install latest into the e2e tests
cd ../e2e-backend
rm -rf ./node_modules/shared-api-client
yarn install --check-files