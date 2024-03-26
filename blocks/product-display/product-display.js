export default async function decorate(block) {
  const products = block.querySelectorAll('.product-display > div');
  products.forEach((product) => {
    product.classList.add('product');
    const image = product.querySelectorAll('picture')[0];
    image.classList.add('product-image');
    product.prepend(image);
    // removes all empty elements
    block.querySelectorAll('*').forEach((el) => {
      // Check if the element is an image; if so, skip it
      if (el.tagName.toLowerCase() === 'img') {
        return;
      }

      // Check if the element is empty (no text content and no child elements); if so, remove it
      if (el.textContent.trim() === '' && el.children.length === 0) {
        el.remove();
      }
    });

    const description = product.querySelectorAll('div')[0];
    description.classList.add('product-description', 'glass-bg');
  });
}
