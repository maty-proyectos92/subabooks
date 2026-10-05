export type ConfianzaDeteccion = 'alta' | 'media' | 'baja';

export interface BookMetadata {
  titulo: string;
  autor: string;
  isbn: string;
  editorial: string;
  anio: string;
  idioma: string;
  confianza_deteccion: ConfianzaDeteccion;
  sinopsis?: string;
  genero?: string;
  tipo_captura?: 'tapa' | 'lomo' | 'contratapa' | 'solapa' | 'otra';
}

export interface CatalogItem {
  id: string;
  createdAt: number;
  imageDataUrl: string;
  metadata: BookMetadata;
  userNotes?: string;
  tags?: string[];
  verified?: boolean;
}

export interface ScanResultResponse {
  success: boolean;
  data: BookMetadata;
  rawOutput?: string;
  error?: string;
}
