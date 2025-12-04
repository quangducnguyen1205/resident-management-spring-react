import axiosInstance from './axiosConfig';

export const BIEN_DONG_TYPES = Object.freeze([
  'CHUYEN_DEN',
  'CHUYEN_DI',
  'TACH_HO',
  'NHAP_HO',
  'SINH',
  'KHAI_TU',
  'THAY_DOI_THONG_TIN',
  'TAM_TRU',
  'HUY_TAM_TRU',
  'TAM_VANG',
  'HUY_TAM_VANG'
]);

const unwrap = (promise) => promise.then((response) => response.data);

const normalizeBienDongType = (value) => {
  if (!value) {
    return BIEN_DONG_TYPES[0];
  }
  const normalized = value.toString().trim().toUpperCase();
  return BIEN_DONG_TYPES.includes(normalized) ? normalized : BIEN_DONG_TYPES[0];
};

const normalizeDateTime = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().replace('Z', '');
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      return trimmed.length === 16 ? `${trimmed}:00` : trimmed;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return `${trimmed}T00:00:00`;
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().replace('Z', '');
    }
  }

  return null;
};

const normalizeId = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const BIEN_DONG_FIELDS = ['loai', 'noiDung', 'thoiGian', 'hoKhauId', 'nhanKhauId'];

const buildBienDongPayload = (payload = {}) => {
  const sanitized = {};

  BIEN_DONG_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) {
      sanitized[field] = payload[field];
    }
  });

  if (sanitized.loai !== undefined) {
    sanitized.loai = normalizeBienDongType(sanitized.loai);
  }

  if (sanitized.noiDung && typeof sanitized.noiDung === 'string') {
    sanitized.noiDung = sanitized.noiDung.trim();
  }

  if (sanitized.thoiGian !== undefined) {
    sanitized.thoiGian = normalizeDateTime(sanitized.thoiGian);
  }

  ['hoKhauId', 'nhanKhauId'].forEach((field) => {
    if (sanitized[field] !== undefined) {
      sanitized[field] = normalizeId(sanitized[field]);
    }
  });

  return sanitized;
};

const bienDongApi = {
  getAll: (params) => unwrap(axiosInstance.get('/bien-dong', { params })),
  getById: (id) => unwrap(axiosInstance.get(`/bien-dong/${id}`)),
  create: (payload) => unwrap(axiosInstance.post('/bien-dong', buildBienDongPayload(payload))),
  update: (id, payload) => unwrap(axiosInstance.put(`/bien-dong/${id}`, buildBienDongPayload(payload))),
  delete: (id) => unwrap(axiosInstance.delete(`/bien-dong/${id}`))
};

export default bienDongApi;
