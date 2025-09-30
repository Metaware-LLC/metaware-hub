import { useState, useEffect, useCallback, useRef } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';
import { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import { MOTHERDUCK_TOKEN, MOTHERDUCK_DATABASE, MOTHERDUCK_SCHEMA } from '@/config/motherduck';
import { toast } from '@/hooks/use-toast';

interface UseMDConnectionReturn {
  connection: AsyncDuckDBConnection | null;
  db: AsyncDuckDB | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  ready: boolean;
  error: string | null;
}

let globalDB: AsyncDuckDB | null = null;
let globalConnection: AsyncDuckDBConnection | null = null;
let isInitializing = false;

export function useMDConnection(): UseMDConnectionReturn {
  const [db, setDb] = useState<AsyncDuckDB | null>(globalDB);
  const [connection, setConnection] = useState<AsyncDuckDBConnection | null>(globalConnection);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initRef = useRef(false);

  const connect = useCallback(async () => {
    // Idempotent: return early if already connected
    if (globalDB && globalConnection) {
      setDb(globalDB);
      setConnection(globalConnection);
      setReady(true);
      return;
    }

    // Prevent concurrent initialization
    if (isInitializing) {
      return;
    }

    if (initRef.current) {
      return;
    }

    initRef.current = true;
    isInitializing = true;

    try {
      // Check token
      if (!MOTHERDUCK_TOKEN) {
        throw new Error('MOTHERDUCK_TOKEN is not configured');
      }

      // Select bundle with correct paths
      // WASM file loaded from CDN (too large for local hosting)
      const bundle = await duckdb.selectBundle({
        mvp: {
          mainModule: 'https://unpkg.com/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-mvp.wasm',
          mainWorker: '/duckdb/duckdb-browser-mvp.worker.js',
        },
      });

      const worker = new Worker(bundle.mainWorker!);
      const logger = new duckdb.ConsoleLogger();
      const duckDB = new duckdb.AsyncDuckDB(logger, worker);
      await duckDB.instantiate(bundle.mainModule);

      // Get connection
      const conn = await duckDB.connect();

      // Install and load motherduck extension
      await conn.query(`INSTALL motherduck;`);
      await conn.query(`LOAD motherduck;`);

      // Set token
      await conn.query(`SET motherduck_token='${MOTHERDUCK_TOKEN}';`);

      // Attach database
      await conn.query(`ATTACH 'md:${MOTHERDUCK_DATABASE}' AS md;`);
      
      // Set schema
      await conn.query(`SET schema='md.${MOTHERDUCK_SCHEMA}';`);

      // Store globally
      globalDB = duckDB;
      globalConnection = conn;

      setDb(duckDB);
      setConnection(conn);
      setReady(true);
      setError(null);

      toast({
        title: "Database Connected",
        description: "MotherDuck connection established successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to MotherDuck';
      setError(errorMessage);
      setReady(false);
      
      toast({
        title: "Database Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error('MotherDuck connection error:', err);
    } finally {
      isInitializing = false;
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      if (globalConnection) {
        await globalConnection.close();
        globalConnection = null;
      }
      if (globalDB) {
        await globalDB.terminate();
        globalDB = null;
      }
      setConnection(null);
      setDb(null);
      setReady(false);
      initRef.current = false;
    } catch (err) {
      console.error('Error disconnecting from MotherDuck:', err);
    }
  }, []);

  useEffect(() => {
    return () => {
      // Don't disconnect on unmount to maintain connection across components
    };
  }, []);

  return {
    connection,
    db,
    connect,
    disconnect,
    ready,
    error,
  };
}

export async function queryMDTable(
  connection: AsyncDuckDBConnection,
  namespace: string,
  subjectarea: string,
  entity: string
): Promise<{ columns: string[]; rows: any[] }> {
  try {
    const query = `SELECT * FROM ${namespace}.${subjectarea}.${entity};`;
    const result = await connection.query(query);
    
    const rows = result.toArray().map(row => {
      const obj: any = {};
      result.schema.fields.forEach((field, idx) => {
        obj[field.name] = row[idx];
      });
      return obj;
    });

    if (rows.length === 0) {
      return { columns: [], rows: [] };
    }

    const columns = Object.keys(rows[0]);
    return { columns, rows };
  } catch (err) {
    console.error('Query error:', err);
    toast({
      title: "Query Failed",
      description: err instanceof Error ? err.message : 'Failed to execute query',
      variant: "destructive",
    });
    throw err;
  }
}
