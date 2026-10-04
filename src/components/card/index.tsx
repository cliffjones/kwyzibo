import type { ReactNode } from 'react';

import './style.scss';
import { getTextSize } from './get-text-size';

type CardProps = {
  children?: ReactNode;
  topic?: string;
  content?: string;
  message?: string;
};

export const Card = ({
  children,
  topic,
  content,
  message,
}: CardProps) => (
  <section className="card">
    {content ? (
      <p style={{ fontSize: getTextSize(content) }} title={topic}>
        {content}
      </p>
    ) : null}

    {message ? (
      <p className="message">{message}</p>
    ) : null}

    {children}
  </section>
);
