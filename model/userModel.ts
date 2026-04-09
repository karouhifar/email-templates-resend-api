import type { PrismaClient } from "@prisma/client/extension";

export interface IUser {
  id: string;
  name: string;
  email: string;
  isOwner: boolean;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUser {
  name: string;
  email: string;
  isOwner?: boolean;
  location: string;
  message: string;
}

export interface IUserModel {
  findAll(): Promise<IUser[]>;
  findById(id: string): Promise<IUser | null>;
  create(data: ICreateUser): Promise<IUser>;
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
        location: data.location,
        message: data.message,
      },
    });
  }
}
