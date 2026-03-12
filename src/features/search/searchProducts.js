const popularProducts = [
  'iPhone 15',
  'Samsung Galaxy S24',
  'MacBook Pro',
  'Apple Watch',
  'AirPods Pro',
];

export const searchProducts = (query) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = popularProducts.filter((product) =>
        product.toLowerCase().includes(query.toLowerCase())
      );
      resolve(filtered);
    }, 100);
  });
};
