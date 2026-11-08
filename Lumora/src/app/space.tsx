import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/lumora-ui';
import { FormField, InlineError, OnboardingStep, StepContinue } from '@/components/onboarding-ui';
import { Fonts, LumoraColors } from '@/constants/theme';
import { useThemedStyles } from '@/contexts/appearance-context';
import { useOnboarding } from '@/contexts/onboarding-context';

export default function SpaceScreen() {
  const styles = useThemedStyles(baseStyles);
  const { profile, saveProfile } = useOnboarding();
  const isPatient = profile.role === 'Patient';
  const [value, setValue] = useState(profile.spaceName);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile.role) router.replace('./role-selection');
  }, [profile.role]);

  async function submit() {
    if (!profile.role) {
      setError('Choose a role before continuing.');
      return;
    }
    if (!value.trim()) {
      setError('Enter a name for your Lumora Space.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await saveProfile({
        spaceName: value.trim(),
        completed: true,
      });
      router.replace('./home');
    } catch (saveFailure) {
      setError(
        saveFailure instanceof Error
          ? `We couldn't save your Lumora Space. ${saveFailure.message}`
          : "We couldn't save your Lumora Space. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingStep
      step={8}
      total={8}
      title={isPatient ? 'Create a Lumora Space' : 'Set up your Lumora Space'}
      description={
        isPatient
          ? 'Give your private space a name. You can choose what to share later.'
          : 'Set up your space profile. Invitations are not connected yet, so this does not add you to a shared account.'
      }
      onBack={() => router.back()}>
      <View style={styles.content}>
        <FormField
          label="Space name"
          value={value}
          onChangeText={(text) => {
            setValue(text);
            setError('');
          }}
          placeholder="A name for your space"
          autoCapitalize="words"
          autoComplete="off"
        />
        {profile.role === 'Caregiver' ? (
          <Card style={styles.roleNote}>
            <Text style={styles.roleNoteTitle}>Caregiver access</Text>
            <Text style={styles.roleNoteCopy}>
              Caregivers are invited-only and cannot create memories or invite others.
            </Text>
          </Card>
        ) : null}
        <Text style={styles.notice}>
          Your space profile is saved on this device. Invitations and shared account access are not connected yet.
        </Text>
        {error ? <InlineError>{error}</InlineError> : null}
        <StepContinue onPress={submit} disabled={saving}>
          {saving ? 'Saving…' : isPatient ? 'Create Space' : 'Continue'}
        </StepContinue>
      </View>
    </OnboardingStep>
  );
}

const baseStyles = StyleSheet.create({
  content: {
    gap: 16,
  },
  roleNote: {
    padding: 16,
  },
  roleNoteTitle: {
    color: LumoraColors.primaryText,
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  roleNoteCopy: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
  notice: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
});
