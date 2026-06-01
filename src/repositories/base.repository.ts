export type CreateInput<T> = Omit<T, "id" | "created_at" | "updated_at">;
export type UpdateInput<T> = Partial<CreateInput<T>>;

export interface BaseRepository<TRecord> {
  getAll(): Promise<TRecord[]>;
  getById(id: string): Promise<TRecord | null>;
  create(input: CreateInput<TRecord>): Promise<TRecord>;
  update(id: string, input: UpdateInput<TRecord>): Promise<TRecord>;
  delete(id: string): Promise<void>;
}

export interface SlugRepository<TRecord> extends BaseRepository<TRecord> {
  getBySlug(slug: string): Promise<TRecord | null>;
}
