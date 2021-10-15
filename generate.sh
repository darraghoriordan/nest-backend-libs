#!/bin/sh
rm -rf ../shared-api-client/src
rm -rf ../shared-api-client/dist
npx @openapitools/openapi-generator-cli generate -i ./open-api/swagger.json -g typescript-fetch -o ../shared-api-client --additional-properties=typescriptThreePlus=true,withInterfaces=true,npmName=shared-api-client,supportsES6=true,modelPropertyNaming=original,enumPropertyNaming=original
cp ./api-client-templates/api-client-ts-config-template.json ../shared-api-client/tsconfig.json
cp ./api-client-templates/package-json-template.json ../shared-api-client/package.json
cd ../shared-api-client
npm install

# install latest into the client
cd ../frontend
rm -rf ./node_modules/shared-api-client
npm i

# install latest into the client
cd ../e2e-backend
rm -rf ./node_modules/shared-api-client
npm i