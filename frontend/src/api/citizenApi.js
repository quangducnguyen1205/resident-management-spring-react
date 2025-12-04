import axiosInstance from './axiosConfig';

const unwrap = (promise) => promise.then((response) => response.data);

const CITIZEN_MUTABLE_FIELDS = [
  'hoKhauId',
  'hoTen',
  'ngaySinh',
  'gioiTinh',
  'danToc',
  'quocTich',
  'ngheNghiep',
  'cmndCccd',
  'ngayCap',
  'noiCap',
  'quanHeChuHo',
  'ghiChu'
];

const DATE_FIELDS = ['ngaySinh', 'ngayCap'];

const trimToNull = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
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

const normalizeId = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const buildCitizenPayload = (payload = {}) => {
  const sanitized = {};

  CITIZEN_MUTABLE_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) {
      sanitized[field] = payload[field];
    }
  });

  if (sanitized.hoKhauId !== undefined) {
    sanitized.hoKhauId = normalizeId(sanitized.hoKhauId);
  }

  DATE_FIELDS.forEach((field) => {
    if (sanitized[field] !== undefined) {
      sanitized[field] = normalizeDate(sanitized[field]);
    }
  });

  Object.keys(sanitized).forEach((field) => {
    if (typeof sanitized[field] === 'string') {
      sanitized[field] = sanitized[field].trim();
    }
  });

  ['danToc', 'quocTich', 'ngheNghiep', 'cmndCccd', 'noiCap', 'quanHeChuHo', 'ghiChu'].forEach((field) => {
    if (sanitized[field] !== undefined) {
      sanitized[field] = trimToNull(sanitized[field]);
    }
  });

  return sanitized;
};

export const buildTemporaryChangePayload = (payload = {}) => {
  const normalized = {
    ngayBatDau: normalizeDate(payload.ngayBatDau),
    ngayKetThuc: normalizeDate(payload.ngayKetThuc),
    lyDo: trimToNull(payload.lyDo)
  };

  if (!normalized.ngayBatDau || !normalized.ngayKetThuc || !normalized.lyDo) {
    throw new Error('Vui lòng cung cấp đầy đủ ngày bắt đầu, ngày kết thúc và lý do.');
  }

  return normalized;
};

export const buildKhaiTuPayload = (payload = {}) => {
  const lyDo = trimToNull(payload.lyDo);
  if (!lyDo) {
    throw new Error('Vui lòng nhập lý do khai tử hợp lệ.');
  }
  return { lyDo };
};

const citizenApi = {
  getAll: (params) => unwrap(axiosInstance.get('/nhan-khau', { params })),
  getById: (id) => unwrap(axiosInstance.get(`/nhan-khau/${id}`)),
  create: (data) => unwrap(axiosInstance.post('/nhan-khau', buildCitizenPayload(data))),
  update: (id, data) => unwrap(axiosInstance.put(`/nhan-khau/${id}`, buildCitizenPayload(data))),
  delete: (id) => unwrap(axiosInstance.delete(`/nhan-khau/${id}`)),

  search: (params) => unwrap(axiosInstance.get('/nhan-khau/search', { params })),
  getGenderStats: () => unwrap(axiosInstance.get('/nhan-khau/stats/gender')),
  getAgeStats: (params) => unwrap(axiosInstance.get('/nhan-khau/stats/age', { params })),

  updateTamVang: (id, data) => unwrap(axiosInstance.put(`/nhan-khau/${id}/tamvang`, buildTemporaryChangePayload(data))),
  deleteTamVang: (id) => unwrap(axiosInstance.delete(`/nhan-khau/${id}/tamvang`)),

  updateTamTru: (id, data) => unwrap(axiosInstance.put(`/nhan-khau/${id}/tamtru`, buildTemporaryChangePayload(data))),
  deleteTamTru: (id) => unwrap(axiosInstance.delete(`/nhan-khau/${id}/tamtru`)),

  updateKhaiTu: (id, data) => unwrap(axiosInstance.put(`/nhan-khau/${id}/khaitu`, buildKhaiTuPayload(data)))
};

export default citizenApi;