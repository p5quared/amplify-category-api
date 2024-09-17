import {
  addApiWithoutSchema,
  createNewProjectDir,
  deleteDBInstance,
  deleteProject,
  deleteProjectDir,
  importRDSDatabase,
  initJSProjectWithProfile,
  apiGenerateSchema,
  apiGenerateSchemaWithError,
  getProjectMeta,
  setupRDSInstanceAndData,
} from 'amplify-category-api-e2e-core';
import generator from 'generate-password';

describe('Auto Increment Support', async () => {
  const queries = ['CREATE TABLE "CoffeeQueue" (id SERIAL PRIMARY KEY, name VARCHAR(20), orderNumber SERIAL)'];

  const [db_user, db_password, db_identifier] = generator.generateMultiple(3);
  // Generate settings for RDS instance
  const username = db_user;
  const password = db_password;
  let region = 'us-east-1';
  let port = 3306;
  const database = 'default_db';
  let host = 'localhost';
  const identifier = `integtest${db_identifier}`;
  const engineSuffix = 'pg';
  const engineName = 'postgres';
  const projName = `${engineSuffix}generate`;
  const apiName = projName;

  let projRoot;

  beforeAll(async () => {
    projRoot = await createNewProjectDir(projName);
    await initJSProjectWithProfile(projRoot, {
      disableAmplifyAppCreation: false,
    });

    const metaAfterInit = getProjectMeta(projRoot);
    region = metaAfterInit.providers.awscloudformation.Region;
    await setupDatabase();

    await addApiWithoutSchema(projRoot, { transformerVersion: 2, apiName });

    await importRDSDatabase(projRoot, {
      engine: engineName,
      database,
      host,
      port,
      username,
      password,
      useVpc: true,
      apiExists: true,
    });
  });

  const setupDatabase = async () => {
    const dbConfig = {
      identifier,
      engine: 'postgres' as const,
      dbname: database,
      username,
      password,
      region,
    };

    const db = await setupRDSInstanceAndData(dbConfig, queries);
    port = db.port;
    host = db.endpoint;
  };
});
