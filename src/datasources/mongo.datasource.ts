import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './mongo.datasource.json';

export class MongoDataSource extends juggler.DataSource {
  static dataSourceName = 'mongo';

  constructor(
    @inject('datasources.config.mongo', {optional: true})
    dsConfig: object = {
      ...config,
      url: process.env.MONGO_URL,
      user: process.env.MONGO_USER_NAME,
      password: process.env.MONGO_PASSWORD,
    },
  ) {
    super(dsConfig);
  }
}
