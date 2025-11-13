import { nanoid } from "nanoid";
import { db } from "../db/database";

export interface OwnerProps {
  key_id: string;
  name: string;
  isOwner: number;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export class Owner {
  private key_id: string;
  private name: string;
  private isOwner: number;
  private email: string;
  private created_at?: string;
  private updated_at?: string;

  constructor(
    name: string,
    isOwner: number,
    email: string,
    created_at?: string,
    updated_at?: string
  ) {
    this.key_id = nanoid(10);
    this.name = name;
    this.isOwner = isOwner;
    this.email = email;
    this.created_at = created_at || new Date().toISOString();
    this.updated_at = updated_at || new Date().toISOString();
  }

  get getKeyId(): string {
    return this.key_id;
  }

  get getName(): string {
    return this.name;
  }

  get getIsOwner(): number {
    return this.isOwner;
  }

  get getEmail(): string {
    return this.email;
  }
  get getCreatedAt(): string | undefined {
    return this.created_at;
  }
  get getUpdatedAt(): string | undefined {
    return this.updated_at;
  }

  static fromRow(row: Owner) {
    return new Owner(
      row.name,
      row.isOwner ?? row.isOwner ?? 0,
      row.email,
      row.created_at ?? new Date().toISOString(),
      row.updated_at ?? new Date().toISOString()
    );
  }
}

export class OwnerDTO {
  // --- CRUD operations for Owner model
  constructor() {}

  findAll(): Array<Owner> {
    return db
      .query<Owner, []>("SELECT key_id, name, email, created_at FROM owners")
      .all();
  }
  findByEmail(email: string): Owner | null {
    return db
      .query<
        Owner,
        [string]
      >("SELECT key_id, name, email, created_at FROM owners WHERE email = ?")
      .get(email);
  }
  findByKeyId(key_id: string): Owner | null {
    const row = db
      .query<
        Owner,
        [string]
      >("SELECT key_id, name, email, IsOwner, created_at FROM owners WHERE key_id = ?")
      .get(key_id);
    return row ? Owner.fromRow(row) : null;
  }
  create(ownerData: Omit<OwnerProps, "key_id">): void {
    const stmt = db.prepare(
      "INSERT INTO owners (key_id, name, isOwner, email) VALUES (?, ?, ?, ?)"
    );
    const result = new Owner(
      ownerData.name,
      ownerData.isOwner,
      ownerData.email
    );
    stmt.run(
      result.getKeyId,
      result.getName,
      result.getIsOwner,
      result.getEmail
    );
  }
  remove({ key_id }: Pick<OwnerProps, "key_id">): void {
    const stmt = db.prepare("DELETE FROM owners WHERE key_id = :key_id");
    const res = stmt.run(key_id);
  }
}
