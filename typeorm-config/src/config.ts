import * as path from "path"
import * as process from "process"
import type {ConnectionOptions as OrmConfig} from "typeorm"
import {SnakeNamingStrategy} from "./namingStrategy"


export interface ConnectionOptions {
    host: string
    port: number
    database: string
    username: string
    password: string
    ssl?: {
        rejectUnauthorized: boolean
    }
}


export function createConnectionOptions(): ConnectionOptions {
    return {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
        database: process.env.DB_NAME || 'postgres',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'postgres',
        ssl: process.env.DB_SSL_ENABLED ? {rejectUnauthorized: false} : undefined
    }
}


export interface OrmOptions {
    projectDir?: string
}


export function createOrmConfig(options?: OrmOptions): OrmConfig {
    let dir = path.resolve(options?.projectDir || process.cwd())
    let model = resolveModel(path.join(dir, 'lib/model'))
    let migrationsDir = path.join(dir, 'db/migrations')
    return {
        type: 'postgres',
        namingStrategy: new SnakeNamingStrategy(),
        entities: [model],
        migrations: [migrationsDir + '/*.js'],
        cli: {
            migrationsDir
        },
        ...createConnectionOptions()
    }
}


function resolveModel(model?: string): string {
    model = path.resolve(model || 'lib/model')
    try {
        return require.resolve(model)
    } catch(e: any) {
        throw new Error(
            `Failed to resolve model ${model}. Did you forget to run codegen or compile the code?`
        )
    }
}
