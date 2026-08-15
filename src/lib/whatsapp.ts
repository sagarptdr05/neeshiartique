import { Order } from '@/data/mockData';
import { BRAND_CONFIG } from '@/config/brand';

/**
 * Builds the order enquiry the customer sends to the Neeshiartique WhatsApp.
 * Everything is generated from the saved order, so the message always mirrors
 * the server-calculated prices rather than anything the browser supplied.
 */
export function buildOrderWhatsAppMessage(order: Order): string {
  const address = order.shipping_address;

  const productLines = order.items
    .map((item, index) => {
      const customization = item.customization ? ` (${item.customization})` : '';
      return `${index + 1}. ${item.name}${customization} × ${item.quantity} — ₹${item.price * item.quantity}`;
    })
    .join('\n');

  const lines = [
    `Hi ${BRAND_CONFIG.name}! ♡`,
    'I would like to place an order.',
    '',
    `Order ID: ${order.id}`,
    '',
    'Customer:',
    address.fullName,
    'Phone:',
    address.phone,
    '',
    'Products:',
    productLines,
    '',
    `Subtotal: ₹${order.subtotal}`,
    `Shipping: ${order.shipping === 0 ? 'Free' : `₹${order.shipping}`}`,
  ];

  if (order.discount > 0) {
    lines.push(`Discount: -₹${order.discount}`);
  }

  lines.push(
    `Total: ₹${order.total}`,
    '',
    'Delivery Address:',
    `${address.address}, ${address.city}, ${address.state}`,
    'Pincode:',
    address.pincode
  );

  if (order.customer_notes && order.customer_notes.trim()) {
    lines.push('', 'Order Notes:', order.customer_notes.trim());
  }

  lines.push('', 'Please share the payment QR/details for this order.', 'Thank you! ♡');

  return lines.join('\n');
}

/** wa.me deep link with the order message pre-filled and URL encoded. */
export function buildOrderWhatsAppUrl(order: Order): string {
  const message = buildOrderWhatsAppMessage(order);
  return `https://wa.me/91${BRAND_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
