export const formatPrice = (price) => {
  return `${Number(price).toLocaleString('sr-RS', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} RSD`;
};