import { prisma, cloudinary } from '../../config/config.js';
import { getImage } from '../util/util.js';

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

// fetch all products
export async function fetchProductWithQuery(query) {
  let filters = {
    AND: [],
  };

  // Pagination settings
  let page = Number(query.page) || 1;
  let limit = Number(query.limit) || 10;
  let offset = (page - 1) * limit;

  // Keyword search filters
  if (query.keyword) {
    filters.AND.push({ name: { contains: query.keyword } });
  }

  if (query.category) {
    filters.AND.push({
      category: {
        name: query.category,
      },
    });
  }

  if (query.brand) {
    filters.AND.push({ brand: { name: query.brand } });
  }

  // Prepare sorting
  let orderBy = {};
  if (query.order && query.sortBy) {
    orderBy[query.sortBy] = query.order;
  }

  const products = await prisma.product.findMany({
    where: filters,
    select: {
      id: true,
      name: true,
      price: true,
      price_sale: true,
      create_time: true,
      in_stock: true,
      sales: true,
      status: true,
      product_image: {
        select: { public_id: true, is_profile_img: true },
      },
      category: {
        select: { name: true },
      },
      brand: {
        select: { name: true },
      }
    },
    orderBy: orderBy,
  });

  if (!products.length) {
    return []; // Empty products
  }

  // Process products format
  const formattedProducts = formatProducts(products);

  // Compute total pages after filtering
  const totalProducts = formattedProducts.length;
  const totalPage = Math.ceil(totalProducts / limit);

  return {
    products: formattedProducts.slice(offset, offset + limit),
    totalPage,
    currentPage: page,
  };
}

function formatProducts(products) {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    price_sale: product.price_sale,
    category: product.category.name,
    brand: product.brand.name,
    create_time: product.create_time,
    in_stock: product.in_stock,
    sales: product.sales,
    status: product.status,
    profile_img: getImage(
      product.product_image.find((img) => img.is_profile_img).public_id,
    ).url,
    images: product.product_image
      .filter((img) => !img.is_profile_img)
      .map((img) => getImage(img.public_id).url),
  }));
}