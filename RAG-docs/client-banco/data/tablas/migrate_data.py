import os
import re
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env from plataforma-oficial if exists, otherwise from root
env_path = os.path.join('plataforma-oficial', '.env.local')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
# Use service role key if available, otherwise anon key
KEY = os.getenv("otra_key_supabase") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not URL or not KEY:
    print("Error: Supabase URL or Key not found in environment variables.")
    exit(1)

supabase: Client = create_client(URL, KEY)

# Configuration
FILE_PATH = os.path.join('RAG-docs', 'client-banco', 'data', 'tablas', 'base_datos_seguros_full.txt')
ORG_ID = "org-banco" # Matches the mock data and Clerk metadata

def parse_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    tables = {}
    current_table = None
    headers = []

    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        if line.startswith("--- TABLA:"):
            current_table = line.split(":")[1].strip().strip("-").strip().lower()
            tables[current_table] = []
            headers = []
            continue
        
        if current_table and not headers:
            headers = line.split("|")
            continue
        
        if current_table and headers:
            values = line.split("|")
            if len(values) == len(headers):
                record = dict(zip(headers, values))
                record['org_id'] = ORG_ID
                tables[current_table].append(record)
    
    return tables

def migrate():
    print(f"Reading file: {FILE_PATH}")
    tables = parse_file(FILE_PATH)
    
    # Order of insertion to respect foreign keys
    # 1. persona
    # 2. poliza (refs persona)
    # 3. asegurado_poliza (refs persona, poliza)
    # 4. siniestro (refs poliza)
    # 5. pago (refs siniestro)
    # 6. recibo (refs poliza)
    
    order = ['persona', 'poliza', 'asegurado_poliza', 'siniestro', 'pago', 'recibo']
    
    for table_name in order:
        if table_name not in tables:
            print(f"Table {table_name} not found in file sections.")
            continue
            
        data = tables[table_name]
        print(f"Migrating {len(data)} rows to {table_name}...")
        
        # Insert in batches of 100
        batch_size = 100
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            try:
                response = supabase.table(table_name).upsert(batch).execute()
                # print(f"  Uploaded batch {i//batch_size + 1}")
            except Exception as e:
                print(f"  Error in table {table_name}, batch {i}: {e}")
                # Log first record to debug
                if batch:
                    print(f"  Sample record: {batch[0]}")

if __name__ == "__main__":
    migrate()
    print("Migration finished!")
