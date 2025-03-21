import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as Schema from './schema';
export const DRIZZLE = Symbol('DRIZZLE');

@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get<string>('DB_URL');
        const pool = new Pool({ connectionString: dbUrl, ssl: true });
        return drizzle(pool, {
          schema: Schema,
        }) as NodePgDatabase<typeof Schema>;
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
