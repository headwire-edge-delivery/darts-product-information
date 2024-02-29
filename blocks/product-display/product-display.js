export default async function decorate(block) {
  const products = block.querySelectorAll('.product-display > div');
  products.forEach((product) => {
    product.classList.add('product');
    const image = product.querySelectorAll('div')[0];
    image.classList.add('product-image');
    const description = product.querySelectorAll('div')[1];
    description.classList.add('product-description', 'glass-bg');
  });
}
