import { useState } from 'react';
import { Button, Text, View } from 'react-native';

export default function IndexScreen() {
  const [count, setCount] = useState(0);

  return (
    <View style={{ padding: 20 }}>
      <Text>Habit Tracker</Text>

      <Text>Times completed: {count}</Text>

      <Button title="+1" onPress={() => setCount(count + 1)} />
    </View>
  );
}