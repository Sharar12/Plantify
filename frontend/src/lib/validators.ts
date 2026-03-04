export function isValidPhoneBD(phone: string): boolean {
  const regex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
  return regex.test(phone.replace(/[\s-]/g, ""));
}

export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

export interface DeliveryValidationErrors {
  recipientName?: string;
  phone?: string;
  zone?: string;
  address?: string;
  pincode?: string;
}

export function validateDeliveryAddress(data: {
  recipientName: string;
  phone: string;
  zone: string;
  address: string;
  pincode?: string;
}): DeliveryValidationErrors {
  const errors: DeliveryValidationErrors = {};
  if (!data.recipientName || data.recipientName.trim().length < 2) {
    errors.recipientName = "Recipient name is required (min 2 characters)";
  }
  if (!data.phone || !isValidPhoneBD(data.phone)) {
    errors.phone = "Valid Bangladeshi mobile number is required (01XXXXXXXXX)";
  }
  if (!data.zone || data.zone.trim().length === 0) {
    errors.zone = "Delivery city/zone is required";
  }
  if (!data.address || data.address.trim().length < 8) {
    errors.address = "Detailed street and house address is required";
  }
  return errors;
}
