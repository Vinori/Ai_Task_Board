import type { Locale } from "@/store/uiStore";

export type NavCopy = {
  features: string;
  howItWorks: string;
  overview: string;
  pricing: string;
  tryFree: string;
  signIn: string;
  signUp: string;
  signInTitle: string;
  signUpTitle: string;
  email: string;
  password: string;
  confirmPassword: string;
  /** Optional profile fields shown only on sign-up */
  authRoleLabel: string;
  authRolePlaceholder: string;
  authSkillsLabel: string;
  authSkillsPlaceholder: string;
  authSkillsHint: string;
  errorRoleTooLong: string;
  errorSkillsTooLong: string;
  submitSignIn: string;
  submitSignUp: string;
  switchToSignUp: string;
  switchToSignIn: string;
  configMissing: string;
  passwordMismatch: string;
  authSubtitleSignIn: string;
  authSubtitleSignUp: string;
  loading: string;
  modalClose: string;
  errorInvalidEmail: string;
  errorEmailNotConfirmed: string;
  errorUserNotFound: string;
  errorWrongPassword: string;
  errorEmailInUse: string;
  errorWeakPassword: string;
  errorNetwork: string;
  errorGeneric: string;
  navMenu: string;
  navMenuAria: string;
  primaryNavAria: string;
  continueWithGoogle: string;
  authDividerOr: string;
  signUpCheckEmail: string;
  /** Use `{{email}}` placeholder — replaced client-side */
  dashboardWelcomeEmail: string;
  dashboardSubtitleLoggedIn: string;
  goToBoard: string;
  signOut: string;
  userMenuAria: string;
  accountSettings: string;
  userSettingsTitle: string;
  userSettingsSubtitle: string;
  profileNameLabel: string;
  profileNamePlaceholder: string;
  profileAboutLabel: string;
  profileAboutPlaceholder: string;
  emailReadOnlyHint: string;
  saveProfile: string;
  savingProfile: string;
  errorDisplayNameTooLong: string;
  errorAboutTooLong: string;
  profileUpdateError: string;
  profileSaved: string;
};

