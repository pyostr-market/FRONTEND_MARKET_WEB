export const searchProducts = async (query) => {
  const popularProducts = [
    'iPhone 15',
    'Samsung Galaxy S24',
    'MacBook Pro',
    'Apple Watch',
    'AirPods Pro',
  ];

  return popularProducts.filter((product) =>
    product.toLowerCase().includes(query.toLowerCase())
  );
};
