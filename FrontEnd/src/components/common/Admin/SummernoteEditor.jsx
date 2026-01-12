import { useEffect, useRef, useState, useCallback } from 'react'

// Custom styles
import '../../../assets/css/admin/summernote-custom.css'

/**
 * Summernote Editor Component for React
 * @param {Object} props
 * @param {string} props.value - HTML content value
 * @param {function} props.onChange - Callback when content changes
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.height - Editor height (default: 200)
 * @param {boolean} props.disabled - Disable editor
 * @param {Object} props.toolbar - Custom toolbar configuration
 */
export default function SummernoteEditor({
    value = '',
    onChange,
    placeholder = '',
    height = 200,
    disabled = false,
    toolbar = null
}) {
    const editorRef = useRef(null);
    const isInitializedRef = useRef(false);
    const isFullyInitializedRef = useRef(false); // Đánh dấu khi Summernote hoàn toàn sẵn sàng
    const lastValueRef = useRef(value);
    const pendingValueRef = useRef(value); // Lưu giá trị chờ để set sau khi init
    const [isLoading, setIsLoading] = useState(true);

    // Full toolbar (matching the image)
    const simpleToolbar = [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'strikethrough', 'clear']],
        ['fontname', ['fontname']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'picture', 'video']],
        ['view', ['fullscreen', 'codeview', 'help']]
    ];

    const handleChange = useCallback((contents) => {
        if (onChange && contents !== lastValueRef.current) {
            lastValueRef.current = contents;
            onChange(contents);
        }
    }, [onChange]);

    // Initialize Summernote
    useEffect(() => {
        // Skip if already initialized or no ref
        if (!editorRef.current) return;

        // Check if Summernote is already attached to this element
        if (isInitializedRef.current) return;

        // Mark as initializing to prevent double init in React Strict Mode
        isInitializedRef.current = true;

        const initSummernote = () => {
            try {
                // Check if element still exists and not already initialized
                if (!editorRef.current) return;

                const $editor = $(editorRef.current);

                // Prevent re-initialization
                if ($editor.hasClass('note-editor') || $editor.next('.note-editor').length > 0) {
                    setIsLoading(false);
                    return;
                }

                $editor.summernote({
                    placeholder: placeholder,
                    height: height,
                    toolbar: toolbar || simpleToolbar,
                    dialogsInBody: false,  // Đổi thành false để tránh xung đột với modal
                    disableDragAndDrop: false,
                    focus: false,
                    airMode: false,  // Đảm bảo toolbar hiển thị
                    tooltip: false,  // Disable tooltip to fix Bootstrap 5 compatibility issue
                    callbacks: {
                        onChange: function (contents) {
                            handleChange(contents);
                        },
                        onInit: function () {
                            // Đánh dấu Summernote đã hoàn toàn sẵn sàng
                            isFullyInitializedRef.current = true;
                            // Set initial value - sử dụng pendingValueRef để lấy giá trị mới nhất
                            const initialValue = pendingValueRef.current || value;
                            if (initialValue) {
                                $editor.summernote('code', initialValue);
                                lastValueRef.current = initialValue;
                            }
                        }
                    },
                    styleTags: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
                    fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia', 'Helvetica', 'Impact', 'Lucida Console', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'],
                    fontNamesIgnoreCheck: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia', 'Helvetica', 'Impact', 'Lucida Console', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana']
                });

                setIsLoading(false);

                // Handle disabled state
                if (disabled) {
                    $editor.summernote('disable');
                }
            } catch (error) {
                console.error('Failed to initialize Summernote:', error);
                setIsLoading(false);
            }
        };

        initSummernote();

        // Cleanup on unmount
        return () => {
            if (editorRef.current) {
                try {
                    const $editor = $(editorRef.current);
                    if ($editor.next('.note-editor').length > 0) {
                        $editor.summernote('destroy');
                    }
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
            isInitializedRef.current = false;
            isFullyInitializedRef.current = false;
        };
    }, []);

    // Update value when prop changes (from outside)
    useEffect(() => {
        // Luôn cập nhật pendingValueRef với giá trị mới nhất
        pendingValueRef.current = value;

        // Chỉ cập nhật Summernote nếu đã hoàn toàn sẵn sàng
        if (isFullyInitializedRef.current && editorRef.current) {
            const $editor = $(editorRef.current);
            const currentCode = $editor.summernote('code');

            // Only update if value is different and not from our own change
            if (value !== currentCode && value !== lastValueRef.current) {
                lastValueRef.current = value;
                $editor.summernote('code', value || '');
            }
        }
    }, [value]);

    // Handle disabled state changes
    useEffect(() => {
        if (isFullyInitializedRef.current && editorRef.current) {
            const $editor = $(editorRef.current);
            if (disabled) {
                $editor.summernote('disable');
            } else {
                $editor.summernote('enable');
            }
        }
    }, [disabled]);

    return (
        <div className="summernote-wrapper">
            {isLoading && (
                <div className="summernote-loading" style={{
                    padding: '20px',
                    textAlign: 'center',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                }}>
                    <span>Đang tải editor...</span>
                </div>
            )}
            <div ref={editorRef} style={{ display: isLoading ? 'none' : 'block' }}></div>
        </div>
    );
}
