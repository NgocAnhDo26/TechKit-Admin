import { prisma } from '../../config/config.js';
import { getImage } from '../util/util.js';

// Fetch all orders
export async function fetchOrderWithQuery(query) {
  let filters = {
    AND: [],
  };

  // Pagination settings
  let page = Number(query.page) || 1;
  let limit = Number(query.limit) || 10;
  let offset = (page - 1) * limit;

  if (query.status) {
    filters.AND.push({ status: query.status });
  }

  // Prepare sorting
  let orderBy = {};
  if (query.order) {
    orderBy.create_time = query.order;
  }

  const orders = await prisma.orders.findMany({
    where: filters,
    select: {
      id: true,
      account: {
        select: {
          name: true,
        },
      },
      shipping_address: true,
      create_time: true,
      status: true,
      customer_name: true,
      customer_phone: true,
      customer_email: true,
      payment_method: true,
      total_price: true,
    },
    orderBy: orderBy,
  });

  if (!orders.length) {
    return []; // Empty orders
  }

  // Process orders format
  const formattedOrders = orders.map((order) => ({
    id: order.id,
    account: order.account.name,
    create_time: order.create_time,
    status: order.status,
    total_price: order.total_price,
  }));

  // Compute total pages after filtering
  const totalOrders = formattedOrders.length;
  const totalPage = Math.ceil(totalOrders / limit);

  return {
    orders: formattedOrders.slice(offset, offset + limit),
    totalPage,
    currentPage: page,
  };
}

export async function fetchOrderById(id) {
  const order = await prisma.orders.findUnique({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
      account: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      shipping_address: true,
      create_time: true,
      status: true,
      customer_name: true,
      customer_phone: true,
      customer_email: true,
      payment_method: true,
      total_price: true,
      order_product: {
        select: {
          product: {
            select: {
              name: true,
              brand: {
                select: {
                  name: true,
                },
              },
              category: {
                select: {
                  name: true,
                },
              },
              product_image: {
                select: {
                  public_id: true,
                },
                where: {
                  is_profile_img: true,
                },
              },
            },
          },
          quantity: true,
          price: true,
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  return {
    id: order.id,
    account: {
      name: order.account.name,
      email: order.account.email,
      phone: order.account.phone,
    },
    shipping_address: order.shipping_address,
    create_time: order.create_time,
    status: order.status,
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    customer_email: order.customer_email,
    payment_method: order.payment_method,
    total_price: order.total_price,
    order_product: order.order_product.map((product) => ({
      name: product.product.name,
      brand: product.product.brand.name,
      category: product.product.category.name,
      image: getImage(product.product.product_image[0].public_id),
      quantity: product.quantity,
      price: product.price,
    })),
  };
}

export async function updateOrderStatus(id, newStatus) {
  return prisma.orders.update({
    where: { id: Number(id) },
    data: { status: newStatus },
  });
}
