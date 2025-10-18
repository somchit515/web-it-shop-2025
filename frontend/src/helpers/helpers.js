export const getPriceQueryParams = (searchParams, key, value) => {
    const hasValueInParam = searchParams.has(key);

    if ((value !== null && value !== undefined) && hasValueInParam) {
      searchParams.set(key, value); // Update the existing parameter
    } else if (value !== null && value !== undefined) {
      searchParams.append(key, value); // Append a new parameter with both key and value
    } else if (hasValueInParam) {
      searchParams.delete(key); // Remove the parameter if no valid value is provided
    }

    return searchParams;
};

// -----------------------------------------------------------
// 🛑 FIX: Rename returned properties to match Mongoose Schema
// -----------------------------------------------------------
export const caluclateOrderCosts = (items) => {
    const subtotalUnits = items.reduce((acc, item) => acc + item.quantity, 0);
    const calculatedItemsPrice = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    
    // Use the required variable names for the rest of the calculation for clarity
    const shippingAmount = calculatedItemsPrice > 1000 ? 0 : 10; // Free shipping for orders over $1000
    const taxAmount = calculatedItemsPrice * 0.1; // Assuming a tax rate of 10%
    const totalAmount = calculatedItemsPrice + shippingAmount + taxAmount;

    return { 
      subtotalUnits,
      // 🛑 Mongoose Schema Match:
      itemsPrice: calculatedItemsPrice, // Renamed from subtotalPrice
      shippingAmount: shippingAmount, // Renamed from shippingCharges
      taxAmount: taxAmount, // Renamed from tax
      totalAmount: totalAmount // Renamed from totalPrice
    };
}