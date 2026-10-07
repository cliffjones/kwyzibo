import type { ReactNode } from 'react';
import { getTextSize } from './get-text-size';
import './style.scss';

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
      <p className="card-message">{message}</p>
    ) : null}

    {children}
  </section>
);
