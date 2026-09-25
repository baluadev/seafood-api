import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Admin User ───────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@seashop.vn' },
    update: {},
    create: {
      email: 'admin@seashop.vn',
      passwordHash: adminPassword,
      fullName: 'Admin SeaShop',
      phone: '0900000001',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin:', admin.email);

  // ─── Sliders ──────────────────────────────────────────────
  const slider1 = await prisma.slider.upsert({
    where: { id: 'slider-1' },
    update: {},
    create: {
      id: 'slider-1',
      title: 'Hải Sản Tươi Sống Mỗi Ngày',
      subtitle: '🌊 Trực tiếp từ biển',
      description: 'Giao hàng tận nhà trong ngày tại TP.Hà Nội. Đảm bảo tươi sống, an toàn vệ sinh.',
      imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=1200&q=80',
      linkUrl: '/shop',
      sortOrder: 1,
    },
  });

  const slider2 = await prisma.slider.upsert({
    where: { id: 'slider-2' },
    update: {},
    create: {
      id: 'slider-2',
      title: 'Khuyến Mãi Cuối Tuần',
      subtitle: '🎉 Giảm đến 30%',
      description: 'Ưu đãi đặc biệt cho đơn hàng từ 500.000đ trở lên.',
      imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=1200&q=80',
      linkUrl: '/shop?isHot=true',
      sortOrder: 2,
    },
  });
  console.log('✅ Sliders:', slider1.id, slider2.id);

  // ─── Categories ───────────────────────────────────────────
  const categories = [
    { id: 'cat-tom', name: 'Tôm', slug: 'tom', imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=300&q=80', sortOrder: 1 },
    { id: 'cat-cua', name: 'Cua & Ghẹ', slug: 'cua-ghe', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80', sortOrder: 2 },
    { id: 'cat-ca', name: 'Cá', slug: 'ca', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80', sortOrder: 3 },
    { id: 'cat-muc', name: 'Mực & Bạch Tuộc', slug: 'muc-bach-tuoc', imageUrl: 'https://images.unsplash.com/photo-1559717865-a99cac1c95d8?w=300&q=80', sortOrder: 4 },
    { id: 'cat-ngheu', name: 'Nghêu & Sò', slug: 'ngheu-so', imageUrl: 'https://images.unsplash.com/photo-1609252924198-b3db93e98f0c?w=300&q=80', sortOrder: 5 },
    { id: 'cat-khac', name: 'Hải Sản Khác', slug: 'hai-san-khac', imageUrl: '', sortOrder: 6 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { imageUrl: cat.imageUrl },
      create: cat,
    });
  }
  console.log('✅ Categories:', categories.length);

  // ─── Products ─────────────────────────────────────────────
  const products = [
    {
      id: 'prod-tom-su',
      categoryId: 'cat-tom',
      title: 'Tôm Sú Tươi Sống',
      slug: 'tom-su-tuoi-song',
      description: 'Tôm sú tươi sống, nuôi tại vùng biển Kiên Giang. Thịt ngọt, chắc, phù hợp để hấp, nướng, lẩu.',
      price: 350000,
      discountRate: 0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&q=80',
      stockQuantity: 50,
      unit: 'kg',
      isHot: true,
      avgRating: 4.8,
      reviewCount: 32,
    },
    {
      id: 'prod-tom-the',
      categoryId: 'cat-tom',
      title: 'Tôm Thẻ Chân Trắng',
      slug: 'tom-the-chan-trang',
      description: 'Tôm thẻ chân trắng loại 1, size 50 con/kg. Thịt mềm, ngọt, thích hợp chiên, luộc.',
      price: 180000,
      discountRate: 0.1,
      thumbnailUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&q=80',
      stockQuantity: 80,
      unit: 'kg',
      isHot: true,
      avgRating: 4.6,
      reviewCount: 45,
    },
    {
      id: 'prod-cua-bien',
      categoryId: 'cat-cua',
      title: 'Cua Biển Tươi Sống',
      slug: 'cua-bien-tuoi-song',
      description: 'Cua biển tươi sống từ Cà Mau. Cua gạch đầy, thịt chắc. Trung bình 400-600g/con.',
      price: 420000,
      discountRate: 0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      stockQuantity: 30,
      unit: 'kg',
      isHot: true,
      avgRating: 4.9,
      reviewCount: 67,
    },
    {
      id: 'prod-ghe-bien',
      categoryId: 'cat-cua',
      title: 'Ghẹ Xanh Tươi',
      slug: 'ghe-xanh-tuoi',
      description: 'Ghẹ xanh tươi sống, gạch béo. Phù hợp hấp sả, rang muối.',
      price: 280000,
      discountRate: 0.15,
      thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      stockQuantity: 40,
      unit: 'kg',
      isHot: false,
      avgRating: 4.5,
      reviewCount: 28,
    },
    {
      id: 'prod-ca-mu',
      categoryId: 'cat-ca',
      title: 'Cá Mú Đỏ Tươi',
      slug: 'ca-mu-do-tuoi',
      description: 'Cá mú đỏ tươi sống, trọng lượng 600g-1kg/con. Thịt trắng, ít xương, ngọt. Thích hợp hấp xì dầu.',
      price: 520000,
      discountRate: 0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80',
      stockQuantity: 20,
      unit: 'kg',
      isHot: true,
      avgRating: 4.7,
      reviewCount: 19,
    },
    {
      id: 'prod-ca-chep',
      categoryId: 'cat-ca',
      title: 'Cá Chép Sông Tươi',
      slug: 'ca-chep-song-tuoi',
      description: 'Cá chép sông tươi nguyên con. Thịt ngọt, nhiều dinh dưỡng.',
      price: 95000,
      discountRate: 0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
      stockQuantity: 60,
      unit: 'kg',
      isHot: false,
      avgRating: 4.3,
      reviewCount: 14,
    },
    {
      id: 'prod-muc-nang',
      categoryId: 'cat-muc',
      title: 'Mực Nang Tươi',
      slug: 'muc-nang-tuoi',
      description: 'Mực nang tươi size lớn, từ vùng biển Phú Quốc. Thịt dày, ngọt, phù hợp xào, hấp, nướng.',
      price: 320000,
      discountRate: 0.1,
      thumbnailUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80',
      stockQuantity: 35,
      unit: 'kg',
      isHot: true,
      avgRating: 4.6,
      reviewCount: 38,
    },
    {
      id: 'prod-bach-tuoc',
      categoryId: 'cat-muc',
      title: 'Bạch Tuộc Tươi',
      slug: 'bach-tuoc-tuoi',
      description: 'Bạch tuộc tươi nguyên con, size vừa. Phù hợp nướng, chiên, xào.',
      price: 240000,
      discountRate: 0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
      stockQuantity: 25,
      unit: 'kg',
      isHot: false,
      avgRating: 4.4,
      reviewCount: 22,
    },
    {
      id: 'prod-ngheu',
      categoryId: 'cat-ngheu',
      title: 'Nghêu Tươi Sống',
      slug: 'ngheu-tuoi-song',
      description: 'Nghêu tươi sống từ Bến Tre. Luộc sả, hấp gừng, xào chua cay đều ngon.',
      price: 65000,
      discountRate: 0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      stockQuantity: 100,
      unit: 'kg',
      isHot: false,
      avgRating: 4.5,
      reviewCount: 55,
    },
    {
      id: 'prod-so-huyet',
      categoryId: 'cat-ngheu',
      title: 'Sò Huyết Tươi',
      slug: 'so-huyet-tuoi',
      description: 'Sò huyết tươi sống, trứng đầy. Phù hợp nướng mỡ hành, luộc.',
      price: 120000,
      discountRate: 0.2,
      thumbnailUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&q=80',
      stockQuantity: 70,
      unit: 'kg',
      isHot: true,
      avgRating: 4.7,
      reviewCount: 41,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { thumbnailUrl: p.thumbnailUrl, price: p.price, discountRate: p.discountRate, stockQuantity: p.stockQuantity, isHot: p.isHot },
      create: p,
    });
  }
  console.log('✅ Products:', products.length);

  // ─── Promotion Cards ──────────────────────────────────────────────
  const promotions = [
    {
      id: 'promo-1',
      tag: 'TƯƠI MỚI MỖI NGÀY',
      title: 'Trái cây nhiệt đới tươi mới',
      description: 'Giảm ngay 20% cho xoài cát Hòa Lộc, bưởi da xanh & dừa lưới hôm nay.',
      buttonText: 'Khám phá ngay →',
      linkUrl: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=300&h=200&fit=crop',
      bgColor: '#d4f7a0',
      isActive: true,
      sortOrder: 0,
    },
    {
      id: 'promo-2',
      tag: 'SỐNG KHỎE MỖI NGÀY',
      title: 'Bữa ăn thuần Organic',
      description: 'Combo rau củ canh tác không thuốc trừ sâu, an toàn cho cả bé.',
      buttonText: 'Xem gói combo →',
      linkUrl: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
      bgColor: '#d4f7a0',
      isActive: true,
      sortOrder: 1,
    },
  ];

  for (const promo of promotions) {
    await prisma.promotion.upsert({
      where: { id: promo.id },
      update: { tag: promo.tag, title: promo.title, description: promo.description, buttonText: promo.buttonText, imageUrl: promo.imageUrl },
      create: promo,
    });
  }
  console.log('✅ Promotions:', promotions.length);

  // ─── Coupons ───────────────────────────────────────────────
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
  }
  console.log('✅ Coupons: SIN30, FREESHIP, SINMEMBER10');

  console.log('\n🎉 Seed completed!');
  console.log('👤 Admin login: admin@seashop.vn / admin123456');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
