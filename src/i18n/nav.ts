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
  },
};
