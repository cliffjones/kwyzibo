import { fireEvent, render, screen } from '@testing-library/react';
import { Card } from '../src/features/card';
import { Confidence } from '../src/features/confidence';
import { Footer } from '../src/features/footer';
import { Button } from '../src/ui/button';
import { ButtonSet } from '../src/ui/button/button-set';
import { InputBox } from '../src/ui/input-box';
import { Option } from '../src/ui/option';
import { OptionList } from '../src/ui/option/option-list';

describe('UI and display components', () => {
  it('renders a button with its standard props and custom class', () => {
    const onClick = jest.fn();
    render(<Button className="button--primary" onClick={onClick}>Save</Button>);

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveClass('button', 'button--primary');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('groups button children', () => {
    render(<ButtonSet><Button>Continue</Button></ButtonSet>);

    expect(screen.getByRole('button', { name: 'Continue' }).parentElement).toHaveClass('button-set');
  });

  it('renders and forwards changes from a labeled text area', () => {
    const onChange = jest.fn();
    render(<InputBox label="Custom data" value="initial" onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: 'Custom data' });
    expect(input).toHaveValue('initial');
    fireEvent.change(input, { target: { value: 'updated' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('renders a labeled checkbox and forwards changes', () => {
    const onChange = jest.fn();
    render(<Option label="Science" checked={false} onChange={onChange} />);

    const option = screen.getByRole('checkbox', { name: 'Science' });
    fireEvent.click(option);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('renders an optional legend around its children', () => {
    render(<OptionList label="Topics"><Option label="Science" /></OptionList>);

    expect(screen.getByRole('group', { name: 'Topics' })).toContainElement(
      screen.getByRole('checkbox', { name: 'Science' })
    );
  });

  it('renders card content, topic, message, and children', () => {
    render(<Card topic="Science" content="What is a cell?" message="Question">
      <button type="button">Answer</button>
    </Card>);

    expect(screen.getByText('What is a cell?')).toHaveAttribute('title', 'Science');
    expect(screen.getByText('Question')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Answer' })).toBeInTheDocument();
  });

  it.each([
    ['No.', 1],
    ['Not really.', 2],
    ['Kind of.', 3],
    ['Pretty much.', 4],
    ['Yes!', 5]
  ])('reports the selected confidence rating "%s"', (label, rating) => {
    const handleRating = jest.fn();
    render(<Confidence handleRating={handleRating} />);

    fireEvent.click(screen.getByTitle(label));
    expect(handleRating).toHaveBeenCalledWith(rating);
  });

  it('renders the author link in the footer', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: 'Cliff Jones Jr.' })).toHaveAttribute(
      'href',
      'https://ko-fi.com/cliff'
    );
  });
});
