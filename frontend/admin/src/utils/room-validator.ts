export const validateRoomForm = (data: any) => {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 3) {
    errors.name = 'Room Name must be at least 3 characters.';
  } else if (data.name.trim().length > 30) {
    errors.name = 'Room Name cannot exceed 30 characters.';
  }

  const cleanedShortDescription = data.shortDescription ? data.shortDescription.trim() : '';
  if (cleanedShortDescription.length < 20) {
    errors.shortDescription = 'Short Description must be at least 20 characters.';
  } else if (cleanedShortDescription.length > 100) {
    errors.shortDescription = 'Short Description cannot exceed 100 characters.';
  }

  const cleanedLongDescription = data.longDescription ? data.longDescription.trim() : '';
  if (cleanedLongDescription.length < 40) {
    errors.longDescription = 'Full Description must be at least 40 characters.';
  }

  if (data.available === undefined || data.available === null || data.available < 1) {
    errors.available = 'Available rooms must be at least 1.';
  } else if (data.available > 50) {
    errors.available = 'Available rooms cannot exceed 50.';
  }

  if (!data.price || data.price <= 0) {
    errors.price = 'Price must be a positive number.';
  }

  if (data.maxOccupancy === undefined || data.maxOccupancy === null || data.maxOccupancy < 1) {
    errors.maxOccupancy = 'Max Occupancy must be at least 1.';
  } else if (data.maxOccupancy > 10) {
    errors.maxOccupancy = 'Max Occupancy cannot exceed 10.';
  }

  if (data.discountPercentage !== undefined && data.discountPercentage !== null) {
    if (data.discountPercentage < 0) {
      errors.discountPercentage = 'Discount cannot be negative.';
    } else if (data.discountPercentage > 100) {
      errors.discountPercentage = 'Discount cannot exceed 100%.';
    }
  }

  const hasStandard = Array.isArray(data.amenityIds) && data.amenityIds.length > 0;
  if (!hasStandard) {
    errors.amenityIds = 'Select at least one amenity.';
  }

  if (!data.images || data.images.length === 0) {
    errors.images = 'At least one image is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
