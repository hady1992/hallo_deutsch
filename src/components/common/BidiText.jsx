import React from 'react';
import { cn } from '@/lib/utils';
import { getBidiTextProps } from '@/utils/textDirection';

const BidiText = ({
  as: Component = 'span',
  text,
  children,
  className,
  fallbackDirection = 'rtl',
  dir,
  lang,
  ...props
}) => {
  const content = text ?? children ?? '';
  const detected = getBidiTextProps(content, fallbackDirection);
  return (
    <Component
      {...props}
      dir={dir || detected.dir}
      lang={lang || detected.lang}
      className={cn('bidi-text', className)}
    >
      {content}
    </Component>
  );
};

export default BidiText;
