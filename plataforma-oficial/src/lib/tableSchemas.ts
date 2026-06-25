export interface ColumnDoc {
  name: string;
  type: string;
  description: string;
  isPk: boolean;
  isSensitive: boolean;
}

export interface TableDoc {
  tableName: string;
  columns: ColumnDoc[];
}

export const TABLES_DOCS_SEGUROS: TableDoc[] = [
  {
    "tableName": "persona",
    "columns": [
      {
        "name": "dni",
        "type": "VARCHAR",
        "description": "Documento Nacional de Identidad del individuo",
        "isPk": true,
        "isSensitive": true
      },
      {
        "name": "apellido",
        "type": "VARCHAR",
        "description": "Apellido de la persona",
        "isPk": false,
        "isSensitive": true
      },
      {
        "name": "edad",
        "type": "INT",
        "description": "Edad cronológica en años",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "nacionalidad",
        "type": "VARCHAR",
        "description": "País de origen o nacionalidad",
        "isPk": false,
        "isSensitive": false
      }
    ]
  },
  {
    "tableName": "poliza",
    "columns": [
      {
        "name": "num_poliza",
        "type": "VARCHAR",
        "description": "Número único identificador del contrato de póliza",
        "isPk": true,
        "isSensitive": false
      },
      {
        "name": "producto",
        "type": "VARCHAR",
        "description": "Ramo o producto del seguro (ej. Hogar, Auto, Vida)",
        "isPk": true,
        "isSensitive": false
      },
      {
        "name": "dni_tomador",
        "type": "VARCHAR",
        "description": "DNI del tomador de la póliza (quien contrata el seguro)",
        "isPk": false,
        "isSensitive": true
      },
      {
        "name": "estado",
        "type": "VARCHAR",
        "description": "Estado del contrato (ej. ACTIVO, VENCIDO, ANULADO)",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "fecha_efecto",
        "type": "DATE",
        "description": "Fecha de inicio de vigencia de las coberturas",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "fecha_vencimiento",
        "type": "DATE",
        "description": "Fecha de término de vigencia de las coberturas",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "forma_pago",
        "type": "VARCHAR",
        "description": "Método de pago pactado (ej. MENSUAL, ANUAL, DÉBITO)",
        "isPk": false,
        "isSensitive": false
      }
    ]
  },
  {
    "tableName": "asegurado_poliza",
    "columns": [
      {
        "name": "dni_persona",
        "type": "VARCHAR",
        "description": "DNI del individuo asegurado en la póliza",
        "isPk": true,
        "isSensitive": true
      },
      {
        "name": "num_poliza",
        "type": "VARCHAR",
        "description": "Referencia al número de póliza vinculada",
        "isPk": true,
        "isSensitive": false
      },
      {
        "name": "producto",
        "type": "VARCHAR",
        "description": "Referencia al producto de seguro de la póliza",
        "isPk": true,
        "isSensitive": false
      },
      {
        "name": "orden",
        "type": "INT",
        "description": "Orden o prioridad posicional del asegurado (ej. 1: Principal, 2: Secundario)",
        "isPk": false,
        "isSensitive": false
      }
    ]
  },
  {
    "tableName": "siniestro",
    "columns": [
      {
        "name": "num_siniestro",
        "type": "VARCHAR",
        "description": "Identificador único asignado al reporte de siniestro",
        "isPk": true,
        "isSensitive": false
      },
      {
        "name": "num_poliza",
        "type": "VARCHAR",
        "description": "Número de póliza afectada por el evento",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "producto",
        "type": "VARCHAR",
        "description": "Producto asociado a la póliza del siniestro",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "tipo_siniestro",
        "type": "VARCHAR",
        "description": "Clasificación o naturaleza del incidente (ej. ROBO, CHOQUE)",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "estado_siniestro",
        "type": "VARCHAR",
        "description": "Estatus del trámite (ej. ABIERTO, RECHAZADO, LIQUIDADO)",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "cant_asegurados",
        "type": "INT",
        "description": "Número de personas aseguradas involucradas en el siniestro",
        "isPk": false,
        "isSensitive": false
      }
    ]
  },
  {
    "tableName": "pago",
    "columns": [
      {
        "name": "num_pago",
        "type": "VARCHAR",
        "description": "Código identificador de la transacción económica de liquidación",
        "isPk": true,
        "isSensitive": false
      },
      {
        "name": "num_siniestro",
        "type": "VARCHAR",
        "description": "Siniestro asociado que gatilla la orden de pago",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "importe",
        "type": "NUMERIC(15, 2)",
        "description": "Monto monetario liquidado y transferido",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "fecha_pago",
        "type": "DATE",
        "description": "Fecha en que se hizo efectivo el desembolso",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "estado_pago",
        "type": "VARCHAR",
        "description": "Estado de la transferencia (ej. PENDIENTE, PROCESADO)",
        "isPk": false,
        "isSensitive": false
      }
    ]
  },
  {
    "tableName": "recibo",
    "columns": [
      {
        "name": "num_recibo",
        "type": "VARCHAR",
        "description": "Identificador único del recibo de cobro de la prima",
        "isPk": true,
        "isSensitive": false
      },
      {
        "name": "num_poliza",
        "type": "VARCHAR",
        "description": "Póliza ligada que genera la obligación financiera",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "producto",
        "type": "VARCHAR",
        "description": "Ramo comercial correspondiente a la póliza",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "tipo_recibo",
        "type": "VARCHAR",
        "description": "Naturaleza del recibo (I: Inicial, R: Renovación, EX: Extraordinario)",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "monto",
        "type": "NUMERIC(15, 2)",
        "description": "Monto económico facturado en el recibo de prima",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "periodicidad",
        "type": "VARCHAR",
        "description": "Frecuencia estipulada de facturación (U: Único, M: Mensual, S: Semestral, A: Anual)",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "fecha_emision",
        "type": "DATE",
        "description": "Fecha de emisión contable del recibo",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "fecha_efecto",
        "type": "DATE",
        "description": "Fecha de imputación y cobertura del período facturado",
        "isPk": false,
        "isSensitive": false
      }
    ]
  }
];

