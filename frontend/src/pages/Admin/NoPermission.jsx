import "./NoPermission.css";

function NoPermission() {
  return (
    <div className="no-permission">
      <div className="no-permission-content">
        <div className="no-permission-icon">🔒</div>
        <h2>Không có quyền truy cập</h2>
        <p>Bạn không có quyền truy cập chức năng này.</p>
        <p className="no-permission-sub">Vui lòng liên hệ quản trị viên để được cấp quyền.</p>
      </div>
    </div>
  );
}

export default NoPermission;


