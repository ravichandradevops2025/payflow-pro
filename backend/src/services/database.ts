
import { Pool, QueryResult } from 'pg';
import { pool } from '../config/database';

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      console.log(`Query executed in ${duration}ms: ${text.substring(0, 100)}...`);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Generic CRUD operations
  async findById<T = any>(table: string, id: string): Promise<T | null> {
    const result = await this.query<T>(
      `SELECT * FROM ${table} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findOne<T = any>(table: string, conditions: Record<string, any>): Promise<T | null> {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    
    const result = await this.query<T>(
      `SELECT * FROM ${table} WHERE ${whereClause}`,
      values
    );
    return result.rows[0] || null;
  }

  async findMany<T = any>(
    table: string,
    conditions: Record<string, any> = {},
    options: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDirection?: 'ASC' | 'DESC';
    } = {}
  ): Promise<{ rows: T[]; total: number }> {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    let whereClause = keys.length > 0 
      ? 'WHERE ' + keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ')
      : '';
    
    let orderClause = '';
    if (options.orderBy) {
      orderClause = `ORDER BY ${options.orderBy} ${options.orderDirection || 'ASC'}`;
    }
    
    let limitClause = '';
    if (options.limit) {
      limitClause = `LIMIT ${options.limit}`;
      if (options.offset) {
        limitClause += ` OFFSET ${options.offset}`;
      }
    }

    // Get total count
    const countResult = await this.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM ${table} ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get rows
    const result = await this.query<T>(
      `SELECT * FROM ${table} ${whereClause} ${orderClause} ${limitClause}`,
      values
    );

    return { rows: result.rows, total };
  }

  async create<T = any>(
    table: string,
    data: Record<string, any>
  ): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`);
    
    const result = await this.query<T>(
      `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  async update<T = any>(
    table: string,
    id: string,
    data: Record<string, any>
  ): Promise<T | null> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    
    const result = await this.query<T>(
      `UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    
    return result.rows[0] || null;
  }

  async delete(table: string, id: string): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM ${table} WHERE id = $1`,
      [id]
    );
    
    return result.rowCount > 0;
  }

  async softDelete(table: string, id: string): Promise<boolean> {
    const result = await this.query(
      `UPDATE ${table} SET is_active = false WHERE id = $1`,
      [id]
    );
    
    return result.rowCount > 0;
  }
}

export const db = new DatabaseService();
