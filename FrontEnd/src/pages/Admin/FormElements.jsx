import React, { useState } from 'react';
import {
    FormInput,
    PasswordInput,
    FormSelect,
    FormTextarea,
    FormCheckbox,
    CheckboxGroup,
    FormSwitch,
    FileUpload,
    Dropzone,
    InputGroup,
    PhoneInput,
    UrlInput,
    DatePicker,
    DateRangePicker
} from '../../components/common/Admin';

const FormElements = () => {
    // Form States
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        country: '',
        bio: '',
        agreeTerms: false,
        newsletter: true,
        gender: 'male',
        notifications: true,
        phone: '',
        website: '',
        birthDate: '',
        startDate: '',
        endDate: ''
    });

    const [files, setFiles] = useState([]);

    // Select Options
    const countryOptions = [
        { value: 'vn', label: '🇻🇳 Việt Nam' },
        { value: 'us', label: '🇺🇸 United States' },
        { value: 'uk', label: '🇬🇧 United Kingdom' },
        { value: 'jp', label: '🇯🇵 Japan' },
        { value: 'kr', label: '🇰🇷 Korea' },
        { value: 'sg', label: '🇸🇬 Singapore' },
        { value: 'th', label: '🇹🇭 Thailand' }
    ];

    const categoryOptions = [
        { value: 'phone', label: '📱 Điện thoại' },
        { value: 'laptop', label: '💻 Laptop' },
        { value: 'tablet', label: '📟 Tablet' },
        { value: 'accessory', label: '🎧 Phụ kiện' },
        { value: 'watch', label: '⌚ Đồng hồ' }
    ];

    return (
        <div className="admin-page">
            {/* Page Header */}
            <div className="page-header" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title" style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, var(--admin-primary), #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '8px'
                    }}>
                        Form Elements
                    </h1>
                    <p className="page-subtitle" style={{ color: 'var(--admin-text-muted)', fontSize: '15px' }}>
                        Bộ sưu tập các component form hiện đại, đẹp mắt và dễ sử dụng
                    </p>
                </div>
            </div>

            <div className="admin-grid-2">
                {/* Input Fields */}
                <div className="form-card">
                    <div className="form-card-header">
                        <h3 className="form-card-title">Input Fields</h3>
                        <p className="form-card-subtitle">Các loại input cơ bản với nhiều style</p>
                    </div>

                    <FormInput
                        label="Tên sản phẩm"
                        name="productName"
                        placeholder="Nhập tên sản phẩm..."
                        leftIcon={<i className="bi bi-box"></i>}
                    />

                    <FormInput
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="example@email.com"
                        leftIcon={<i className="bi bi-envelope"></i>}
                        hint="Chúng tôi sẽ không chia sẻ email của bạn"
                    />

                    <FormInput
                        label="Giá bán"
                        name="price"
                        type="number"
                        placeholder="0"
                        leftIcon={<i className="bi bi-currency-dollar"></i>}
                        rightIcon={<span style={{ fontSize: '13px', fontWeight: '500' }}>VNĐ</span>}
                    />

                    <FormInput
                        label="Disabled Input"
                        name="disabled"
                        value="Không thể chỉnh sửa"
                        disabled
                        leftIcon={<i className="bi bi-lock"></i>}
                    />
                </div>

                {/* Input States */}
                <div className="form-card">
                    <div className="form-card-header">
                        <h3 className="form-card-title">Input States</h3>
                        <p className="form-card-subtitle">Các trạng thái validation</p>
                    </div>

                    <FormInput
                        label="Default State"
                        name="default"
                        placeholder="Trạng thái mặc định..."
                    />

                    <FormInput
                        label="Success State"
                        name="success"
                        value="Giá trị hợp lệ"
                        variant="success"
                        success="Thông tin đã được xác nhận!"
                        leftIcon={<i className="bi bi-check-circle"></i>}
                    />

                    <FormInput
                        label="Error State"
                        name="error"
                        value="abc"
                        variant="error"
                        error="Vui lòng nhập đúng định dạng email"
                        leftIcon={<i className="bi bi-exclamation-circle"></i>}
                    />

                    <FormInput
                        label="Required Field"
                        name="required"
                        placeholder="Trường bắt buộc..."
                        required
                    />
                </div>

                {/* Password Input */}
                <div className="form-card">
                    <div className="form-card-header">
                        <h3 className="form-card-title">Password Input</h3>
                        <p className="form-card-subtitle">Input mật khẩu với tính năng bảo mật</p>
                    </div>

                    <PasswordInput
                        label="Mật khẩu"
                        name="password"
                        placeholder="Nhập mật khẩu của bạn"
                    />

                    <PasswordInput
                        label="Mật khẩu mới"
                        name="newPassword"
                        placeholder="Tạo mật khẩu mạnh"
                        showStrength
                        hint="Mật khẩu nên có ít nhất 8 ký tự"
                    />

                    <PasswordInput
                        label="Xác nhận mật khẩu"
                        name="confirmPassword"
                        placeholder="Nhập lại mật khẩu"
                        error="Mật khẩu không khớp"
                    />
                </div>

                {/* Select Input */}
                <div className="form-card">
                    <div className="form-card-header">
                        <h3 className="form-card-title">Select Dropdown</h3>
                        <p className="form-card-subtitle">Dropdown với tìm kiếm và đa chọn</p>
                    </div>

                    <FormSelect
                        label="Quốc gia"
                        placeholder="Chọn quốc gia..."
                        options={countryOptions}
                        value={formData.country}
                        onChange={(val) => setFormData(prev => ({ ...prev, country: val }))}
                    />

                    <FormSelect
                        label="Tìm kiếm & Chọn"
                        placeholder="Gõ để tìm kiếm..."
                        options={countryOptions}
                        searchable
                        clearable
                    />

                    <FormSelect
                        label="Chọn nhiều danh mục"
                        placeholder="Chọn một hoặc nhiều..."
                        options={categoryOptions}
                        multiple
                        searchable
                    />
                </div>

                {/* Textarea */}
                <div className="form-card">
                    <div className="form-card-header">
                        <h3 className="form-card-title">Textarea</h3>
                        <p className="form-card-subtitle">Ô nhập văn bản nhiều dòng</p>
                    </div>

                    <FormTextarea
                        label="Mô tả sản phẩm"
                        name="description"
                        placeholder="Nhập mô tả chi tiết về sản phẩm..."
                        rows={4}
                    />

                    <FormTextarea
                        label="Ghi chú (giới hạn 200 ký tự)"
                        name="note"
                        placeholder="Viết ghi chú của bạn..."
                        rows={3}
                        showCount
                        maxLength={200}
                    />
                </div>

                {/* Checkbox & Radio */}
                <div className="form-card">
                    <div className="form-card-header">
                        <h3 className="form-card-title">Checkbox & Radio</h3>
                        <p className="form-card-subtitle">Các tùy chọn checkbox và radio</p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Checkbox Options</label>
                        <div className="checkbox-group vertical">
                            <FormCheckbox
                                label="Đồng ý với điều khoản dịch vụ"
                                checked={formData.agreeTerms}
                                onChange={(checked) => setFormData(prev => ({ ...prev, agreeTerms: checked }))}
                            />
                            <FormCheckbox
                                label="Nhận thông báo qua email"
                                checked={formData.newsletter}
                                onChange={(checked) => setFormData(prev => ({ ...prev, newsletter: checked }))}
                                variant="success"
                            />
                            <FormCheckbox
                                label="Tùy chọn bị vô hiệu hóa"
                                disabled
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Giới tính</label>
                        <CheckboxGroup
                            type="radio"
                            name="gender"
                            options={[
                                { value: 'male', label: 'Nam' },
                                { value: 'female', label: 'Nữ' },
                                { value: 'other', label: 'Khác' }
                            ]}
                            value={formData.gender}
                            onChange={(val) => setFormData(prev => ({ ...prev, gender: val }))}
                        />
                    </div>
                </div>

                {/* Switch Toggle */}
                <div className="form-card">
                    <div className="form-card-header">
                        <h3 className="form-card-title">Switch Toggle</h3>
                        <p className="form-card-subtitle">Toggle bật/tắt các tùy chọn</p>
                    </div>

                    <div className="form-group" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'var(--admin-bg-secondary)',
                        borderRadius: '10px',
                        marginBottom: '16px'
                    }}>
                        <div>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Thông báo Push</div>
                            <div style={{ fontSize: '13px', color: 'var(--admin-text-muted)' }}>Nhận thông báo từ ứng dụng</div>
                        </div>
                        <FormSwitch
                            checked={formData.notifications}
                            onChange={(checked) => setFormData(prev => ({ ...prev, notifications: checked }))}
                        />
                    </div>

                    <div className="form-group" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'var(--admin-bg-secondary)',
                        borderRadius: '10px',
                        marginBottom: '16px'
                    }}>
                        <div>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Chế độ tối</div>
                            <div style={{ fontSize: '13px', color: 'var(--admin-text-muted)' }}>Giao diện tối cho ban đêm</div>
                        </div>
                        <FormSwitch variant="warning" />
                    </div>

                    <div className="form-group" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'var(--admin-bg-secondary)',
                        borderRadius: '10px'
                    }}>
                        <div>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Xác thực 2 bước</div>
                            <div style={{ fontSize: '13px', color: 'var(--admin-text-muted)' }}>Bảo mật tài khoản tốt hơn</div>
                        </div>
                        <FormSwitch checked variant="success" />
                    </div>
                </div>

                {/* Input Groups */}
                <div className="form-card">
                    <div className="form-card-header">
                        <h3 className="form-card-title">Input Groups</h3>
                        <p className="form-card-subtitle">Input kết hợp với prefix/suffix</p>
                    </div>

                    <InputGroup
                        label="Email"
                        prefix={<i className="bi bi-envelope-fill"></i>}
                        placeholder="your@email.com"
                    />

                    <InputGroup
                        label="Username"
                        prefix="@"
                        placeholder="username"
                    />

                    <PhoneInput
                        label="Số điện thoại"
                    />

                    <UrlInput
                        label="Website"
                    />

                    <InputGroup
                        label="Mã giảm giá"
                        value="SAVE20OFF"
                        suffix="Copy"
                        copyable
                    />
                </div>

                {/* Date Picker */}
                <div className="form-card">
                    <div className="form-card-header">
                        <h3 className="form-card-title">Date & Time Picker</h3>
                        <p className="form-card-subtitle">Chọn ngày giờ dễ dàng</p>
                    </div>

                    <DatePicker
                        label="Ngày sinh"
                        type="date"
                        value={formData.birthDate}
                        onChange={(val) => setFormData(prev => ({ ...prev, birthDate: val }))}
                    />

                    <DatePicker
                        label="Ngày & Giờ"
                        type="datetime-local"
                    />

                    <DatePicker
                        label="Chọn giờ"
                        type="time"
                    />

                    <DateRangePicker
                        label="Khoảng thời gian"
                        startValue={formData.startDate}
                        endValue={formData.endDate}
                        onStartChange={(val) => setFormData(prev => ({ ...prev, startDate: val }))}
                        onEndChange={(val) => setFormData(prev => ({ ...prev, endDate: val }))}
                    />
                </div>

                {/* File Upload */}
                <div className="form-card">
                    <div className="form-card-header">
                        <h3 className="form-card-title">File Upload</h3>
                        <p className="form-card-subtitle">Upload file đơn giản</p>
                    </div>

                    <FileUpload
                        label="Ảnh đại diện"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        placeholder="Chọn ảnh đại diện..."
                    />

                    <FileUpload
                        label="Tài liệu"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        placeholder="Chọn file tài liệu..."
                    />

                    <FileUpload
                        label="File bị vô hiệu"
                        disabled
                    />
                </div>
            </div>

            {/* Dropzone - Full Width */}
            <div className="form-card" style={{ marginTop: '24px' }}>
                <div className="form-card-header">
                    <h3 className="form-card-title">Dropzone Upload</h3>
                    <p className="form-card-subtitle">Kéo thả file hoặc click để upload nhiều file</p>
                </div>

                <Dropzone
                    accept="image/*,.pdf,.doc,.docx"
                    multiple
                    maxSize={10}
                    value={files}
                    onChange={setFiles}
                    buttonText="Chọn File"
                />
            </div>

            {/* Sample Form */}
            <div className="form-card" style={{ marginTop: '24px' }}>
                <div className="form-card-header">
                    <h3 className="form-card-title">Mẫu Form Hoàn Chỉnh</h3>
                    <p className="form-card-subtitle">Ví dụ form với các trường thông tin</p>
                </div>

                <div className="form-row">
                    <FormInput
                        label="Họ và tên"
                        placeholder="Nguyễn Văn A"
                        required
                    />
                    <FormInput
                        label="Email"
                        type="email"
                        placeholder="example@email.com"
                        required
                    />
                </div>

                <div className="form-row">
                    <PhoneInput label="Số điện thoại" />
                    <DatePicker label="Ngày sinh" type="date" />
                </div>

                <FormTextarea
                    label="Địa chỉ"
                    placeholder="Nhập địa chỉ chi tiết..."
                    rows={3}
                />

                <div className="form-group">
                    <FormCheckbox
                        label="Tôi đã đọc và đồng ý với điều khoản sử dụng"
                    />
                </div>

                <div className="form-actions">
                    <button className="admin-btn admin-btn-outline" type="button">
                        Hủy bỏ
                    </button>
                    <button className="admin-btn admin-btn-primary" type="submit">
                        <i className="bi bi-check-lg"></i>
                        Lưu thông tin
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormElements;
