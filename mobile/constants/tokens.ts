export const colors = {
  background:   '#141115',
  surface1:     '#1E1B1F',
  surface2:     '#2A272C',
  card:         '#1A1719',
  border:       '#3A373C',
  accent:       '#C8F04D',
  textPrimary:  '#FFFFFF',
  textMuted:    '#6B6870',
  textDisabled: '#A09EA3',
  error:        '#FF4D4D',
} as const;

export const fonts = {
  heading:  'Inter_700Bold',
  headingM: 'Inter_600SemiBold',
  body:     'DMSans_400Regular',
  bodyMed:  'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
} as const;

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

export const radius = {
  sm: 4,   // calc(var(--radius) - 4px)
  md: 6,   // calc(var(--radius) - 2px)
  lg: 8,   // var(--radius) = 0.5rem
  xl: 16,
} as const;

export const commonStyles = {
  // ── Screen layout ─────────────────────────────────────────
  screen:        { flex: 1, backgroundColor: colors.background },
  // Note: prefer useSafeAreaInsets().bottom + 20 over this static value in screens
  // that sit behind the tab bar or have dynamic bottom insets.
  screenContent: { paddingBottom: 60 },
  centered:      { flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const, backgroundColor: colors.background },

  // ── Tab page header (Home / Record / Account — no back button) ──
  pageHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: 60,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageHeaderTitle: {
    fontSize: 13,
    fontFamily: fonts.heading,
    color: colors.textPrimary,
    letterSpacing: -0.1,
  },

  // ── Sub-screen nav header (with back button) ──────────────
  navHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: spacing.md,
    paddingTop: 60,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navHeaderSpacer: { width: 44, height: 44, justifyContent: 'center' as const },
  navBackIcon:     { fontSize: 28, color: colors.textPrimary, fontFamily: fonts.body, lineHeight: 32 },
  navHeaderTitle:  { fontSize: 16, fontFamily: fonts.heading, color: colors.textPrimary },

  // ── Typography ────────────────────────────────────────────
  sectionLabel: {
    fontSize: 10,
    fontFamily: fonts.headingM,
    color: colors.accent,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
  },
  textBody:    { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, lineHeight: 20 },
  textCaption: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted },
  textSuccess: { fontSize: 12, fontFamily: fonts.body, color: colors.accent },
  textError:   { fontSize: 12, fontFamily: fonts.body, color: colors.error },

  // ── UI elements ───────────────────────────────────────────
  divider:       { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  formContainer: { padding: spacing.md, gap: spacing.lg },
  pillsRow:      { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 },

  // ── Auth screens (login / signup steps) ───────────────────
  authScreen: {
    flexGrow: 1,
    justifyContent: 'center' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  authWordmark: {
    fontSize: 24,
    fontFamily: fonts.heading,
    color: colors.accent,
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
  authTagline: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textMuted,
  },
  authHeader: { marginBottom: spacing.xxl },
  authForm:   { gap: 20 },
  authField:  { gap: 6 },
  authInput: {
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.textPrimary,
  },
  authButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center' as const,
    marginTop: spacing.sm,
  },
  authButtonDisabled: { opacity: 0.6 },
  authButtonText: {
    fontSize: 13,
    fontFamily: fonts.heading,
    color: colors.background,
    letterSpacing: 2,
  },
  authLink: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: 'center' as const,
    marginTop: spacing.sm,
  },
  authLinkAccent: {
    color: colors.accent,
    fontFamily: fonts.bodyMed,
  },
  authHint: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textDisabled,
  },
};
