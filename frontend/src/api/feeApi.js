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

const PAYMENT_FIELDS = ['hoKhauId', 'dotThuPhiId', 'ngayThu', 'ghiChu', 'tongPhi'];

const normalizeCurrency = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'number' && !Number.isNaN(value)) {
    return Math.round(value * 100) / 100;
  }

  const cleaned = String(value).replace(/[^0-9.,-]/g, '').replace(/,/g, '.').trim();
  if (!cleaned) {
    return undefined;
  }

  const parsed = Number.parseFloat(cleaned);
  if (Number.isNaN(parsed)) {
    return undefined;
  }

  return Math.round(parsed * 100) / 100;
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

  if (sanitized.tongPhi !== undefined) {
    const amount = normalizeCurrency(sanitized.tongPhi);
    if (amount === undefined) {
      delete sanitized.tongPhi;
    } else {
      sanitized.tongPhi = amount;
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
