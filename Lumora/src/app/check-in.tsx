import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ActionButton, Card, Heading, Page } from '@/components/lumora-ui';
import { Fonts } from '@/constants/theme';
import { useLumoraColors, useThemedStyles } from '@/contexts/appearance-context';
import {
  CheckInFeelingLabels,
  getLocalDateString,
  useCheckIns,
  type CheckIn,
  type CheckInFeeling,
} from '@/contexts/check-in-context';
import { useOnboarding } from '@/contexts/onboarding-context';
import { ScalePressable } from '@/components/scale-pressable';

const feelings = Object.keys(CheckInFeelingLabels) as CheckInFeeling[];

export default function CheckInScreen() {
  const styles = useThemedStyles(baseStyles);
  const colors = useLumoraColors();
  const { profile } = useOnboarding();
  const { checkIns, isLoaded, loadError } = useCheckIns();
  const todayCheckIn = checkIns.find(
    (checkIn) =>
      checkIn.creatorId === profile.userId && checkIn.date === getLocalDateString(),
  );

  return (
    <Page>
      <ScalePressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={styles.backButton}>
        <Text style={styles.backText}>‹  Back</Text>
      </ScalePressable>
      <Heading
        title="How are you feeling today?"
        description="There's no right answer. Share only what feels comfortable."
      />
      {loadError ? <Text style={styles.error}>{loadError}</Text> : null}
      {!isLoaded ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.helper}>Loading your check-in…</Text>
        </View>
      ) : (
        <CheckInForm existing={todayCheckIn} />
      )}
    </Page>
  );
}

function CheckInForm({
  existing,
}: {
  existing?: CheckIn;
}) {
  const styles = useThemedStyles(baseStyles);
  const colors = useLumoraColors();
  const { saveTodayCheckIn } = useCheckIns();
  const [feeling, setFeeling] = useState<CheckInFeeling | null>(existing?.feeling ?? null);
  const [note, setNote] = useState(existing?.note ?? '');
  const [shared, setShared] = useState(existing?.visibility === 'shared');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!feeling) {
      setError('Choose the option that feels right for today.');
      setSaved(false);
      return;
    }

    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await saveTodayCheckIn({
        feeling,
        note: note.trim(),
        visibility: shared ? 'shared' : 'private',
      });
      setSaved(true);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? `We couldn't save your check-in. ${saveError.message}`
          : "We couldn't save your check-in. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <View style={styles.options}>
        {feelings.map((option) => (
          <ScalePressable
            key={option}
            accessibilityRole="radio"
            accessibilityState={{ checked: feeling === option }}
            onPress={() => {
              setFeeling(option);
              setError('');
              setSaved(false);
            }}
            scaleTo={0.98}
            style={[
              styles.feelingOption,
              feeling === option && styles.selectedFeelingOption,
            ]}>
            <View style={[styles.radio, feeling === option && styles.selectedRadio]}>
              {feeling === option ? <View style={styles.radioDot} /> : null}
            </View>
            <Text style={[styles.feelingText, feeling === option && styles.selectedFeelingText]}>
              {CheckInFeelingLabels[option]}
            </Text>
          </ScalePressable>
        ))}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Anything you&apos;d like your family to know? (Optional)</Text>
        <TextInput
          accessibilityLabel="Anything you'd like your family to know? (Optional)"
          value={note}
          onChangeText={(value) => {
            setNote(value);
            setSaved(false);
          }}
          placeholder="Write a note if you would like to"
          placeholderTextColor={colors.secondaryText}
          multiline
          textAlignVertical="top"
          style={styles.noteInput}
        />
      </View>

      <Card style={styles.sharingCard}>
        <View style={styles.sharingRow}>
          <View style={styles.sharingCopy}>
            <Text style={styles.sharingTitle}>Share this check-in with my Lumora Space</Text>
            <Text style={styles.helper}>
              {shared
                ? 'This check-in may appear in the Shared Family Timeline.'
                : 'This check-in is private.'}
            </Text>
          </View>
          <Switch
            accessibilityLabel="Share this check-in with my Lumora Space"
            value={shared}
            onValueChange={(value) => {
              setShared(value);
              setSaved(false);
            }}
            trackColor={{ false: colors.border, true: colors.secondary }}
            thumbColor={shared ? colors.primary : '#FFFFFF'}
          />
        </View>
        <Text style={styles.helper}>
          Sharing is applied in local app state, not database-level security.
        </Text>
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {saved ? <Text accessibilityLiveRegion="polite" style={styles.confirmation}>Your check-in has been saved.</Text> : null}
      <ActionButton onPress={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save check-in'}
      </ActionButton>
    </>
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
  options: {
    gap: 8,
  },
  feelingOption: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9DFE8',
    backgroundColor: '#FFF8F0',
  },
  selectedFeelingOption: {
    borderColor: '#8A6A96',
    backgroundColor: '#F0E7F0',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#6E6670',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadio: {
    borderColor: '#8A6A96',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8A6A96',
  },
  feelingText: {
    color: '#2E2830',
    fontFamily: Fonts.sans,
    fontSize: 15,
  },
  selectedFeelingText: {
    color: '#8A6A96',
    fontWeight: '700',
  },
  field: {
    gap: 8,
  },
  label: {
    color: '#2E2830',
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
  },
  noteInput: {
    minHeight: 112,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9DFE8',
    backgroundColor: '#FFFFFF',
    color: '#2E2830',
    fontFamily: Fonts.sans,
    fontSize: 15,
  },
  sharingCard: {
    padding: 16,
  },
  sharingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sharingCopy: {
    flex: 1,
    gap: 4,
  },
  sharingTitle: {
    color: '#2E2830',
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
  },
  helper: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
  },
  confirmation: {
    color: '#4F7A62',
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    color: '#B64B58',
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
  loading: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
  },
});
