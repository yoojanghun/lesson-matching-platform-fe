import Image from 'next/image';

const CATEGORY_ICON_BY_CODE: Record<string, string> = {
  PIANO: '/icons/categories/piano.svg',
  VIOLIN: '/icons/categories/violin.svg',
  CELLO: '/icons/categories/cello.svg',
  GUITAR: '/icons/categories/guitar.svg',
  DRUM: '/icons/categories/drum.svg',
  VOCAL: '/icons/categories/vocal.svg',
  COMPOSITION: '/icons/categories/composition.svg',
};

const CATEGORY_ICON_BY_ID: Record<number, string> = {};

interface CategoryIconProps {
  code?: string;
  id?: number;
  className?: string;
  alt?: string;
}

export default function CategoryIcon({ code, id, className = 'h-7 w-7', alt = '' }: CategoryIconProps) {
  const normalizedCode = code?.toUpperCase();
  const src = (normalizedCode && CATEGORY_ICON_BY_CODE[normalizedCode])
    ?? (id !== undefined ? CATEGORY_ICON_BY_ID[id] : undefined)
    ?? '/icons/categories/music.svg';

  return <Image src={src} width={32} height={32} className={className} alt={alt} />;
}