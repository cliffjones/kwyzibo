import type { TextareaHTMLAttributes } from 'react';
import './style.scss';

type TextBoxProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export const TextBox = ({ label, className, ...props }: TextBoxProps) => (
  <label className="text-box-label">
    {label}
    <textarea
      className={['text-box', className].filter(Boolean).join(' ')}
      {...props}
    />
  </label>
);
