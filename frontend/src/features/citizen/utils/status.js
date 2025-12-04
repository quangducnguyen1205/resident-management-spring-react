const toDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isWithinRange = (start, end, now) => {
  const startDate = toDate(start);
  if (!startDate || startDate > now) return false;
  const endDate = toDate(end);
  return !endDate || endDate >= now;
};

export const deriveCitizenStatus = (citizen) => {
  if (!citizen) return 'THUONG_TRU';
  const now = new Date();
  const note = (citizen.ghiChu || '').toLowerCase();

  if (note.includes('đã mất') || note.includes('da mat')) {
    return 'DA_KHAI_TU';
  }

  if (isWithinRange(citizen.tamVangTu, citizen.tamVangDen, now)) {
    return 'TAM_VANG';
  }

  if (isWithinRange(citizen.tamTruTu, citizen.tamTruDen, now)) {
    return 'TAM_TRU';
  }

  return citizen.trangThaiHienTai || 'THUONG_TRU';
};
