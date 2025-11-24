import { prisma } from "@/utils/prisma";
import { nanoid } from "nanoid";
import { couldStartTrivia } from "typescript";

export interface OwnerProps {
  key_id: string;
  name: string;
  isOwner: boolean;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export class Owner {
  private key_id: string;
  private name: string;
  private isOwner: boolean;
  private email: string;
  private created_at?: string;
  private updated_at?: string;

  constructor(
    key_id: string,
    name: string,
    isOwner: boolean,
    email: string,
    created_at?: string,
    updated_at?: string
  ) {
    this.key_id = key_id ?? nanoid(10);
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

  get getIsOwner(): boolean {
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
      row.key_id,
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

  async findAll(): Promise<Array<Owner>> {
    const rows = await prisma.owner.findMany();
    return rows.map((row) => Owner.fromRow(row as any));
  }
  async findByEmail(email: string): Promise<Owner | null> {
    const row = await prisma.owner.findUnique({ where: { email } });
    return row ? Owner.fromRow(row as any) : null;
  }
  async findByKeyId(key_id: string): Promise<Owner | null> {
    const row = await prisma.owner.findUnique({ where: { key_id } });

    return row ? Owner.fromRow(row as any) : null;
  }
  async create(ownerData: Omit<OwnerProps, "key_id">): Promise<void> {
    const result = new Owner(
      nanoid(10),
      ownerData.name,
      ownerData.isOwner,
      ownerData.email
    );
    await prisma.owner.create({
      data: {
        key_id: result.getKeyId,
        name: result.getName,
        isOwner: result.getIsOwner,
        email: result.getEmail,
      },
    });
  }
  async remove({ key_id }: Pick<OwnerProps, "key_id">): Promise<void> {
    await prisma.owner.delete({ where: { key_id } });
  }
}
