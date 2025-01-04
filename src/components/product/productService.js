import { prisma, cloudinary } from '../../config/config.js';

export async function createProduct(data, images) {
  const {
    name,
    brand,
    category,
    storage,
    cpu,
    screenSize,
    resolution,
    ram,
    graphicCard,
    description,
    price,
    priceSale,
    inStock,
    status,
  } = data;

  if (!name || !price || !brand || !category) {
    return {
      success: false,
      message: 'Tên, giá, thương hiệu và danh mục không được để trống',
    };
  }

  const existProduct = await prisma.product.findUnique({
    where: {
      name,
    },
    select: {
      id: true,
    },
  });

  if (existProduct) {
    return { success: false, message: 'Sản phẩm đã tồn tại' };
  }

  const brandName = await prisma.brand.upsert({
    where: { name: brand },
    update: {},
    create: { name: brand },
    select: { id: true },
  });

  const categoryName = await prisma.category.upsert({
    where: { name: category },
    update: {},
    create: { name: category },
    select: { id: true },
  });

  const newProduct = await prisma.product.create({
    data: {
      name: name,
      brand: {
        connect: { id: brandName.id },
      },
      category: {
        connect: { id: categoryName.id },
      },
      ...(storage && { storage: storage }),
      ...(cpu && { cpu: cpu }),
      ...(screenSize && { screen_size: screenSize }),
      ...(resolution && { resolution: resolution }),
      ...(ram && { ram: ram }),
      ...(graphicCard && { graphic_card: graphicCard }),
      ...(description && { description: description }),
      price: Number(price),
      ...(priceSale && { price_sale: Number(priceSale) }),
      ...(inStock && { in_stock: Number(inStock) }),
      ...(status && { status: status }),
    },
    select: { id: true },
  });

  // Upload images to cloudinary
  await Promise.all(
    images.map(async (image, idx) => {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'TechKit/product' }, (error, result) => {
            if (error) reject(error);
            resolve(result);
          })
          .end(image.buffer);
      });

      await prisma.product_image.create({
        data: {
          product_id: newProduct.id,
          public_id: result.public_id,
          is_profile_img: idx === 0,
        },
      });
    }),
  );

  return { success: true };
}
