export interface IRepository<T> {
  create(data: any): Promise<T | null>;
  findAll(
    id?: string,
    type?: "user" | "job" | "resume" | "matched" | "submittedResume",
    params?: {
      filter?: any;
      skip?: any;
      take?: number;
      orderBy?: "asc" | "desc";
    }
  ): Promise<T[]>;
  findById(id?: string, type?: "accountRole" | "user"): Promise<T | null>;
  findFirst(id1?: string, id2?: string, type?: "resume"): Promise<Boolean>;
  update(id: string, data: Partial<T>, type?: string): Promise<T | null>;
  delete(id: string, type?: string): Promise<Boolean>;
}
