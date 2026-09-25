import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCoupons() {
  console.log('🎫 Seeding coupons...');
  const coupons = [
    {
      id: 'coupon-sin30',
      code: 'SIN30',
      type: 'FIXED_AMOUNT' as any,
      value: 30000,
      minOrderAmt: 100000,
      usageLimit: 500,
      perUserLimit: 1,
      description: 'Giảm 30.000đ cho đơn từ 100.000đ',
      isActive: true,
    },
    {
      id: 'coupon-freeship',
      code: 'FREESHIP',
      type: 'FREE_SHIPPING' as any,
      value: 0,
      minOrderAmt: 200000,
      usageLimit: 1000,
      perUserLimit: 3,
      description: 'Miễn phí vận chuyển cho đơn từ 200.000đ',
      isActive: true,
    },
    {
      id: 'coupon-sinmember10',
      code: 'SINMEMBER10',
      type: 'PERCENT' as any,
      value: 10,
      minOrderAmt: 150000,
      maxDiscount: 50000,
      usageLimit: 200,
      perUserLimit: 1,
      description: 'Giảm 10% tối đa 50.000đ cho thành viên SIN',
      isActive: true,
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { id: coupon.id },
      update: { isActive: coupon.isActive, description: coupon.description },
      create: coupon,
    });
    console.log(`  ✅ ${coupon.code}: ${coupon.description}`);
  }

  console.log('\n🎉 Coupons seeded successfully!');
}

seedCoupons()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
