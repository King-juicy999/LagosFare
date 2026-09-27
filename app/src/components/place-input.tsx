import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS } from "../constants/lagosfare";

interface PlaceInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  suggestions: string[];
  onPickSuggestion: (value: string) => void;
  action?: { glyph: string; onPress: () => void };
  autoFocus?: boolean;
}

export function PlaceInput({
  label,
  value,
  onChangeText,
  onFocus,
  suggestions,
  onPickSuggestion,
  action,
  autoFocus = false,
}: PlaceInputProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          autoFocus={autoFocus}
          autoCapitalize="words"
          autoCorrect={false}
          placeholder="Type an area"
          placeholderTextColor={COLORS.inkFaint}
          returnKeyType="next"
        />
        {action ? (
          <Pressable
            onPress={action.onPress}
            style={styles.action}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            <Text style={styles.actionGlyph}>{action.glyph}</Text>
          </Pressable>
        ) : null}
      </View>

      {suggestions.length > 0 ? (
        <View style={styles.suggestions}>
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion}
              onPress={() => onPickSuggestion(suggestion)}
              style={styles.suggestion}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    color: COLORS.inkFaint,
    marginBottom: 6,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.ink,
  },
  action: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  actionGlyph: {
    fontFamily: "MaterialSymbols_500Medium",
    fontSize: 22,
    color: COLORS.brand,
  },
  suggestions: {
    marginTop: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    overflow: "hidden",
  },
  suggestion: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  suggestionText: {
    fontSize: 15,
    color: COLORS.ink,
  },
});
