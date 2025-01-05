import { prisma } from '../../config/config.js';

export async function viewReport(date) {
  const { duration, dateStr } = date;
  if (!['day', 'month', 'year', 'week'].includes(duration)) {
    throw new Error(
      'Thiếu tham số khoảng thời gian hoặc ngày trong khoảng thời gian',
    );
  }

  // Parse dateStr "DD/MM/YYYY"
  const [day, month, year] = dateStr.split('/').map(Number);
  let fromDate, toDate;

  if (duration === 'day') {
    fromDate = new Date(year, month - 1, day, 0, 0, 0);
    toDate = new Date(year, month - 1, day, 23, 59, 59);
  } else if (duration === 'week') {
    // Week starts on Monday and ends on Sunday
    // The input date is in between the week.
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Adjust Monday = 0, Sunday = 6
    const monday = date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    fromDate = new Date(year, month - 1, monday, 0, 0, 0);
    toDate = new Date(year, month - 1, monday + 6, 23, 59, 59);
  } else if (duration === 'month') {
    fromDate = new Date(year, month - 1, 1, 0, 0, 0);
    toDate = new Date(year, month, 1, 0, 0, 0); // Next month
  } else if (duration === 'year') {
    fromDate = new Date(year, 0, 1, 0, 0, 0);
    toDate = new Date(year + 1, 0, 1, 0, 0, 0); // Next year
  } else {
    throw new Error('Khoảng thời gian không hợp lệ');
  }

  const data = await prisma.order_product.findMany({
    where: {
      orders: {
        status: 'hoàn thành',
        create_time: { gte: fromDate, lte: toDate },
      },
    },
    select: {
      quantity: true,
      product: {
        select: {
          id: true,
          name: true,
          price_sale: true,
          category: {
            select: {
              name: true,
            },
          },
          brand: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  let totalSales = 0;
  let totalRevenue = 0;
  const categoryMap = new Map();
  const brandMap = new Map();
  const productMap = new Map();

  for (const row of data) {
    const { product } = row;
    const sales = row.quantity;
    const revenue = product.price_sale * row.quantity;
    totalSales += sales;
    totalRevenue += revenue;

    if (!productMap.has(product.id)) {
      productMap.set(product.id, {
        product: product.name,
        sales: 0,
        revenue: 0,
      });
    }
    productMap.get(product.id).sales += sales;
    productMap.get(product.id).revenue += revenue;

    const catName = product.category.name;
    if (!categoryMap.has(catName)) {
      categoryMap.set(catName, { category: catName, sales: 0, revenue: 0 });
    }
    categoryMap.get(catName).sales += sales;
    categoryMap.get(catName).revenue += revenue;

    const brandName = product.brand.name;
    if (!brandMap.has(brandName)) {
      brandMap.set(brandName, { brand: brandName, sales: 0, revenue: 0 });
    }
    brandMap.get(brandName).sales += sales;
    brandMap.get(brandName).revenue += revenue;
  }

  const saleByCategory = [...categoryMap.values()];
  const saleByBrand = [...brandMap.values()];
  const saleByProduct = [...productMap.values()];

  return {
    totalSale: { sales: totalSales, revenue: totalRevenue },
    saleByCategory: saleByCategory.sort((a, b) => b.revenue - a.revenue),
    saleByBrand: saleByBrand.sort((a, b) => b.revenue - a.revenue),
    saleByProduct: saleByProduct.sort((a, b) => b.revenue - a.revenue),
    success: true,
  };
}
