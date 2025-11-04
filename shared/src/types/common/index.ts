// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string;
export type Timestamp = Date;

// Generic CRUD operations
export interface CreateOperation<T> {
  create(data: T): Promise<T>;
}

export interface ReadOperation<T> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
}

export interface UpdateOperation<T> {
  update(id: ID, data: Partial<T>): Promise<T>;
}

export interface DeleteOperation {
  delete(id: ID): Promise<void>;
}

export interface CRUDOperations<T>
  extends CreateOperation<T>,
    ReadOperation<T>,
    UpdateOperation<T>,
    DeleteOperation {}

// Event types for WebSocket
export interface WebSocketEvent<T = any> {
  type: string;
  data: T;
  timestamp: Timestamp;
}

// File upload types
export interface FileUpload {
  filename: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedAt: Timestamp;
}
