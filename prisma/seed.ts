import { PrismaClient, UserRole, ProductType, BillingType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    },
  });
  console.log('✅ Admin user created');

  // Create merchant user
  const merchantPassword = await bcrypt.hash('merchant123', 12);
  const merchant = await prisma.user.upsert({
    where: { email: 'merchant@example.com' },
    update: {},
    create: {
      email: 'merchant@example.com',
      password: merchantPassword,
      firstName: 'John',
      lastName: 'Merchant',
      role: UserRole.MERCHANT,
    },
  });
  console.log('✅ Merchant user created');

  // Create customer user
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      firstName: 'Jane',
      lastName: 'Customer',
      role: UserRole.CUSTOMER,
    },
  });
  console.log('✅ Customer user created');

  // Create refund policy
  const refundPolicy = await prisma.policy.create({
    data: {
      type: 'REFUND',
      name: 'Standard Refund Policy',
      jsonRules: {
        digital: {
          beforeDownload: 100,
          afterDownload: 0,
        },
        services: {
          moreThan24h: 100,
          within24h: 50,
          within2h: 0,
        },
      },
    },
  });

  // Create cancellation policy
  const cancellationPolicy = await prisma.policy.create({
    data: {
      type: 'CANCELLATION',
      name: 'Standard Cancellation Policy',
      jsonRules: {
        moreThan24h: 100,
        within24h: 50,
        within2h: 0,
      },
    },
  });
  console.log('✅ Policies created');

  // Create digital product
  const digitalProduct = await prisma.product.create({
    data: {
      type: ProductType.DIGITAL,
      title: 'Premium Software License',
      description: 'Annual license for our premium software suite',
      merchantId: merchant.id,
      refundPolicyId: refundPolicy.id,
      prices: {
        create: {
          currency: 'usd',
          unitAmount: 9999, // $99.99
          billing: BillingType.ONE_TIME,
        },
      },
      stockItems: {
        create: {
          sku: 'PREMIUM-LICENSE',
          quantity: 100,
          managed: true,
        },
      },
    },
  });

  // Create resource for offline service
  const fitnessStudio = await prisma.resource.create({
    data: {
      type: 'STUDIO',
      name: 'Main Fitness Studio',
      capacity: 20,
    },
  });

  // Create offline service product
  const fitnessClass = await prisma.product.create({
    data: {
      type: ProductType.OFFLINE_SERVICE,
      title: 'Yoga Class',
      description: '60-minute yoga class in our main studio',
      merchantId: merchant.id,
      cancellationPolicyId: cancellationPolicy.id,
      prices: {
        create: {
          currency: 'usd',
          unitAmount: 2500, // $25.00
          billing: BillingType.SESSION,
        },
      },
      resources: {
        connect: { id: fitnessStudio.id },
      },
    },
  });

  // Create time slots for the yoga class
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const slotDate = new Date(tomorrow);
    slotDate.setDate(slotDate.getDate() + i);
    
    // Morning class
    await prisma.timeSlot.create({
      data: {
        resourceId: fitnessStudio.id,
        startsAt: new Date(slotDate.setHours(9, 0, 0, 0)),
        endsAt: new Date(slotDate.setHours(10, 0, 0, 0)),
        capacity: 20,
      },
    });

    // Evening class
    await prisma.timeSlot.create({
      data: {
        resourceId: fitnessStudio.id,
        startsAt: new Date(slotDate.setHours(18, 0, 0, 0)),
        endsAt: new Date(slotDate.setHours(19, 0, 0, 0)),
        capacity: 20,
      },
    });
  }

  // Create consultant resource
  const consultant = await prisma.resource.create({
    data: {
      type: 'CONSULTANT',
      name: 'Dr. Smith - Business Consultant',
      capacity: 1,
    },
  });

  // Create online consulting product
  const consulting = await prisma.product.create({
    data: {
      type: ProductType.ONLINE_CONSULTING,
      title: 'Business Strategy Consultation',
      description: '1-hour one-on-one business strategy session',
      merchantId: merchant.id,
      cancellationPolicyId: cancellationPolicy.id,
      prices: {
        create: {
          currency: 'usd',
          unitAmount: 15000, // $150.00
          billing: BillingType.HOURLY,
        },
      },
      resources: {
        connect: { id: consultant.id },
      },
    },
  });

  // Create consulting time slots
  for (let i = 1; i <= 5; i++) { // Next 5 weekdays
    const slotDate = new Date(tomorrow);
    slotDate.setDate(slotDate.getDate() + i);
    
    // Skip weekends
    if (slotDate.getDay() === 0 || slotDate.getDay() === 6) continue;

    // Create 4 slots per day (9AM, 11AM, 2PM, 4PM)
    const times = [9, 11, 14, 16];
    for (const hour of times) {
      await prisma.timeSlot.create({
        data: {
          resourceId: consultant.id,
          startsAt: new Date(slotDate.setHours(hour, 0, 0, 0)),
          endsAt: new Date(slotDate.setHours(hour + 1, 0, 0, 0)),
          capacity: 1,
        },
      });
    }
  }

  console.log('✅ Products and resources created');
  console.log('🎉 Seed completed successfully!');

  console.log('\n📋 Sample accounts:');
  console.log('Admin: admin@example.com / admin123');
  console.log('Merchant: merchant@example.com / merchant123');
  console.log('Customer: customer@example.com / customer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });