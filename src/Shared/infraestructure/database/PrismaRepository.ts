import type { PrismaClient } from '@prisma/client';
import { PrismaConnection } from 'src/Shared/infraestructure/database/PrismaConnection';

export abstract class PrismaRepository {
  private prismaClient: PrismaClient;

  constructor() {
    this.prismaClient = PrismaConnection.getClient();
  }

  protected getClient(): PrismaClient {
    return this.prismaClient;
  }
}
