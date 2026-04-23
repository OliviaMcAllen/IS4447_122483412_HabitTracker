// Component test for FormField
// Based on testing approaches from React Native Testing Library tutorials
// This test checks that the input renders correctly and updates state via props

import { fireEvent, render } from '@testing-library/react-native';
import FormField from '../components/FormField';

test('FormField renders and updates text', () => {
  // Mock function to simulate the onChangeText prop
  const mockFn = jest.fn();

  // Render the FormField component with required props
  const { getByPlaceholderText } = render(
    <FormField
      label="Email"
      placeholder="Enter email"
      value=""
      onChangeText={mockFn}
    />
  );

  // Find the input field using its placeholder text
  const input = getByPlaceholderText('Enter email');

  // Simulate user typing into the input
  fireEvent.changeText(input, 'test@test.com');

  // Check that the mock function was called with the correct value
  expect(mockFn).toHaveBeenCalledWith('test@test.com');
});