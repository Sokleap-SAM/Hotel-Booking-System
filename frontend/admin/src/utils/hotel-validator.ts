export const validateHotelForm = (data: any) => {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 3) {
    errors.name = 'Hotel Name must be at least 3 characters.';
  } else if (data.name.trim().length > 30) {
    errors.name = 'Hotel Name cannot exceed 30 characters.';
  }

  const cleanedShortDescription = data.shortDescription ? data.shortDescription.trim() : '';
  if (cleanedShortDescription.length < 20) {
    errors.shortDescription = 'Short Description must be at least 20 characters.';
  }

  const cleanedLongDescription = data.longDescription ? data.longDescription.trim() : '';
  if (cleanedLongDescription.length < 40) {
    errors.longDescription = 'Full Description must be at least 40 characters.';
  }

  const cleanedLocation = data.location ? data.location.trim() : '';
  const locationRegex = /^\d{1,3},\s?st[\w\s]+,\s?[\w\s]+,\s?[\w\s]+$/i;
  if (!locationRegex.test(cleanedLocation)) {
    errors.location = 'Format must be: "100, st7 Makara, Krong Siem Reap, Siem Reap"';
  }

  const cleanedGoogleMapUrl = data.googleMapUrl ? data.googleMapUrl.trim() : '';
  const googleRegex = /(google\.com|goo\.gl|googleusercontent\.com)/;
  if (!googleRegex.test(cleanedGoogleMapUrl)) {
    errors.googleMapUrl = 'Please provide a valid Google Maps link.';
  }

  const hasStandard = Array.isArray(data.amenityIds) && data.amenityIds.length > 0;
  const hasCustom = !!data.custom_amenities?.trim();
  if (!hasStandard && !hasCustom) {
    errors.amenityIds = 'Select at least one amenity or enter a custom one.';
  }

  if (!data.images || data.images.length === 0) {
    errors.images = 'At least one image is required.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  const phone = data.phoneNumber ? data.phoneNumber.trim() : '';
  const cleanedPhone = phone.replace(/\s+/g, '');
  const phoneRegex = /^[0-9]{9,10}$/;
  if (!cleanedPhone || !phoneRegex.test(cleanedPhone)) {
    errors.phoneNumber = 'Phone number must be between 9 and 10 digits (numbers only).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};