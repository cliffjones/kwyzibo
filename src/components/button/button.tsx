import type { ButtonHTMLAttributes } from 'react';

import './button.scss';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({ className, ...props }: ButtonProps) => (
  <button
    className={['button', className].filter(Boolean).join(' ')}
    {...props}
  />
);
