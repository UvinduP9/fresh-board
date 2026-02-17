'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { useI18n } from '@/lib/I18nContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t } = useI18n();

  return (
    <Link
      href={`/product/${product.id}`}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
    >
      <div className="relative aspect-square bg-gray-100">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
        {!product.inStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
            {t('product.outOfStock')}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 text-gray-900">{product.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{product.vendor.name}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-primary-600">
            {product.price} kr
            <span className="text-sm font-normal text-gray-600">/{product.unit}</span>
          </span>
          <span className="text-xs text-gray-500">{product.location.name}</span>
        </div>
      </div>
    </Link>
  );
}
