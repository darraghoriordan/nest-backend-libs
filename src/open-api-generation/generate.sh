#!/bin/sh
rm -rf $1/src
rm -rf $1/dist
npx @openapitools/openapi-generator-cli generate -i ./open-api/swagger.json -g typescript-fetch -o $1 --additional-properties=typescriptThreePlus=true,withInterfaces=true,npmName=shared-api-client,supportsES6=true,modelPropertyNaming=original,enumPropertyNaming=original
cp ./node_modules/@darraghor/nest-backend-libs/dist/open-api-generation/api-client-templates/api-client-ts-config-template.json $1/tsconfig.json
cp ./node_modules/@darraghor/nest-backend-libs/dist/open-api-generation/api-client-templates/package-json-template.json $1/package.json
cd $1
yarn

# install latest into the client
cd $2
rm -rf ./node_modules/shared-api-client
yarn install --check-files

# install latest into the e2e tests
cd $3
rm -rf ./node_modules/shared-api-client
yarn install --check-files