import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { ActionButton, Card, Heading, Page } from '@/components/lumora-ui';
import { ScalePressable } from '@/components/scale-pressable';
import { Fonts, LumoraColors } from '@/constants/theme';
import { useLumoraColors, useThemedStyles } from '@/contexts/appearance-context';
import {
  useMemories,
  type Memory,
  type MemoryInput,
  type MemoryVisibility,
} from '@/contexts/memory-context';
import { useOnboarding } from '@/contexts/onboarding-context';

const occasions = ['Birthday', 'Family moment', 'Milestone', 'Just because', 'Other'];

function todayAsInputDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  error?: string;
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
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.multiline, error ? styles.inputError : null]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export default function CreateMemoryScreen() {
  const styles = useThemedStyles(baseStyles);
  const colors = useLumoraColors();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { profile } = useOnboarding();
  const { memories, isLoaded, loadError } = useMemories();
  const existing = memories.find((memory) => memory.id === id);
  const canEdit = existing?.creatorId === profile.userId;

  return (
    <Page>
      <ScalePressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={styles.backButton}>
        <Text style={styles.backText}>‹  Back</Text>
      </ScalePressable>
      <Heading
        title={id ? 'Edit memory' : 'Create a memory'}
        description="Keep the details that make this moment meaningful."
      />

      {loadError ? <Text style={styles.error}>{loadError}</Text> : null}
      {!isLoaded ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.helper}>Loading your memories…</Text>
        </View>
      ) : id && !existing ? (
        <Card>
          <Text style={styles.error}>This memory could not be found.</Text>
          <ActionButton secondary onPress={() => router.back()}>Go back</ActionButton>
        </Card>
      ) : id && !canEdit ? (
        <Card>
          <Text style={styles.error}>This memory is not available in your Lightbook.</Text>
          <ActionButton secondary onPress={() => router.replace('/lightbook')}>Return to Lightbook</ActionButton>
        </Card>
      ) : (
        <MemoryForm existing={existing} isEditing={Boolean(id)} />
      )}
    </Page>
  );
}

