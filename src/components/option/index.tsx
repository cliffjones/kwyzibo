import type { InputHTMLAttributes } from 'react';

import './style.scss';

type CheckboxOptionProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export const CheckboxOption = ({ label, ...props }: CheckboxOptionProps) => (
  <label className="option">
    <input
      type="checkbox"
      {...props}
    />
    {label || <em>Unspecified</em>}
  </label>
);
