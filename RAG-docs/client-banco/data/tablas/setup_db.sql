-- SQL Schema for Insurance Database (Multi-Tenant)
-- Execute this in the Supabase SQL Editor

-- 1. PERSONA
CREATE TABLE IF NOT EXISTS public.persona (
    dni TEXT PRIMARY KEY,
    nombre TEXT,
    apellido TEXT,
    edad INTEGER,
    nacionalidad TEXT,
    org_id TEXT NOT NULL
);
ALTER TABLE public.persona ENABLE ROW LEVEL SECURITY;

-- 2. POLIZA
CREATE TABLE IF NOT EXISTS public.poliza (
    num_poliza TEXT PRIMARY KEY,
    producto TEXT,
    dni_tomador TEXT REFERENCES public.persona(dni),
    estado TEXT,
    fecha_efecto DATE,
    fecha_vencimiento DATE,
    forma_pago TEXT,
    org_id TEXT NOT NULL
);
ALTER TABLE public.poliza ENABLE ROW LEVEL SECURITY;

-- 3. ASEGURADO_POLIZA (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.asegurado_poliza (
    dni_persona TEXT REFERENCES public.persona(dni),
    num_poliza TEXT REFERENCES public.poliza(num_poliza),
    producto TEXT,
    orden INTEGER,
    org_id TEXT NOT NULL,
    PRIMARY KEY (dni_persona, num_poliza)
);
ALTER TABLE public.asegurado_poliza ENABLE ROW LEVEL SECURITY;

-- 4. SINIESTRO
CREATE TABLE IF NOT EXISTS public.siniestro (
    num_siniestro TEXT PRIMARY KEY,
    num_poliza TEXT REFERENCES public.poliza(num_poliza),
    producto TEXT,
    tipo_siniestro TEXT,
    estado_siniestro TEXT,
    cant_asegurados INTEGER,
    org_id TEXT NOT NULL
);
ALTER TABLE public.siniestro ENABLE ROW LEVEL SECURITY;

-- 5. PAGO
CREATE TABLE IF NOT EXISTS public.pago (
    num_pago TEXT PRIMARY KEY,
    num_siniestro TEXT REFERENCES public.siniestro(num_siniestro),
    importe DECIMAL,
    fecha_pago DATE,
    estado_pago TEXT,
    org_id TEXT NOT NULL
);
ALTER TABLE public.pago ENABLE ROW LEVEL SECURITY;

-- 6. RECIBO
CREATE TABLE IF NOT EXISTS public.recibo (
    num_recibo TEXT PRIMARY KEY,
    num_poliza TEXT REFERENCES public.poliza(num_poliza),
    producto TEXT,
    tipo_recibo TEXT,
    monto DECIMAL,
    periodicidad TEXT,
    fecha_emision DATE,
    fecha_efecto DATE,
    org_id TEXT NOT NULL
);
ALTER TABLE public.recibo ENABLE ROW LEVEL SECURITY;

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_persona_org ON public.persona(org_id);
CREATE INDEX IF NOT EXISTS idx_poliza_org ON public.poliza(org_id);
CREATE INDEX IF NOT EXISTS idx_asegurado_poliza_org ON public.asegurado_poliza(org_id);
CREATE INDEX IF NOT EXISTS idx_siniestro_org ON public.siniestro(org_id);
CREATE INDEX IF NOT EXISTS idx_pago_org ON public.pago(org_id);
CREATE INDEX IF NOT EXISTS idx_recibo_org ON public.recibo(org_id);

-- RLS Policies
-- Adjusting the policy to match Clerk's orgId structure in user_metadata
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('persona', 'poliza', 'asegurado_poliza', 'siniestro', 'pago', 'recibo')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation" ON %I', t);
        EXECUTE format('CREATE POLICY "Tenant Isolation" ON %I 
                        USING (org_id = (auth.jwt() -> ''user_metadata'' ->> ''orgId''))
                        WITH CHECK (org_id = (auth.jwt() -> ''user_metadata'' ->> ''orgId''))', t);
    END LOOP;
END $$;
