import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/lumora-ui';
import { FormField, InlineError, OnboardingStep, StepContinue } from '@/components/onboarding-ui';
import { Fonts, LumoraColors } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboarding-context';

export default function SpaceScreen() {
  const { profile, saveProfile } = useOnboarding();
  const isPatient = profile.role === 'Patient';
  const [value, setValue] = useState(isPatient ? profile.spaceName : '');
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
      setError(isPatient ? 'Enter a name for your Lumora Space.' : 'Enter an invite code.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await saveProfile({
        spaceName: isPatient ? value.trim() : 'Lumora Space',
        completed: true,
      });
      router.replace('./home');
    } catch (saveFailure) {
      setError(
        saveFailure instanceof Error
          ? `We couldn't save your demo space. ${saveFailure.message}`
          : "We couldn't save your demo space. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingStep
      step={8}
      total={8}
      title={isPatient ? 'Create a Lumora Space' : 'Join a Lumora Space'}
      description={
        isPatient
          ? 'Your space belongs to you. You control who is invited.'
          : 'Enter the invite code shared with you to preview joining a private space.'
      }
      onBack={() => router.back()}>
      <View style={styles.content}>
        <FormField
          label={isPatient ? 'Space name' : 'Invite code'}
          value={value}
          onChangeText={(text) => {
            setValue(text);
            setError('');
          }}
          placeholder={isPatient ? 'A name for your space' : 'Enter your invite code'}
          autoCapitalize={isPatient ? 'words' : 'characters'}
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
        <Text style={styles.demoNote}>
          Demo only. This does not create a real space or validate an invitation.
        </Text>
        {error ? <InlineError>{error}</InlineError> : null}
        <StepContinue onPress={submit} disabled={saving}>
          {saving ? 'Saving…' : isPatient ? 'Create Space' : 'Join Space'}
        </StepContinue>
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
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
  demoNote: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
});
