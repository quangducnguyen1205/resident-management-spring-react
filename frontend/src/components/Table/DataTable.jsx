import React from 'react';
import { useNavigate } from 'react-router-dom';

const DataTable = ({ 
  columns, 
  data, 
  loading, 
  onEdit, 
  onDelete, 
  basePath,
  canEdit = true,
  canDelete = true
}) => {
  const navigate = useNavigate();

  if (loading) {
    return <div className="text-center py-4">Đang tải...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {column.title}
              </th>
            ))}
            <th className="px-6 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={`${row.id}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => {
                    console.log('Detail button clicked for row:', row);
                    // Strict validation: must be a valid finite number
                    if (!row?.id || typeof row.id !== 'number' || !isFinite(row.id)) {
                      console.error('Cannot navigate: row.id is invalid', { id: row?.id, row });
                      alert('Lỗi: ID không hợp lệ');
                      return;
                    }
                    navigate(`${basePath}/${row.id}`);
                  }}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Chi tiết
                </button>
                {canEdit && (
                  <button
                    onClick={() => onEdit(row)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Sửa
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => onDelete(row)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Xóa
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;