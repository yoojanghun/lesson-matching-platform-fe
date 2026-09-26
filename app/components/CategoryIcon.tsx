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

export const INSTRUMENT_EMOJI_BY_NAME: Record<string, string> = {
  PIANO: '🎹',
  피아노: '🎹',
  VIOLIN: '🎻',
  바이올린: '🎻',
  CELLO: '🎻',
  첼로: '🎻',
  GUITAR: '🎸',
  기타: '🎸',
  DRUM: '🥁',
  DRUMS: '🥁',
  드럼: '🥁',
  VOCAL: '🎤',
  보컬: '🎤',
  COMPOSITION: '🎼',
  작곡: '🎼',
};

export function getInstrumentEmoji(value?: string) {
  return value ? INSTRUMENT_EMOJI_BY_NAME[value.toUpperCase()] : undefined;
}

interface CategoryIconProps {
  code?: string;
  id?: number;
  className?: string;
  alt?: string;
  emoji?: string;
}

export default function CategoryIcon({ code, id, className = 'h-7 w-7', alt = '', emoji }: CategoryIconProps) {
  if (emoji) {
    return <span className={`${className} flex items-center justify-center text-[1.35rem] leading-none`} role={alt ? undefined : 'img'} aria-label={alt || undefined}>{emoji}</span>;
  }

  const normalizedCode = code?.toUpperCase();
  const src = (normalizedCode && CATEGORY_ICON_BY_CODE[normalizedCode])
    ?? (id !== undefined ? CATEGORY_ICON_BY_ID[id] : undefined)
    ?? '/icons/categories/music.svg';

  return <Image src={src} width={32} height={32} className={className} alt={alt} />;
}