import type { PrismaClient } from "@prisma/client/extension";

export interface IUser {
  id: string;
  name: string;
  email: string;
  isOwner: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUser {
  name: string;
  email: string;
  isOwner?: boolean;
  message: string;
}

export interface IUserMetadata {
  id: string;
  userId: string;
  ipAddress: string;
  location: string;
  userDemo: Record<string, string | number> | null;
  createdAt: Date;
}

export interface ICreateUserMetadata {
  userId: string;
  ipAddress: string;
  location: string;
  userDemo?: Record<string, string | number> | null;
}

export interface IUserModel {
  findAll(): Promise<IUser[]>;
  findById(id: string): Promise<IUser | null>;
  create(data: ICreateUser): Promise<IUser>;
  createMetadata(data: ICreateUserMetadata): Promise<IUserMetadata>;
  getMetadataByUserId(userId: string): Promise<IUserMetadata | null>;
}

export class UserModel implements IUserModel {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(): Promise<IUser[]> {
    return await this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string): Promise<IUser | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: ICreateUser): Promise<IUser> {
    return await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        isOwner: data.isOwner ?? false,
        message: data.message,
      },
    });
  }

  async createMetadata(data: ICreateUserMetadata): Promise<IUserMetadata> {
    return await this.prisma.userMetadata.create({
      data: {
        userId: data.userId,
        ipAddress: data.ipAddress,
        location: data.location,
        userDemo: data.userDemo ?? null,
      },
    });
  }

  async getMetadataByUserId(userId: string): Promise<IUserMetadata | null> {
    return await this.prisma.userMetadata.findUnique({
      where: { userId },
    });
  }
}
