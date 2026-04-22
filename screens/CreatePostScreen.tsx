import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Formik, FormikHelpers } from 'formik';
import { router } from 'expo-router';
import { PenLine, ChevronDown, Check, Hash, Type, AlignLeft } from 'lucide-react-native';
import { Screen } from '../components/layout/Screen';
import { Button } from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useUserPosts } from '../context/UserPostsContext';
import { createPostSchema } from '../utils/validation';
import { spacing, radius } from '../constants/theme';
import { showToast } from '../components/ToastProvider';

const CATEGORIES = ['General', 'Tech', 'Design', 'Lifestyle', 'News', 'Discussion'] as const;

type FormValues = {
  title: string;
  body: string;
  category: string;
};

export function CreatePostScreen() {
  const { palette } = useTheme();
  const { user } = useAuth();
  const { isSubmitting, addPost } = useUserPosts();
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubmit = useCallback(
    async (values: FormValues, helpers: FormikHelpers<FormValues>) => {
      Keyboard.dismiss();
      try {
        await addPost({
          title: values.title.trim(),
          body: values.body.trim(),
          category: values.category,
        });
        helpers.resetForm();
        router.navigate('/(app)/(drawer)/feed');
      } catch {
        // error handled in context
      }
    },
    [addPost]
  );

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { backgroundColor: palette.background }]}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          >
            {/* Hero Header */}
            <View style={[styles.heroCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <View style={[styles.iconCircle, { backgroundColor: palette.primary + '18' }]}>
                <PenLine size={28} color={palette.primary} />
              </View>
              <Text style={[styles.heroTitle, { color: palette.text }]}>Create a Post</Text>
              <Text style={[styles.heroSubtitle, { color: palette.mutedText }]}>
                Share your thoughts with the community
              </Text>
              <View style={[styles.authorBadge, { backgroundColor: palette.background }]}>
                <Text style={[styles.authorText, { color: palette.mutedText }]}>
                  Posting as{' '}
                  <Text style={{ color: palette.primary, fontWeight: '700' }}>
                    {user?.displayName || user?.email || 'Anonymous'}
                  </Text>
                </Text>
              </View>
            </View>

            {/* Form */}
            <Formik<FormValues>
              initialValues={{ title: '', body: '', category: 'General' }}
              validationSchema={createPostSchema}
              validateOnChange
              onSubmit={handleSubmit}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit: formSubmit,
                setFieldValue,
                values,
                errors,
                touched,
                isValid,
                dirty,
              }) => (
                <View style={styles.formContainer}>
                  {/* Category Picker */}
                  <View style={styles.fieldGroup}>
                    <View style={styles.fieldHeader}>
                      <Hash size={16} color={palette.mutedText} />
                      <Text style={[styles.fieldLabel, { color: palette.text }]}>Category</Text>
                    </View>
                    <Pressable
                      onPress={() => setShowCategoryPicker((prev) => !prev)}
                      style={[
                        styles.categoryButton,
                        {
                          backgroundColor: palette.card,
                          borderColor: touched.category && errors.category
                            ? palette.danger
                            : palette.border,
                        },
                      ]}
                    >
                      <Text style={[styles.categoryButtonText, { color: palette.text }]}>
                        {values.category}
                      </Text>
                      <ChevronDown
                        size={18}
                        color={palette.mutedText}
                        style={{
                          transform: [{ rotate: showCategoryPicker ? '180deg' : '0deg' }],
                        }}
                      />
                    </Pressable>
                    {showCategoryPicker && (
                      <View style={[styles.categoryList, { backgroundColor: palette.card, borderColor: palette.border }]}>
                        {CATEGORIES.map((cat) => (
                          <Pressable
                            key={cat}
                            onPress={() => {
                              setFieldValue('category', cat);
                              setShowCategoryPicker(false);
                            }}
                            style={[
                              styles.categoryOption,
                              values.category === cat && {
                                backgroundColor: palette.primary + '12',
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.categoryOptionText,
                                {
                                  color:
                                    values.category === cat
                                      ? palette.primary
                                      : palette.text,
                                  fontWeight: values.category === cat ? '700' : '400',
                                },
                              ]}
                            >
                              {cat}
                            </Text>
                            {values.category === cat && (
                              <Check size={16} color={palette.primary} />
                            )}
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Title Input */}
                  <View style={styles.fieldGroup}>
                    <View style={styles.fieldHeader}>
                      <Type size={16} color={palette.mutedText} />
                      <Text style={[styles.fieldLabel, { color: palette.text }]}>Title</Text>
                      <Text style={[styles.charCount, { color: palette.mutedText }]}>
                        {values.title.length}/120
                      </Text>
                    </View>
                    <TextInput
                      value={values.title}
                      onChangeText={handleChange('title')}
                      onBlur={handleBlur('title')}
                      placeholder="Give your post a catchy title..."
                      placeholderTextColor={palette.mutedText}
                      maxLength={120}
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: palette.card,
                          color: palette.text,
                          borderColor: touched.title && errors.title
                            ? palette.danger
                            : palette.border,
                        },
                      ]}
                    />
                    {touched.title && errors.title && (
                      <Text style={[styles.errorText, { color: palette.danger }]}>{errors.title}</Text>
                    )}
                  </View>

                  {/* Body Input */}
                  <View style={styles.fieldGroup}>
                    <View style={styles.fieldHeader}>
                      <AlignLeft size={16} color={palette.mutedText} />
                      <Text style={[styles.fieldLabel, { color: palette.text }]}>Body</Text>
                      <Text style={[styles.charCount, { color: palette.mutedText }]}>
                        {values.body.length}/2000
                      </Text>
                    </View>
                    <TextInput
                      value={values.body}
                      onChangeText={handleChange('body')}
                      onBlur={handleBlur('body')}
                      placeholder="What's on your mind? Share your ideas..."
                      placeholderTextColor={palette.mutedText}
                      multiline
                      numberOfLines={6}
                      maxLength={2000}
                      textAlignVertical="top"
                      style={[
                        styles.textArea,
                        {
                          backgroundColor: palette.card,
                          color: palette.text,
                          borderColor: touched.body && errors.body
                            ? palette.danger
                            : palette.border,
                        },
                      ]}
                    />
                    {touched.body && errors.body && (
                      <Text style={[styles.errorText, { color: palette.danger }]}>{errors.body}</Text>
                    )}
                  </View>

                  {/* Submit */}
                  <Button
                    label="Publish Post"
                    onPress={() => formSubmit()}
                    disabled={!isValid || !dirty}
                    loading={isSubmitting}
                    style={styles.submitButton}
                  />
                </View>
              )}
            </Formik>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  heroCard: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    marginBottom: spacing.md,
  },
  authorBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  authorText: {
    fontSize: 13,
  },
  formContainer: {
    gap: spacing.lg,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
    flex: 1,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 2,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 2,
    fontSize: 15,
    minHeight: 140,
    lineHeight: 22,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  categoryButton: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  categoryList: {
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  categoryOptionText: {
    fontSize: 15,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});
