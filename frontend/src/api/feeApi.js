import axiosInstance from './axiosConfig';

const unwrap = (promise) => promise.then((response) => response.data);

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
  return Number.isNaN(parsed) ? value : parsed;
};

export const TRANG_THAI_THU_PHI = Object.freeze(['DA_NOP', 'CHUA_NOP', 'KHONG_AP_DUNG']);

const PAYMENT_FIELDS = ['hoKhauId', 'dotThuPhiId', 'ngayThu', 'ghiChu', 'trangThai'];

const normalizeStatus = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const normalized = String(value).trim().toUpperCase();
  return TRANG_THAI_THU_PHI.includes(normalized) ? normalized : undefined;
};

const buildPaymentPayload = (payload = {}) => {
  const sanitized = {};

  PAYMENT_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) {
      sanitized[field] = payload[field];
    }
  });

  if (sanitized.hoKhauId !== undefined) {
    sanitized.hoKhauId = normalizeId(sanitized.hoKhauId);
  }

  if (sanitized.dotThuPhiId !== undefined) {
    sanitized.dotThuPhiId = normalizeId(sanitized.dotThuPhiId);
  }

  if (sanitized.ngayThu !== undefined) {
    sanitized.ngayThu = normalizeDate(sanitized.ngayThu);
  }

  if (sanitized.ghiChu !== undefined && sanitized.ghiChu !== null) {
    sanitized.ghiChu = sanitized.ghiChu.trim();
  }

  if (sanitized.trangThai !== undefined) {
    const normalized = normalizeStatus(sanitized.trangThai);
    if (normalized) {
      sanitized.trangThai = normalized;
    } else {
      delete sanitized.trangThai;
    }
  }

  return sanitized;
};

const feeApi = {
  getAll: (params) => unwrap(axiosInstance.get('/thu-phi-ho-khau', { params })),
  getById: (id) => unwrap(axiosInstance.get(`/thu-phi-ho-khau/${id}`)),
  getStats: () => unwrap(axiosInstance.get('/thu-phi-ho-khau/stats')),
  getByHousehold: (hoKhauId) => unwrap(axiosInstance.get(`/thu-phi-ho-khau/ho-khau/${hoKhauId}`)),
  getByPeriod: (dotThuPhiId) => unwrap(axiosInstance.get(`/thu-phi-ho-khau/dot-thu-phi/${dotThuPhiId}`)),
  calculateFee: (hoKhauId, dotThuPhiId) =>
    unwrap(
      axiosInstance.get('/thu-phi-ho-khau/calculate', {
        params: { hoKhauId, dotThuPhiId }
      })
    ),
  getOverviewByPeriod: (dotThuPhiId) =>
    unwrap(
      axiosInstance.get('/thu-phi-ho-khau/overview', {
        params: { dotThuPhiId }
      })
    ),
  create: (payload) => unwrap(axiosInstance.post('/thu-phi-ho-khau', buildPaymentPayload(payload))),
  update: (id, payload) => unwrap(axiosInstance.put(`/thu-phi-ho-khau/${id}`, buildPaymentPayload(payload))),
  delete: (id) => unwrap(axiosInstance.delete(`/thu-phi-ho-khau/${id}`))
};

export default feeApi;
