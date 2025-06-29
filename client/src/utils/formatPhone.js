export const formatPhone = (value) => {
  if (!value) return value;
  
  const phoneNumber = value.replace(/\D/g, '');
  const phoneLength = phoneNumber.length;
  
  if (phoneLength < 1) return '';
  if (phoneLength < 2) return `+${phoneNumber}`;
  if (phoneLength < 5) return `+${phoneNumber.slice(0,1)} ${phoneNumber.slice(1)}`;
  if (phoneLength < 8) return `+${phoneNumber.slice(0,1)} ${phoneNumber.slice(1,4)} ${phoneNumber.slice(4)}`;
  if (phoneLength < 10) return `+${phoneNumber.slice(0,1)} ${phoneNumber.slice(1,4)} ${phoneNumber.slice(4,7)} ${phoneNumber.slice(7)}`;
  
  return `+${phoneNumber.slice(0,1)} ${phoneNumber.slice(1,4)} ${phoneNumber.slice(4,7)} ${phoneNumber.slice(7,9)} ${phoneNumber.slice(9,11)}`;
};