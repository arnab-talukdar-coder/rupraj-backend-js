const prisma = require('../config/db');
const { calculateFinalPrice } = require('./product.service');
const { getCart } = require('./cart.service');
const nodemailer = require('nodemailer');

const GST_RATE = 0.03;

const formatMoney = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatAddress = (address) => {
  if (!address) return 'No address selected';

  return [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country
  ].filter(Boolean).join(', ');
};

const sendOrderEmail = async (order, customer) => {
  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(item.product?.name || `Product #${item.productId}`)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatMoney(item.priceAtTime)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatMoney(item.priceAtTime * item.quantity)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 20px; color: #222;">
      <h2 style="color: #c20000; margin-top: 0;">New Order Placed</h2>
      <p><strong>Order ID:</strong> #${order.id}</p>
      <p><strong>Status:</strong> ${escapeHtml(order.status)}</p>

      <h3 style="margin-bottom: 8px;">Customer</h3>
      <p style="margin-top: 0;">
        <strong>Name:</strong> ${escapeHtml(customer?.name || 'N/A')}<br>
        <strong>Email:</strong> ${escapeHtml(customer?.email || 'N/A')}<br>
        <strong>Phone:</strong> ${escapeHtml(customer?.phone || 'N/A')}
      </p>

      <h3 style="margin-bottom: 8px;">Shipping Address</h3>
      <p style="margin-top: 0;">${escapeHtml(formatAddress(order.address))}</p>

      <h3 style="margin-bottom: 8px;">Items</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: left;">Product</th>
            <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: center;">Qty</th>
            <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">Unit Price</th>
            <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <p style="text-align: right; margin-bottom: 4px;"><strong>GST:</strong> ${formatMoney(order.gstAmount)}</p>
      <p style="text-align: right; margin-top: 0; font-size: 18px;"><strong>Total:</strong> ${formatMoney(order.totalAmount)}</p>
      <p style="font-size: 12px; color: #777;">No online payment was collected for this order.</p>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER || '"Rupraj Jewellers" <noreply@rupraj.com>',
    to: process.env.ORDER_EMAIL_TO || 'office.ruprajjewellers@gmail.com',
    subject: `New Order Received - Order #${order.id}`,
    html
  };

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    await transporter.sendMail(mailOptions);
  } else {
    console.log('New order email skipped because SMTP is not configured:', mailOptions.subject);
  }
};

const createOrderFromCart = async (userId, addressId) => {
  const cart = await getCart(userId);
  if (!cart.items || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  const customer = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, phone: true }
  });

  if (addressId) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });
    if (!address) throw new Error('Invalid address');
  } else {
    const defaultAddress = await prisma.address.findFirst({
      where: { userId, isDefault: true }
    });
    if (defaultAddress) addressId = defaultAddress.id;
  }

  let totalAmount = 0;
  let totalGst = 0;

  const orderItemsData = cart.items.map((item) => {
    const finalPrice = calculateFinalPrice(item.product);
    const subtotal = finalPrice / (1 + GST_RATE);
    const gst = finalPrice - subtotal;

    totalAmount += finalPrice * item.quantity;
    totalGst += gst * item.quantity;

    return {
      productId: item.productId,
      quantity: item.quantity,
      priceAtTime: finalPrice
    };
  });

  const order = await prisma.order.create({
    data: {
      userId,
      addressId,
      totalAmount,
      gstAmount: totalGst,
      items: {
        create: orderItemsData
      }
    },
    include: {
      items: { include: { product: true } },
      address: true
    }
  });

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id }
  });

  try {
    await sendOrderEmail(order, customer);
  } catch (emailErr) {
    console.error('Failed to send order email to owner:', emailErr);
  }

  return { order, amount: totalAmount };
};

const getUserOrders = async (userId) => {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: true } },
      address: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getAllOrders = async () => {
  return await prisma.order.findMany({
    include: {
      user: true,
      address: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const updateOrderStatus = async (orderId, status) => {
  return await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });
};

module.exports = {
  createOrderFromCart,
  getUserOrders,
  getAllOrders,
  updateOrderStatus
};
