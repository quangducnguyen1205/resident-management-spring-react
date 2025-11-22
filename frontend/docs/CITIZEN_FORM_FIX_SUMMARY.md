# Citizen Form 400 Error Fix - Complete Implementation Guide

## Problem Statement

The citizen form was returning a `400 Bad Request` error when submitting data to the backend API. The backend validation errors indicated that all required fields were empty:

```json
{
  "hoKhauId": "ID hộ khẩu không được để trống",
  "ngaySinh": "Ngày sinh không được để trống",
  "gioiTinh": "Giới tính không được để trống",
  "hoTen": "Họ tên không được để trống"
}
```

## Root Causes Identified

1. **Missing Required Field**: `hoKhauId` (household ID) was not part of the citizen form but is required by the backend for creating citizen records
2. **Data Type Mismatch**: HTML select fields return string values, but backend expects `hoKhauId` as a number
3. **Missing Data Loading**: Household list was not being loaded from the API to populate the dropdown
4. **Field Name Inconsistency**: Form was checking for non-existent field names (e.g., `tenChuHo` instead of `chuHo`)

## Solution Implementation

### 1. Updated CitizenDetail.jsx

**Changes:**
- Added import for `householdApi`
- Added state: `householdOptions` to store household list
- Created `fetchHouseholds()` function to load households from `/api/ho-khau`
- Transform household objects to options format: `{ value: h.id, label: h.chuHo }`
- Call `fetchHouseholds()` in useEffect on component mount
- Pass `householdOptions` prop to `CitizenForm`

**Code:**
```jsx
import householdApi from '../../../api/householdApi';

const [householdOptions, setHouseholdOptions] = useState([]);

const fetchHouseholds = async () => {
  try {
    const response = await householdApi.getAll();
    const households = Array.isArray(response.data) ? response.data : response.data?.data || [];
    // Transform thành options format - using chuHo (household head name) as label
    const options = households.map(h => ({
      value: h.id,
      label: h.chuHo || `Hộ ${h.maHoKhau || h.id}`
    }));
    setHouseholdOptions(options);
    console.log('Loaded household options:', options);
  } catch (err) {
    console.error('Lỗi tải danh sách hộ khẩu:', err);
  }
};

<CitizenForm 
  initialValues={citizen}
  onSubmit={handleSubmit}
  householdOptions={householdOptions}
/>
```

### 2. Updated CitizenForm.jsx

**Changes:**
- Added `hoKhauId` to Yup validation schema with `typeError` to handle string-to-number conversion
- Added `householdOptions = []` parameter to component signature
- Added hoKhauId field as first form field using `FormSelect`
- Convert hoKhauId from string to number in `onSubmitHandler` using `parseInt()`
- Include hoKhauId in the data sent to backend

**Validation Schema:**
```jsx
const schema = yup.object().shape({
  hoKhauId: yup.number().typeError('Vui lòng chọn hộ khẩu').required('Vui lòng chọn hộ khẩu'),
  hoTen: yup.string().required('Vui lòng nhập họ tên'),
  ngaySinh: yup.date().required('Vui lòng nhập ngày sinh'),
  gioiTinh: yup.string().required('Vui lòng chọn giới tính'),
  cccd: yup.string()
    .matches(/^\d{12}$/, 'CCCD phải có 12 chữ số')
    .required('Vui lòng nhập CCCD'),
  trangThai: yup.string().required('Vui lòng chọn trạng thái')
});
```

**Form Field:**
```jsx
<FormSelect
  label="Hộ khẩu"
  register={register}
  name="hoKhauId"
  options={householdOptions}
  error={errors.hoKhauId}
/>
```

**Data Transformation:**
```jsx
const submitData = {
  hoKhauId: parseInt(data.hoKhauId, 10), // Convert string to number
  hoTen: data.hoTen,
  ngaySinh: data.ngaySinh instanceof Date 
    ? data.ngaySinh.toISOString().split('T')[0]
    : data.ngaySinh,
  gioiTinh: transformGender(data.gioiTinh),
  cccd: data.cccd,
  trangThai: data.trangThai
};
```

### 3. Updated FormSelect.jsx

**Changes:**
- Added `placeholder` parameter with default value `'Vui lòng chọn...'`
- Always render a default empty option as the first choice
- Add safety check for `options` being null/undefined
- Better UX by requiring explicit user selection

**Code:**
```jsx
const FormSelect = ({
  label,
  error,
  register,
  name,
  options,
  placeholder = 'Vui lòng chọn...',
  ...rest
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
        {...register(name)}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options && options.length > 0 && options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
};
```

## Expected Data Flow

### Before Fix (400 Error)
```
User fills form → Submit → Missing hoKhauId → Backend validation fails → 400 Bad Request
```

