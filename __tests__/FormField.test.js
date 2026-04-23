import { fireEvent, render } from '@testing-library/react-native';
import FormField from '../components/FormField';

test('FormField renders and updates text', () => {
  const mockFn = jest.fn();

  const { getByPlaceholderText } = render(
    <FormField
      label="Email"
      placeholder="Enter email"
      value=""
      onChangeText={mockFn}
    />
  );

  const input = getByPlaceholderText('Enter email');

  fireEvent.changeText(input, 'test@test.com');

  expect(mockFn).toHaveBeenCalledWith('test@test.com');
});