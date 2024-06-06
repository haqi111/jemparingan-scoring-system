/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'nestjs-prisma';
import { CreateAdminDto, UpdateAdminDto } from './dto';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';

interface CsvAdmin {
  email: string;
  name: string;
  password: string;
  targetNames:string;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}
  async createAdmin(createAdminDto: CreateAdminDto): Promise<any> {
    try {
      const existingAdmin = await this.prisma.admin.findFirst({
        where: {
          OR: [{ email: createAdminDto.email }],
        },
      });

      if (existingAdmin) {
        throw new ConflictException('email is already in use');
      }
      const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
      const createAdmin = await this.prisma.admin.create({
        data: {
          ...createAdminDto,
          password: hashedPassword,
        },
      });
      return createAdmin;
    } catch (error) {
      throw error;
    }
  }

  async getAllAdmin() {
    try {
      return await this.prisma.admin.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to fetch data admin: ${error.message}`);
    }
  }

  async getAdminById(id: string): Promise<any> {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { id: id },
        select: {
          id: true,
          email: true,
          name: true,
          targets: {
            select: {
              target: {
                select: {
                  name: true
                },
              },
            },
          },
        },
      });
  
      if (!admin) {
        throw new NotFoundException('User not found');
      }
  
      const transformedAdmin = {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        targets: admin.targets.map((t: any) => t.target.name),
      };
  
      return transformedAdmin;
    } catch (error) {
      throw error;
    }
  }
  
  async updateAdmin(id: string, updateAdminDto: UpdateAdminDto): Promise<any> {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { id: id },
        include: { targets: true },
      });
  
      if (!admin) {
        throw new NotFoundException('Admin not found');
      }
  
      if (updateAdminDto.email && updateAdminDto.email !== admin.email) {
        const existingAdmin = await this.prisma.admin.findFirst({
          where: { email: updateAdminDto.email },
        });
  
        if (existingAdmin) {
          throw new ConflictException('Email is already in use');
        }
      }
  
      const { targets, ...adminData } = updateAdminDto;
      const updateData: any = { ...adminData };
  
      if (targets) {
        await this.prisma.adminToTarget.deleteMany({
          where: { adminEmail: admin.email },
        });
  
        updateData.targets = {
          create: targets.map(targetName => ({
            target: {
              connect: { name: targetName },
            },
          })),
        };
      }
  
      const updatedAdmin = await this.prisma.admin.update({
        where: { id: id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          targets: {
            select: {
              target: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
  
      const transformedAdmin = {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        name: updatedAdmin.name,
        targets: updatedAdmin.targets.map(t => t.target),
      };
  
      return transformedAdmin;
    } catch (error) {
      throw error;
    }
  }
  
  async deleteAdmin(id: string): Promise<boolean> {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { id },
        include: { targets: true },
      });
  
      if (!admin) {
        throw new NotFoundException('Admin not found');
      }
  
      if (admin.targets.length > 0) {
        await this.prisma.adminToTarget.deleteMany({
          where: { adminEmail: admin.email },
        });
      }
  
      await this.prisma.admin.delete({
        where: { id },
      });
  
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  async importAdminsFromCsv(filePath: string): Promise<void> {
    const admins: CsvAdmin[] = [];

    return new Promise((resolve, reject) => {
      createReadStream(filePath)
        .pipe(parse({ columns: headers => headers.map(h => h.toLowerCase()) }))
        .on('data', (row) => {
          if (row.email && row.name && row.password && row.target_names) {
            admins.push({
              email: row.email.trim(),
              name: row.name.trim(),
              password: row.password,
              targetNames: row.target_names.split(',').map(name => name.trim())
            });
          }
        })
        .on('end', async () => {
          try {
            for (const admin of admins) {
              const existingAdmin = await this.prisma.admin.findUnique({
                where: { email: admin.email },
              });

              if (existingAdmin) {
                throw new ConflictException(`Email ${admin.email} is already in use`);
              }

              const hashedPassword = await bcrypt.hash(admin.password, 10);

              await this.prisma.admin.create({
                data: {
                  email: admin.email,
                  name: admin.name,
                  password: hashedPassword,
                },
              });

              for (const targetName of admin.targetNames) {
                let target = await this.prisma.target.findUnique({
                  where: { name: targetName },
                });

                if (!target) {
                  target = await this.prisma.target.create({
                    data: { name: targetName }
                  });
                }

                await this.prisma.adminToTarget.create({
                  data: {
                    adminEmail: admin.email,
                    targetName: target.name
                  }
                });
              }
            }
            resolve();
          } catch (error) {
            reject(new BadRequestException('Failed to import admins: ' + error.message));
          }
        })
        .on('error', (error) => {
          reject(new BadRequestException('Error reading CSV file: ' + error.message));
        });
    });
  }
}