function MemoryForm({
  existing,
  isEditing,
}: {
  existing?: Memory;
  isEditing: boolean;
}) {
  const styles = useThemedStyles(baseStyles);
  const colors = useLumoraColors();
  const { profile } = useOnboarding();
  const { createMemory, updateMemory } = useMemories();
  const [titleValue, setTitleValue] = useState(existing?.title ?? '');
  const [caption, setCaption] = useState(existing?.caption ?? '');
  const [imageUri, setImageUri] = useState<string | null>(existing?.imageUri ?? null);
  const [occasion, setOccasion] = useState(existing?.occasion ?? '');
  const [date, setDate] = useState(existing?.date ?? todayAsInputDate());
  const [location, setLocation] = useState(existing?.location ?? '');
  const [visibility, setVisibility] = useState<MemoryVisibility | null>(existing?.visibility ?? null);
  const [titleError, setTitleError] = useState('');
  const [dateError, setDateError] = useState('');
  const [formError, setFormError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [selectingImage, setSelectingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  async function choosePhoto() {
    setPhotoError('');
    setSelectingImage(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setPhotoError('Allow photo library access to add a picture to this memory.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
    } catch (pickerError) {
      setPhotoError(
        pickerError instanceof Error
          ? `We couldn't open your photos. ${pickerError.message}`
          : "We couldn't open your photos. Please try again.",
      );
    } finally {
      setSelectingImage(false);
    }
  }

  async function save() {
    const trimmedTitle = titleValue.trim();
    setTitleError(trimmedTitle ? '' : 'A title is required.');
    setDateError(isValidDate(date) ? '' : 'Enter a valid date in YYYY-MM-DD format.');
    setFormError('');
    if (!trimmedTitle || !isValidDate(date) || !visibility) {
      if (!visibility) setFormError('Choose whether this memory is Private or Shared.');
      return;
    }
    if (!isEditing && profile.role === 'Caregiver') {
      setFormError('Caregiver access is invited-only. Memory creation is not available for this role.');
      return;
    }

    const input: MemoryInput = {
      title: trimmedTitle,
      caption: caption.trim(),
      imageUri,
      occasion,
      date,
      location: location.trim(),
      visibility,
    };

    setSaving(true);
    try {
      if (existing) await updateMemory(existing.id, input);
      else await createMemory(input);
      router.back();
    } catch (saveError) {
      setFormError(
        saveError instanceof Error
          ? `We couldn't save this memory. ${saveError.message}`
          : "We couldn't save this memory. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Photo</Text>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photoPreview} resizeMode="cover" />
          ) : null}
          <ActionButton secondary onPress={choosePhoto} disabled={selectingImage}>
            {selectingImage ? 'Opening photos…' : imageUri ? 'Change photo' : 'Choose a photo'}
          </ActionButton>
          {selectingImage ?           <ActivityIndicator color={colors.primary} /> : null}
          {photoError ? <Text style={styles.error}>{photoError}</Text> : null}
        </View>

        <FormField
          label="Title (required)"
          value={titleValue}
          onChangeText={(value) => {
            setTitleValue(value);
            if (value.trim()) setTitleError('');
          }}
          placeholder="A name for this moment"
          error={titleError}
        />
        <FormField
          label="Caption or message (optional)"
          value={caption}
          onChangeText={setCaption}
          placeholder="What would you like to remember?"
          multiline
        />

        <View style={styles.field}>
          <Text style={styles.label}>Occasion (optional)</Text>
          <View style={styles.options}>
            {occasions.map((option) => (
              <ChoiceButton
                key={option}
                label={option}
                selected={occasion === option}
                onPress={() => setOccasion(occasion === option ? '' : option)}
              />
            ))}
          </View>
        </View>

        <FormField
          label="Date"
          value={date}
          onChangeText={(value) => {
            setDate(value);
            if (isValidDate(value)) setDateError('');
          }}
          placeholder="YYYY-MM-DD"
          error={dateError}
        />
        <Text style={styles.helper}>Enter the date as year-month-day. Today is pre-filled.</Text>

        <FormField
          label="Location (optional)"
          value={location}
          onChangeText={setLocation}
          placeholder="Where did it happen?"
        />

        <View style={styles.field}>
          <Text style={styles.label}>Privacy (required)</Text>
          <View style={styles.visibilityOptions}>
            <VisibilityChoice
              title="Private"
              description="Private memories can only be viewed by you."
              selected={visibility === 'private'}
              onPress={() => {
                setVisibility('private');
                setFormError('');
              }}
            />
            <VisibilityChoice
              title="Shared"
              description="Shared memories can appear in your Shared Family Timeline."
              selected={visibility === 'shared'}
              onPress={() => {
                setVisibility('shared');
                setFormError('');
              }}
            />
          </View>
          <Text style={styles.helper}>
            Sharing is applied in local app state, not database-level security.
          </Text>
        </View>
      </View>

      {formError ? <Text style={styles.error}>{formError}</Text> : null}
      <ActionButton onPress={save} disabled={saving || selectingImage}>
        {saving ? 'Saving…' : 'Save memory'}
      </ActionButton>
    </>
  );
}

function ChoiceButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const styles = useThemedStyles(baseStyles);
  return (
    <ScalePressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      scaleTo={0.98}
      style={[styles.chip, selected && styles.selectedChip]}>
      <Text style={[styles.chipText, selected && styles.selectedChipText]}>{label}</Text>
    </ScalePressable>
  );
}

function VisibilityChoice({
  title,
  description,
  selected,
  onPress,
}: {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  const styles = useThemedStyles(baseStyles);
  return (
    <ScalePressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      scaleTo={0.98}
      style={[styles.visibilityCard, selected && styles.selectedVisibilityCard]}>
      <View style={[styles.radio, selected && styles.selectedRadio]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <View style={styles.visibilityCopy}>
        <Text style={styles.visibilityTitle}>{title}</Text>
        <Text style={styles.helper}>{description}</Text>
      </View>
    </ScalePressable>
  );
}

const baseStyles = StyleSheet.create({
  backButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  backText: {
    color: LumoraColors.primary,
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    color: LumoraColors.primaryText,
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LumoraColors.border,
    backgroundColor: '#FFFFFF',
    color: LumoraColors.primaryText,
    fontFamily: Fonts.sans,
    fontSize: 15,
  },
  multiline: {
    minHeight: 104,
    paddingTop: 12,
  },
  inputError: {
    borderColor: LumoraColors.error,
  },
  photoPreview: {
    width: '100%',
    height: 210,
    borderRadius: 12,
    backgroundColor: LumoraColors.softSurface,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: LumoraColors.border,
    backgroundColor: LumoraColors.warmSurface,
  },
  selectedChip: {
    backgroundColor: '#F0E7F0',
    borderColor: LumoraColors.primary,
  },
  chipText: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  selectedChipText: {
    color: LumoraColors.primary,
    fontWeight: '700',
  },
  visibilityOptions: {
    gap: 8,
  },
  visibilityCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: LumoraColors.border,
    borderRadius: 12,
    backgroundColor: LumoraColors.warmSurface,
  },
  selectedVisibilityCard: {
    borderColor: LumoraColors.primary,
    backgroundColor: '#F0E7F0',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: LumoraColors.secondaryText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadio: {
    borderColor: LumoraColors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: LumoraColors.primary,
  },
  visibilityCopy: {
    flex: 1,
    gap: 4,
  },
  visibilityTitle: {
    color: LumoraColors.primaryText,
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  helper: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
  },
  error: {
    color: LumoraColors.error,
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
