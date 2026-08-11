export function getAuthErrorMessage(error) {
  const message = error?.message?.toLowerCase() || "";

  if (message.includes("user already registered")) {
    return "Пользователь с таким email уже зарегистрирован.";
  }

  if (message.includes("invalid login credentials")) {
    return "Неверный email или пароль.";
  }

  if (message.includes("email not confirmed")) {
    return "Подтвердите электронную почту перед входом.";
  }

  if (message.includes("password should be at least")) {
    return "Пароль должен содержать минимум 6 символов.";
  }

  if (message.includes("invalid email")) {
    return "Введите корректный email.";
  }

  if (message.includes("network")) {
    return "Нет подключения к интернету.";
  }

  if (message.includes("too many requests")) {
    return "Слишком много попыток. Попробуйте позже.";
  }

  if (message.includes("new password should be different")) {
    return "Новый пароль должен отличаться от предыдущего.";
  }

  return "Произошла ошибка. Попробуйте еще раз.";
}