export const TABLES_DOCS_CONTABLE: TableDoc[] = [
  {
    "tableName": "entidades",
    "columns": [
      {
        "name": "cuit",
        "type": "varchar",
        "description": "Clave Única de Identificación Tributaria (Identificador de la empresa o cliente/proveedor)",
        "isPk": true,
        "isSensitive": true
      },
      {
        "name": "razon_social",
        "type": "varchar",
        "description": "Nombre legal o Razón Social de la entidad",
        "isPk": false,
        "isSensitive": true
      },
      {
        "name": "id_tipo_gasto_defecto",
        "type": "int",
        "description": "Identificador del tipo de gasto asignado por defecto",
        "isPk": false,
        "isSensitive": false
      }
    ]
  },
  {
    "tableName": "ejercicios_fiscales",
    "columns": [
      {
        "name": "id_ejercicio",
        "type": "int",
        "description": "Identificador único del ejercicio contable/fiscal",
        "isPk": true,
        "isSensitive": false
      },
      {
        "name": "cuit_empresa",
        "type": "varchar",
        "description": "CUIT de la empresa titular del ejercicio",
        "isPk": false,
        "isSensitive": true
      },
      {
        "name": "anio_fiscal",
        "type": "date",
        "description": "Año fiscal correspondiente",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "fecha_inicio",
        "type": "date",
        "description": "Fecha de inicio del ejercicio económico",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "fecha_cierre",
        "type": "date",
        "description": "Fecha de finalización/cierre del ejercicio económico",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "estado",
        "type": "varchar",
        "description": "Estado actual del ejercicio (ej. ABIERTO, CERRADO)",
        "isPk": false,
        "isSensitive": false
      }
    ]
  },
  {
    "tableName": "compras",
    "columns": [
      {
        "name": "id_compra",
        "type": "int",
        "description": "Identificador único del registro de compra",
        "isPk": true,
        "isSensitive": false
      },
      {
        "name": "cuit_empresa",
        "type": "varchar",
        "description": "CUIT de la empresa que realiza la compra",
        "isPk": false,
        "isSensitive": true
      },
      {
        "name": "fecha",
        "type": "date",
        "description": "Fecha de emisión del comprobante de compra",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "id_tipo_comprobante",
        "type": "int",
        "description": "Referencia al tipo de comprobante (Factura A, B, etc.)",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "pto_vta",
        "type": "int",
        "description": "Punto de venta del comprobante",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "nro_cpte",
        "type": "int",
        "description": "Número correlativo del comprobante",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "cuit_proveedor",
        "type": "varchar",
        "description": "CUIT del proveedor que emite la factura",
        "isPk": false,
        "isSensitive": true
      },
      {
        "name": "neto_gravado",
        "type": "float",
        "description": "Subtotal neto sujeto a impuestos",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "iva_21",
        "type": "float",
        "description": "Monto de IVA correspondiente a la alícuota del 21%",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "iva_27",
        "type": "float",
        "description": "Monto de IVA correspondiente a la alícuota del 27%",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "iva_105",
        "type": "float",
        "description": "Monto de IVA correspondiente a la alícuota del 10.5%",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "no_gravado",
        "type": "float",
        "description": "Conceptos e importes no gravados en el impuesto",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "exento",
        "type": "float",
        "description": "Conceptos e importes exentos de IVA",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "perc_iva",
        "type": "float",
        "description": "Monto por percepciones de IVA sufridas",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "perc_iibb",
        "type": "float",
        "description": "Monto por percepciones de Ingresos Brutos (IIBB) sufridas",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "perc_ganancias",
        "type": "float",
        "description": "Monto por percepciones del Impuesto a las Ganancias",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "total",
        "type": "float",
        "description": "Monto total facturado del comprobante de compra",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "id_ejercicio",
        "type": "int",
        "description": "Vínculo con el ejercicio fiscal correspondiente",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "id_tipo_gasto",
        "type": "int",
        "description": "Clasificación del tipo de gasto asociado a la compra",
        "isPk": false,
        "isSensitive": false
      }
    ]
  },
  {
    "tableName": "ventas",
    "columns": [
      {
        "name": "id_venta",
        "type": "int",
        "description": "Identificador único del registro de venta",
        "isPk": true,
        "isSensitive": false
      },
      {
        "name": "id_tipo_venta",
        "type": "varchar",
        "description": "Tipo o categoría de la venta realizada",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "fecha",
        "type": "date",
        "description": "Fecha de emisión del comprobante de venta",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "id_tipo_comprobante",
        "type": "int",
        "description": "Referencia al tipo de comprobante emitido",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "pto_vta",
        "type": "int",
        "description": "Punto de venta emisor del comprobante",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "nro_cpte",
        "type": "int",
        "description": "Número correlativo del comprobante de venta",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "codigo_documento",
        "type": "int",
        "description": "Código de tipo de documento del cliente (AFIP)",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "cuit_cliente",
        "type": "varchar",
        "description": "CUIT, CUIL o documento de identificación del cliente",
        "isPk": false,
        "isSensitive": true
      },
      {
        "name": "neto_gravado",
        "type": "float",
        "description": "Subtotal neto sujeto al débito fiscal",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "iva_21",
        "type": "float",
        "description": "Monto de IVA facturado a la alícuota del 21%",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "iva_105",
        "type": "float",
        "description": "Monto de IVA facturado a la alícuota del 10.5%",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "exento",
        "type": "float",
        "description": "Conceptos e importes exentos de IVA en la venta",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "total",
        "type": "float",
        "description": "Monto total facturado del comprobante de venta",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "cuit_empresa",
        "type": "varchar",
        "description": "CUIT de la empresa emisora que realiza la venta",
        "isPk": false,
        "isSensitive": true
      },
      {
        "name": "id_ejercicio",
        "type": "int",
        "description": "Vínculo con el ejercicio fiscal correspondiente",
        "isPk": false,
        "isSensitive": false
      }
    ]
  },
  {
    "tableName": "tipos_comprobante",
    "columns": [
      {
        "name": "id_tipo_comprobante",
        "type": "int",
        "description": "Identificador único del tipo de comprobante",
        "isPk": true,
        "isSensitive": false
      },
      {
        "name": "codigo_afip",
        "type": "varchar",
        "description": "Código oficial asignado por AFIP (ej. 001 para Factura A)",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "descripcion",
        "type": "varchar",
        "description": "Nombre descriptivo del comprobante (Factura, Nota de Crédito, etc.)",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "multiplicador_contable",
        "type": "int",
        "description": "Factor numérico para el cálculo contable (+1 para sumar, -1 para restar saldos)",
        "isPk": false,
        "isSensitive": false
      }
    ]
  },
  {
    "tableName": "tipos_gasto",
    "columns": [
      {
        "name": "id_tipo_gasto",
        "type": "int",
        "description": "Identificador único de la categoría de gasto",
        "isPk": true,
        "isSensitive": false
      },
      {
        "name": "descripcion",
        "type": "varchar",
        "description": "Descripción o nombre del tipo de gasto (ej. Alquileres, Servicios, Librería)",
        "isPk": false,
        "isSensitive": false
      }
    ]
  },
  {
    "tableName": "tipo_venta",
    "columns": [
      {
        "name": "id_tipo_venta",
        "type": "varchar",
        "description": "Código identificador del tipo de venta",
        "isPk": true,
        "isSensitive": false
      },
      {
        "name": "emisor",
        "type": "varchar",
        "description": "Condición o perfil del emisor de la venta",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "receptor",
        "type": "varchar",
        "description": "Condición o perfil del receptor/cliente",
        "isPk": false,
        "isSensitive": false
      },
      {
        "name": "detalles",
        "type": "varchar",
        "description": "Información complementaria del tipo de operación",
        "isPk": false,
        "isSensitive": false
      }
    ]
  }
];

export const getDefaultTableDocs = (orgId?: string): TableDoc[] => {
  if (orgId === 'org-estudio') {
    return TABLES_DOCS_CONTABLE;
  }
  // Fallback / default is seguros
  return TABLES_DOCS_SEGUROS;
};
