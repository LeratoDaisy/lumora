import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ActionButton, Card, Heading, Page } from '@/components/lumora-ui';
import { Fonts } from '@/constants/theme';
import { useLumoraColors, useThemedStyles } from '@/contexts/appearance-context';
import { useOnboarding } from '@/contexts/onboarding-context';
import { ScalePressable } from '@/components/scale-pressable';

export default function ProfileScreen() {
  const styles = useThemedStyles(baseStyles);
  const { profile, saveProfile } = useOnboarding();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [preferredName, setPreferredName] = useState(profile.preferredName);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!firstName.trim()) {
      setError('Enter your name to save your profile.');
      setSaved('');
      return;
    }

    setSaving(true);
    setError('');
    setSaved('');
    try {
      await saveProfile({
        firstName: firstName.trim(),
        preferredName: preferredName.trim(),
      });
      setSaved('Your profile has been updated.');
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? `We couldn't save your profile. ${saveError.message}`
          : "We couldn't save your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Page>
      <ScalePressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>‹  Back</Text>
      </ScalePressable>
      <Heading title="Profile" description="Your personal details for this Lumora Space." />

      <View style={styles.form}>
        <FormField
          label="Name"
          value={firstName}
          onChangeText={(value) => {
            setFirstName(value);
            setSaved('');
          }}
          placeholder="Your name"
        />
        <FormField
          label="Preferred name (optional)"
          value={preferredName}
          onChangeText={(value) => {
            setPreferredName(value);
            setSaved('');
          }}
          placeholder="What you'd like to be called"
        />

        <Card style={styles.details}>
          <ProfileDetail label="Role" value={profile.role || 'Not selected'} />
          <ProfileDetail label="Lumora Space" value={profile.spaceName || 'Not set up'} />
          {profile.illnessCategory !== 'Prefer not to say' ? (
            <ProfileDetail label="Illness category" value={profile.illnessCategory} />
          ) : null}
        </Card>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {saved ? <Text style={styles.saved}>{saved}</Text> : null}
      <ActionButton onPress={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save profile'}
      </ActionButton>
    </Page>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  const styles = useThemedStyles(baseStyles);
  const colors = useLumoraColors();
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        style={styles.input}
      />
    </View>
  );
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  const styles = useThemedStyles(baseStyles);
  return (
    <View style={styles.detail}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const baseStyles = StyleSheet.create({
  backButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#8A6A96',
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    color: '#2E2830',
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9DFE8',
    backgroundColor: '#FFFFFF',
    color: '#2E2830',
    fontFamily: Fonts.sans,
    fontSize: 15,
  },
  details: {
    padding: 16,
  },
  detail: {
    gap: 4,
  },
  value: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  error: {
    color: '#B64B58',
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
  saved: {
    color: '#4F7A62',
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
  },
});
