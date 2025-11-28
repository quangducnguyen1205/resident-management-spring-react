import axiosInstance from './axiosConfig';

const unwrap = (promise) => promise.then((response) => response.data);

export const LOAI_THU_PHI = Object.freeze(['BAT_BUOC', 'TU_NGUYEN']);

const normalizeLoai = (value, { partial } = {}) => {
  if (value === undefined || value === null) {
    return partial ? undefined : LOAI_THU_PHI[0];
  }
  const normalized = value.toString().trim().toUpperCase();
  return LOAI_THU_PHI.includes(normalized) ? normalized : LOAI_THU_PHI[0];
};

const normalizeDate = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  }
  return null;
};

const normalizeMoney = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const numeric = Number(value);
  return Number.isNaN(numeric) ? undefined : numeric;
};

const DOT_FIELDS = ['tenDot', 'loai', 'ngayBatDau', 'ngayKetThuc', 'dinhMuc'];

const buildDotThuPhiPayload = (payload = {}, { partial = false } = {}) => {
  const sanitized = {};

  DOT_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) {
      sanitized[field] = payload[field];
    }
  });

  if (sanitized.tenDot && typeof sanitized.tenDot === 'string') {
    sanitized.tenDot = sanitized.tenDot.trim();
  }

  if (sanitized.loai !== undefined || !partial) {
    sanitized.loai = normalizeLoai(sanitized.loai, { partial });
  }

  ['ngayBatDau', 'ngayKetThuc'].forEach((field) => {
    if (sanitized[field] !== undefined) {
      sanitized[field] = normalizeDate(sanitized[field]);
    }
  });

  if (sanitized.dinhMuc !== undefined) {
    sanitized.dinhMuc = normalizeMoney(sanitized.dinhMuc);
  }

  if (!partial && sanitized.loai === 'TU_NGUYEN' && sanitized.dinhMuc === undefined) {
    sanitized.dinhMuc = 0;
  }

  return sanitized;
};

const dotThuPhiApi = {
  getAll: (params) => unwrap(axiosInstance.get('/dot-thu-phi', { params })),
  getById: (id) => unwrap(axiosInstance.get(`/dot-thu-phi/${id}`)),
  create: (payload) => unwrap(axiosInstance.post('/dot-thu-phi', buildDotThuPhiPayload(payload))),
  update: (id, payload) => unwrap(axiosInstance.put(`/dot-thu-phi/${id}`, buildDotThuPhiPayload(payload, { partial: true }))),
  delete: (id) => unwrap(axiosInstance.delete(`/dot-thu-phi/${id}`))
};

export default dotThuPhiApi;
