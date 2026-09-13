export function getAuthErrorMessage(error) {
  const code = error?.error || "";
  const message = error?.message?.toLowerCase() || "";

  switch (code) {
    case "EMAIL_ALREADY_EXISTS":
      return "Пользователь с таким email уже зарегистрирован.";

    case "INVALID_CREDENTIALS":
      return "Неверный email или пароль.";

    case "EMAIL_NOT_VERIFIED":
      return "Почта не подтверждена.";

    case "INVALID_INPUT":
      return "Проверьте введённые данные.";

    case "INVALID_OR_EXPIRED_TOKEN":
      return "Ссылка недействительна или срок её действия истёк.";

    case "UNAUTHENTICATED":
      return "Необходимо войти в аккаунт.";
  }

  if (message.includes("network")) {
    return "Нет подключения к интернету.";
  }

  if (message.includes("too many requests")) {
    return "Слишком много попыток. Попробуйте позже.";
  }

  if (message.includes("password should be at least")) {
    return "Пароль должен содержать минимум 8 символов.";
  }

  if (message.includes("invalid email")) {
    return "Введите корректный email.";
  }

  if (message.includes("new password should be different")) {
    return "Новый пароль должен отличаться от предыдущего.";
  }

  return "Произошла ошибка. Попробуйте еще раз.";
}