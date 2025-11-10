export function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export function generateOrderNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `ORD-${year}-${random}`;
}

export function validatePeruvianPhone(phone) {
  // Peruvian phone numbers are 9 digits starting with 9
  const phoneRegex = /^9\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function formatCurrency(amount) {
  return `S/ ${parseFloat(amount).toFixed(2)}`;
}

export function calculateOrderTotals(items) {
  const subtotal = items.reduce((sum, item) => {
    return sum + (parseFloat(item.unitPrice) * item.quantity);
  }, 0);

  const shipping = 0; // TODO: Implement shipping calculation
  const total = subtotal + shipping;

  return {
    subtotal: subtotal.toFixed(2),
    shipping: shipping.toFixed(2),
    total: total.toFixed(2)
  };
}

export function getTimeRelative(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

export function paginate(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}
