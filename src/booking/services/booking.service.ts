import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async createTimeSlot(resourceId: string, startsAt: Date, endsAt: Date, capacity: number = 1) {
    return this.prisma.timeSlot.create({
      data: {
        resourceId,
        startsAt,
        endsAt,
        capacity,
      },
    });
  }

  async getAvailableSlots(resourceId: string, startDate: Date, endDate: Date) {
    return this.prisma.timeSlot.findMany({
      where: {
        resourceId,
        startsAt: { gte: startDate },
        endsAt: { lte: endDate },
        isActive: true,
        reserved: { lt: this.prisma.timeSlot.fields.capacity },
      },
      include: {
        resource: true,
      },
    });
  }
}