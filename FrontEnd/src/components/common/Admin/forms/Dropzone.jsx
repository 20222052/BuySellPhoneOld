import { useState, useRef, useCallback } from 'react';

/**
 * Dropzone Component - Kéo thả upload file
 * @param {string} label - Nhãn
 * @param {string} accept - Loại file chấp nhận
 * @param {boolean} multiple - Upload nhiều file
 * @param {number} maxSize - Kích thước tối đa mỗi file (MB)
 * @param {number} maxFiles - Số file tối đa
 */
export default function Dropzone({
    label,
    accept = 'image/*',
    multiple = false,
    maxSize = 5,
    maxFiles = 10,
    onChange,
    error,
    disabled = false,
    className = '',
    required = false,
}) {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef(null);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const validateFiles = (fileList) => {
        const validFiles = [];
        const errors = [];

        Array.from(fileList).forEach((file) => {
            if (file.size > maxSize * 1024 * 1024) {
                errors.push(`${file.name}: Vượt quá ${maxSize}MB`);
            } else if (files.length + validFiles.length >= maxFiles) {
                errors.push(`Tối đa ${maxFiles} file`);
            } else {
                validFiles.push({
                    file,
                    id: Date.now() + Math.random(),
                    preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
                });
            }
        });

        if (errors.length > 0) {
            alert(errors.join('\n'));
        }

        return validFiles;
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        const droppedFiles = e.dataTransfer?.files;
        if (droppedFiles) {
            const validFiles = validateFiles(droppedFiles);
            const newFiles = multiple ? [...files, ...validFiles] : validFiles.slice(0, 1);
            setFiles(newFiles);
            onChange && onChange(newFiles.map(f => f.file));
        }
    }, [disabled, files, maxFiles, maxSize, multiple, onChange]);

    const handleFileSelect = (e) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            const validFiles = validateFiles(selectedFiles);
            const newFiles = multiple ? [...files, ...validFiles] : validFiles.slice(0, 1);
            setFiles(newFiles);
            onChange && onChange(newFiles.map(f => f.file));
        }
    };

    const handleRemove = (id) => {
        const newFiles = files.filter(f => f.id !== id);
        // Cleanup preview URL
        const removedFile = files.find(f => f.id === id);
        if (removedFile?.preview) {
            URL.revokeObjectURL(removedFile.preview);
        }
        setFiles(newFiles);
        onChange && onChange(newFiles.map(f => f.file));
    };

    const handleBrowse = () => {
        if (!disabled) {
            inputRef.current?.click();
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className={`form-group ${className}`}>
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="text-danger">*</span>}
                </label>
            )}

            <div
                className={`dropzone ${isDragging ? 'dragging' : ''} ${error ? 'has-error' : ''} ${disabled ? 'disabled' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowse}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileSelect}
                    disabled={disabled}
                    hidden
                />

                <div className="dropzone-content">
                    <div className="dropzone-icon">
                        <i className="bi bi-cloud-arrow-up"></i>
                    </div>
                    <h4 className="dropzone-title">Kéo & thả file vào đây</h4>
                    <p className="dropzone-text">
                        Kéo thả file PNG, JPG, WebP, SVG tại đây hoặc
                    </p>
                    <button type="button" className="dropzone-btn" onClick={(e) => { e.stopPropagation(); handleBrowse(); }}>
                        Chọn file
                    </button>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="dropzone-files">
                    {files.map((item) => (
                        <div key={item.id} className="dropzone-file-item">
                            {item.preview ? (
                                <img src={item.preview} alt="" className="file-preview" />
                            ) : (
                                <div className="file-icon">
                                    <i className="bi bi-file-earmark"></i>
                                </div>
                            )}
                            <div className="file-info">
                                <p className="file-name">{item.file.name}</p>
                                <span className="file-size">{formatFileSize(item.file.size)}</span>
                            </div>
                            <button
                                type="button"
                                className="file-remove"
                                onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                            >
                                <i className="bi bi-trash"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {error && <span className="form-feedback error">{error}</span>}
        </div>
    );
}
