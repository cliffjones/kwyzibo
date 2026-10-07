import { ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';

import { AppDispatch, RootState, selectTopics, startQuiz } from '../../store';
import { Button } from '../button';
import { ButtonSet } from '../button/button-set';
import { Card } from '../card';
import { Option } from '../option';
import { OptionList } from '../option/option-list';
import { TextBox } from '../text-box';

const selectAvailableTopics = createSelector(
  [(state: RootState) => state.kwyzibo.items],
  items => [...new Set(items.map(item => item.topic))]
    .sort((left, right) => left.localeCompare(right))
);

type InitialSetupProps = {
  customData: string;
  handleTextChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

export const InitialSetup = ({ customData, handleTextChange }: InitialSetupProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const availableTopics = useSelector(selectAvailableTopics);
  const selectedTopics = useSelector((state: RootState) => state.kwyzibo.selectedTopics);

  const toggleTopic = (topic: string) => {
    const nextSelection = selectedTopics.includes(topic)
      ? selectedTopics.filter(value => value !== topic)
      : [...selectedTopics, topic];
    dispatch(selectTopics(nextSelection));
  };

  const handleStartQuiz = () => {
    dispatch(startQuiz());
  };

  return (
    <Card message="What do you want to learn today?">
      {availableTopics.length ? (
        <OptionList label="Preloaded topics:">
          {availableTopics.map(topic => (
            <Option
              key={topic}
              label={topic}
              checked={selectedTopics.includes(topic)}
              onChange={() => toggleTopic(topic)}
            />
          ))}
        </OptionList>
      ) : null }

      <TextBox label="Custom quiz data:" value={customData} onChange={handleTextChange} />

      <ButtonSet>
        <Button onClick={handleStartQuiz}>➤ Start</Button>
      </ButtonSet>
    </Card>
  );
};
