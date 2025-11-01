export interface IRepository<T> {
  create(data: any): Promise<T | null>;
  findAll(
    id?: string,
    type?:
      | "user"
      | "job"
      | "resume"
      | "matched"
      | "submittedResume"
      | "archivedJobs"
      | "AllJobs"
      | "recruiterJob"
      | "bookmark"
      | "appliedJobs"
      | "bookmarkedJobs",
    params?: {
      filter?: any;
      skip?: any;
      take?: number;
      jobType?: string;
      location?: string;
      title?: string;
      date?: Date;
      company?: string;
      orderBy?: "asc" | "desc";
    }
  ): Promise<T[]>;
  findById(
    id?: string,
    email?: string,
    type?:
      | "accountRole"
      | "user"
      | "job"
      | "matched"
      | "bookmark"
      | "userExists"
  ): Promise<T | null>;
  findFirst(
    id1?: string,
    id2?: string,
    type?: "resume" | "submitResume" | "matched" | "userExists" | "bookmark"
  ): Promise<Boolean>;
  update(id: string, data: Partial<T>, type?: string): Promise<T | null>;
  delete(id: string, type?: string): Promise<Boolean>;
}
