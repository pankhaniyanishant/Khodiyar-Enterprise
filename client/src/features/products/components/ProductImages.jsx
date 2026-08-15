import { useState } from 'react';

const getImageUrl = (img) => {
  if (!img) return null;

  // If already a full URL, return as-is
  if (img.startsWith('http://') || img.startsWith('https://')) {
    return img;
  }

  // If relative path, prepend API base URL
  return `${import.meta.env.VITE_API_BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`;
};

const ProductImages = ({ images = [] }) => {
  const defaultImage =
    'https://5.imimg.com/data5/AO/TC/MY-4745117/solar-photovoltaic-panel-500x500.jpg';

  const processedImages = images.map(getImageUrl).filter(Boolean);
  const initialImage =
    processedImages.length > 0 ? processedImages[0] : defaultImage;

  const [mainImage, setMainImage] = useState(initialImage);

  return (
    <div className="flex flex-col gap-6">
      {/* Main Image Container */}
      <div className="relative w-full h-[500px] bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group flex items-center justify-center p-8">
        <img
          src={mainImage}
          className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultImage;
          }}
          alt="Product Main"
        />

        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-[0.02] transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Thumbnails */}
      {processedImages.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scroller-hide">
          {processedImages.map((imgSrc, index) => {
            const isActive = mainImage === imgSrc;

            return (
              <button
                key={index}
                onClick={() => setMainImage(imgSrc)}
                className={`relative shrink-0 w-24 h-24 rounded-2xl bg-white border cursor-pointer overflow-hidden transition-all duration-300 flex items-center justify-center p-2 ${
                  isActive
                    ? 'border-blue-600 ring-4 ring-blue-50/50 shadow-md'
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-sm opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={imgSrc}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultImage;
                  }}
                  alt={`Thumbnail ${index + 1}`}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductImages;