export const navCopy: Record<Locale, NavCopy> = {
  ru: {
    features: "Возможности",
    howItWorks: "Как это работает",
    overview: "Обзор",
    pricing: "Тарифы",
    tryFree: "Попробовать бесплатно",
    signIn: "Войти",
    signUp: "Регистрация",
    signInTitle: "Вход",
    signUpTitle: "Регистрация",
    email: "Email",
    password: "Пароль",
    confirmPassword: "Подтвердите пароль",
    authRoleLabel: "Роль (необязательно)",
    authRolePlaceholder: "Например: разработчик, PM, дизайнер…",
    authSkillsLabel: "Навыки и опыт (необязательно)",
    authSkillsPlaceholder:
      "Кратко опишите стек, компетенции или интересы для будущего распределения задач.",
    authSkillsHint:
      "Можно указать позже. Эти данные помогут подбирать исполнителей по задачам.",
    errorRoleTooLong: "Поле «Роль» слишком длинное — сократите текст",
    errorSkillsTooLong: "Описание навыков слишком длинное — сократите текст",
    submitSignIn: "Войти",
    submitSignUp: "Создать аккаунт",
    switchToSignUp: "Нет аккаунта? Зарегистрироваться",
    switchToSignIn: "Уже есть аккаунт? Войти",
    configMissing:
      "Задайте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в файле .env.",
    passwordMismatch: "Пароли не совпадают",
    authSubtitleSignIn: "Войдите, чтобы продолжить работу с досками.",
    authSubtitleSignUp: "Оформите аккаунт — это займёт пару секунд.",
    loading: "Загрузка…",
    modalClose: "Закрыть",
    errorInvalidEmail: "Некорректный email",
    errorEmailNotConfirmed:
      "Подтвердите адрес почты по ссылке из письма перед входом",
    errorUserNotFound: "Пользователь не найден",
    errorWrongPassword: "Неверный пароль",
    errorEmailInUse: "Этот email уже занят",
    errorWeakPassword: "Слишком слабый пароль",
    errorNetwork: "Ошибка сети. Проверьте подключение",
    errorGeneric: "Не удалось выполнить операцию. Попробуйте снова",
    navMenu: "Меню",
    navMenuAria: "Открыть меню разделов",
    primaryNavAria: "Разделы сайта",
    continueWithGoogle: "Продолжить с Google",
    authDividerOr: "или",
    signUpCheckEmail:
      "Аккаунт создан — проверьте почту и перейдите по ссылке из письма для подтверждения, затем войдите.",
    dashboardWelcomeEmail: "Добро пожаловать, {{email}}",
    dashboardSubtitleLoggedIn:
      "Вы вошли в аккаунт — можно работать с доской задач ниже или на главной.",
    goToBoard: "К доске",
    signOut: "Выйти",
    userMenuAria: "Меню пользователя",
    accountSettings: "Настройки профиля",
    userSettingsTitle: "Настройки профиля",
    userSettingsSubtitle:
      "Имя, роль и описание сохраняются в вашем профиле и видны участникам досок.",
    profileNameLabel: "Имя в профиле",
    profileNamePlaceholder: "Как вас показывать на доске",
    profileAboutLabel: "О себе",
    profileAboutPlaceholder:
      "Несколько слов о вас — опционально, до {{max}} символов.",
    emailReadOnlyHint: "Почту здесь нельзя изменить",
    saveProfile: "Сохранить",
    savingProfile: "Сохранение…",
    errorDisplayNameTooLong: "Имя слишком длинное — сократите текст",
    errorAboutTooLong: "Описание слишком длинное — сократите текст",
    profileUpdateError: "Не удалось сохранить профиль. Попробуйте снова",
    profileSaved: "Изменения сохранены",
  },
  en: {
    features: "Features",
    howItWorks: "How it works",
    overview: "Overview",
    pricing: "Pricing",
    tryFree: "Try for free",
    signIn: "Sign in",
    signUp: "Sign up",
    signInTitle: "Sign in",
    signUpTitle: "Sign up",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    authRoleLabel: "Role (optional)",
    authRolePlaceholder: "e.g. developer, PM, designer…",
    authSkillsLabel: "Skills & experience (optional)",
    authSkillsPlaceholder:
      "Briefly describe your stack, strengths, or interests for future task matching.",
    authSkillsHint:
      "You can fill this in later. We’ll use it to suggest assignees for tasks.",
    errorRoleTooLong: "Role text is too long — please shorten it",
    errorSkillsTooLong: "Skills description is too long — please shorten it",
    submitSignIn: "Sign in",
    submitSignUp: "Create account",
    switchToSignUp: "No account? Sign up",
    switchToSignIn: "Already have an account? Sign in",
    configMissing:
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.",
    passwordMismatch: "Passwords do not match",
    authSubtitleSignIn: "Sign in to keep working on your boards.",
    authSubtitleSignUp: "Create an account — it only takes a moment.",
    loading: "Loading…",
    modalClose: "Close",
    errorInvalidEmail: "Invalid email address",
    errorEmailNotConfirmed:
      "Confirm your email via the link we sent before signing in",
    errorUserNotFound: "User not found",
    errorWrongPassword: "Wrong password",
    errorEmailInUse: "This email is already in use",
    errorWeakPassword: "Password is too weak",
    errorNetwork: "Network error. Check your connection",
    errorGeneric: "Something went wrong. Please try again",
    navMenu: "Menu",
    navMenuAria: "Open site sections menu",
    primaryNavAria: "Site sections",
    continueWithGoogle: "Continue with Google",
    authDividerOr: "or",
    signUpCheckEmail:
      "Check your inbox and confirm your email via the link, then sign in.",
    dashboardWelcomeEmail: "Welcome, {{email}}",
    dashboardSubtitleLoggedIn:
      "You're signed in — work with your task board below or from the home page.",
    goToBoard: "Go to board",
    signOut: "Sign out",
    userMenuAria: "User menu",
    accountSettings: "Profile settings",
    userSettingsTitle: "Profile settings",
    userSettingsSubtitle:
      "Your name, role, and bio are stored on your profile and visible to board members.",
    profileNameLabel: "Display name",
    profileNamePlaceholder: "How you appear on boards",
    profileAboutLabel: "About you",
    profileAboutPlaceholder:
      "A few words about yourself — optional, up to {{max}} characters.",
    emailReadOnlyHint: "Email can’t be changed here",
    saveProfile: "Save",
    savingProfile: "Saving…",
    errorDisplayNameTooLong: "Display name is too long — please shorten it",
    errorAboutTooLong: "About text is too long — please shorten it",
    profileUpdateError: "Could not save profile. Please try again",
    profileSaved: "Your changes were saved",
  },
};
