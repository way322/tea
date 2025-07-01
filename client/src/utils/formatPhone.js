export const formatPhone = (value) => {
  if (!value) return value; // Возвращаем исходное значение, если оно пустое
  
  // Удаляем все нецифровые символы
  const digitsOnly = value.replace(/\D/g, '');
  
  // Разбиваем номер на части согласно стандартному формату
  const countryCode = digitsOnly.slice(0, 1); // Код страны (7 для России)
  const areaCode = digitsOnly.slice(1, 4);    // Код региона/оператора
  const firstPart = digitsOnly.slice(4, 7);   // Первая часть номера
  const secondPart = digitsOnly.slice(7, 9);   // Вторая часть номера
  const thirdPart = digitsOnly.slice(9, 11);   // Третья часть номера

  // Постепенно собираем номер по мере ввода
  if (digitsOnly.length < 2) return `+${countryCode}`;
  if (digitsOnly.length < 5) return `+${countryCode} ${areaCode}`;
  if (digitsOnly.length < 8) return `+${countryCode} ${areaCode} ${firstPart}`;
  if (digitsOnly.length < 10) return `+${countryCode} ${areaCode} ${firstPart} ${secondPart}`;
  
  // Полный формат номера
  return `+${countryCode} ${areaCode} ${firstPart} ${secondPart} ${thirdPart}`;
};