### After Fix (Success)
```
1. CitizenDetail component mounts
   └─ fetchHouseholds() called
   └─ GET /api/ho-khau returns [{ id: 1, chuHo: 'Nguyễn Văn A', ... }, ...]
   └─ Transform to [{value: 1, label: 'Nguyễn Văn A'}, ...]
   └─ Pass to CitizenForm via householdOptions prop

2. User sees household dropdown populated with options
   
3. User fills form:
   - Chọn hộ khẩu: 1 (select value)
   - Họ tên: Nguyễn Văn B
   - Ngày sinh: 1990-01-01
   - Giới tính: Nam
   - CCCD: 123456789012
   - Trạng thái: THUONG_TRU

4. User clicks "Lưu thay đổi"
   └─ Yup validation passes
   └─ onSubmitHandler transforms:
      - hoKhauId: parseInt("1") = 1 (number)
      - Others: unchanged
   └─ handleSubmit calls citizenApi.create({
       hoKhauId: 1,
       hoTen: "Nguyễn Văn B",
       ngaySinh: "1990-01-01",
       gioiTinh: "Nam",
       cccd: "123456789012",
       trangThai: "THUONG_TRU"
     })
   
5. Backend receives camelCase JSON with hoKhauId
   └─ Validates all fields successfully
   └─ Returns 201 Created
   
6. Frontend shows success toast: "Thêm nhân khẩu thành công!"
   └─ Auto-redirect to /citizen after 2 seconds
```

## Testing Steps

1. **Navigate to Create Citizen Form**
   ```
   URL: http://localhost:5173/citizen/new
   ```

2. **Verify Household Dropdown**
   - Open browser console
   - Check for log: `"Loaded household options: [...]"`
   - Verify dropdown displays household names

3. **Fill Form with Valid Data**
   ```
   Hộ khẩu: Select a household from dropdown
   Họ tên: Test Person Name
   Ngày sinh: 1990-01-01
   Giới tính: Nam
   CCCD: 123456789012
   Trạng thái: Thường trú
   ```

4. **Submit Form**
   - Check browser console for: `"Form submitted with data (camelCase): {...}"`
   - Verify Network tab shows POST request to `/api/nhan-khau`
   - Check request headers include `Content-Type: application/json`
   - Check request body shows camelCase fields including `hoKhauId: 1` (number)

5. **Verify Success**
   - Green toast notification appears: "Thêm nhân khẩu thành công!"
   - Page auto-redirects to `/citizen` list after 2 seconds
   - New citizen appears in the list

## Debugging Checklist

If issues persist:

- [ ] Check `axiosConfig.js` logs for API request/response details
- [ ] Verify backend `/api/ho-khau` endpoint returns household data
- [ ] Check that household objects have `id` and `chuHo` fields
- [ ] Verify `hoKhauId` is being converted to number (not string)
- [ ] Check backend logs for validation errors on each field
- [ ] Verify date format is ISO 8601 (YYYY-MM-DD)
- [ ] Check that camelCase field names match backend expectations

## Files Modified

1. **`src/features/citizen/pages/Detail.jsx`**
   - Added householdApi import
   - Added householdOptions state
   - Added fetchHouseholds() function
   - Pass householdOptions to CitizenForm

2. **`src/features/citizen/components/CitizenForm.jsx`**
   - Added hoKhauId to schema validation
   - Added hoKhauId parameter to component
   - Added FormSelect for hoKhauId dropdown
   - Convert hoKhauId to number in onSubmitHandler
   - Include hoKhauId in submitData

3. **`src/components/Form/FormSelect.jsx`**
   - Added placeholder parameter
   - Added empty default option
   - Added null-safety checks for options array

## Backend API Integration

**Household API Endpoint:**
```
GET /api/ho-khau
Response: [{ id, maHoKhau, chuHo, diaChi, soThanhVien, ... }, ...]
```

**Citizen Create Endpoint:**
```
POST /api/nhan-khau
Request Body (camelCase):
{
  hoKhauId: number,      // REQUIRED - Household ID
  hoTen: string,         // REQUIRED - Citizen name
  ngaySinh: string,      // REQUIRED - Birth date (YYYY-MM-DD)
  gioiTinh: string,      // REQUIRED - Gender (Nam/Nữ)
  cccd: string,          // REQUIRED - ID card (12 digits)
  trangThai: string      // REQUIRED - Status (THUONG_TRU/TAM_TRU/TAM_VANG)
}

Response: 
201 Created with citizen object or
400 Bad Request with validation errors
```

## Key Insights

1. **Backend uses camelCase**: All field names in request/response are in camelCase, not snake_case
2. **hoKhauId is mandatory**: A citizen must belong to a household (foreign key constraint)
3. **HTML select returns strings**: Values from select elements are always strings and must be converted to numbers
4. **Placeholder option is important**: Prevents accidental submission without selecting a household
5. **Error messages help debugging**: Backend returns detailed validation error messages in response.data

## Next Steps

1. Test form submission with various household options
2. Test form validation with invalid CCCD (should reject if not 12 digits)
3. Test form validation with missing required fields
4. Implement search/filter on household dropdown if list is large
5. Add ability to create new household directly from citizen form (optional feature)
