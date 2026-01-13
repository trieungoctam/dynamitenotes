import React from 'react';
import Masonry from 'react-masonry-css';

interface MasonryGalleryProps {
  images: string[]; // Array of image URLs
  breakpointCols?: number | Record<string, number>;
  className?: string;
  columnClassName?: string;
}

const MasonryGallery: React.FC<MasonryGalleryProps> = ({
  images,
  breakpointCols = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  },
  className = '',
  columnClassName = '',
}) => {
  return (
    <Masonry
      breakpointCols={breakpointCols}
      className={`my-masonry-grid ${className}`}
      columnClassName={`my-masonry-grid_column ${columnClassName}`}
    >
      {images.map((imageSrc, index) => (
        <div key={index} className="my-masonry-grid_item">
          <img
            src={imageSrc}
            alt={`Gallery item ${index}`}
            loading="lazy"
            className="w-full h-auto block rounded-lg shadow-md"
          />
        </div>
      ))}
    </Masonry>
  );
};

export default MasonryGallery;
