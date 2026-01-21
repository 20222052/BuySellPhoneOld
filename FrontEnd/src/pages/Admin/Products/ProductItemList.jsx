import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import SummernoteEditor from '../../../components/common/Admin/SummernoteEditor';
import DataTable from '../../../components/common/Admin/DataTable';
import { FormInput, FormSelect } from '../../../components/common/Admin';
import ProductItemService from '../../../services/productItemService';
import ProductService from '../../../services/productService';
import BrandService from '../../../services/brandService';
import CategoryService from '../../../services/categoryService';
import '../../../assets/css/admin/categories.css';
import '../../../assets/css/admin/products.css';

export default function ProductItemList() {
    // Refs
    const productSearchRef = useRef(null);

    // State
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'create' | 'edit' | 'view'
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Filter & Pagination state
    const [searchTerm, setSearchTerm] = useState('');
    const [brandFilter, setBrandFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState('DESC');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    // Options for filters
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);

    // Products list for selection (when creating ProductItem)
    const [productsList, setProductsList] = useState([]);
    const [showCreateProductModal, setShowCreateProductModal] = useState(false);
    const [newProductData, setNewProductData] = useState({
        name: '',
        description: '',
        brandId: '',
        categoryId: '',
        status: 'active',
        warrantyMonths: 12
    });
    const [createProductLoading, setCreateProductLoading] = useState(false);

    // Product search state
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Selected product's existing ProductItems
    const [existingProductItems, setExistingProductItems] = useState([]);
    const [loadingProductItems, setLoadingProductItems] = useState(false);

    // Editing existing ProductItem state (null = creating new)
    const [editingProductItemId, setEditingProductItemId] = useState(null);

    // Media upload state
    const [uploadingMedia, setUploadingMedia] = useState(false);

    // Status update state
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [currentStatus, setCurrentStatus] = useState('active');

    // Form data
    const [formData, setFormData] = useState({
        productId: '',
        name: '',
        description: '',
        basePrice: '',
        sellPrice: '',
        comparePrice: '',
        // Screen specs
        screenSize: '',
        screenTechnology: '',
        screenResolution: '',
        refreshRate: '',
        screenType: '',
        screenFeatures: '',
        // Camera specs
        rearCamera: '',
        rearVideo: '',
        rearCameraFeatures: '',
        frontCamera: '',
        frontVideo: '',
        // Chip specs
        chipset: '',
        cpu: '',
        gpu: '',
        operatingSystem: '',
        // Connectivity specs
        nfc: '',
        simType: '',
        network: '',
        gps: '',
        wifi: '',
        bluetooth: '',
        chargingPort: '',
        // Battery specs
        batteryCapacity: '',
        chargingPower: '',
        chargingTechnology: '',
        // Dimensions
        dimensions: '',
        weight: '',
        // Other specs
        waterResistance: '',
        sensors: '',
        releaseTime: '',
        // Related data
        models: [],
        mediaList: []
    });

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Filter products based on search term
    useEffect(() => {
        if (productSearchTerm.trim() === '') {
            setFilteredProducts(productsList.slice(0, 20)); // Show first 20 when empty
        } else {
            const searchLower = productSearchTerm.toLowerCase();
            const filtered = productsList.filter(prod =>
                prod.name?.toLowerCase().includes(searchLower) ||
                prod.brandName?.toLowerCase().includes(searchLower) ||
                prod.categoryName?.toLowerCase().includes(searchLower)
            ).slice(0, 20); // Limit to 20 results
            setFilteredProducts(filtered);
        }
    }, [productSearchTerm, productsList]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (productSearchRef.current && !productSearchRef.current.contains(event.target)) {
                setShowProductDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load brands and categories for filter
    useEffect(() => {
        const loadFilters = async () => {
            try {
                const [brandsRes, categoriesRes, productsRes] = await Promise.all([
                    BrandService.getAll({ pageSize: 100 }),
                    CategoryService.getAll({ pageSize: 100 }),
                    ProductService.getAll({ pageSize: 200 })
                ]);
                setBrands(brandsRes?.data?.items || []);
                setCategories(categoriesRes?.data?.items || []);
                setProductsList(productsRes?.data?.items || []);
            } catch (error) {
                console.error('Load filters error:', error);
            }
        };
        loadFilters();
    }, []);

    // Fetch products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await ProductItemService.getAllForList({
                search: debouncedSearch,
                brandId: brandFilter,
                categoryId: categoryFilter,
                status: statusFilter,
                sortBy,
                sortDir,
                randomEnabled: false,
                page: currentPage,
                pageSize
            });
            const data = response?.data || {};
            const items = data.items || [];
            setProducts(Array.isArray(items) ? items : []);
            setTotalPages(data.totalPages || 0);
            setTotalItems(data.totalElements || 0);
        } catch (error) {
            console.error('Fetch products error:', error);
            toast.error(error.message || 'Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, brandFilter, categoryFilter, statusFilter, sortBy, sortDir, currentPage, pageSize]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Open modal
    const openModal = async (mode, product = null) => {
        setModalMode(mode);
        setSelectedProduct(product);

        if (product && (mode === 'edit' || mode === 'view')) {
            // Load full details
            try {
                const response = await ProductItemService.getDetails(product.id);
                const details = response.data;
                setFormData({
                    productId: details.productId || '',
                    name: details.name || '',
                    description: details.description || '',
                    basePrice: details.basePrice || '',
                    sellPrice: details.sellPrice || '',
                    comparePrice: details.comparePrice || '',
                    // Screen specs
                    screenSize: details.screenSize || '',
                    screenTechnology: details.screenTechnology || '',
                    screenResolution: details.screenResolution || '',
                    refreshRate: details.refreshRate || '',
                    screenType: details.screenType || '',
                    screenFeatures: details.screenFeatures || '',
                    // Camera specs
                    rearCamera: details.rearCamera || '',
                    rearVideo: details.rearVideo || '',
                    rearCameraFeatures: details.rearCameraFeatures || '',
                    frontCamera: details.frontCamera || '',
                    frontVideo: details.frontVideo || '',
                    // Chip specs
                    chipset: details.chipset || '',
                    cpu: details.cpu || '',
                    gpu: details.gpu || '',
                    operatingSystem: details.operatingSystem || '',
                    // Connectivity specs
                    nfc: details.nfc || '',
                    simType: details.simType || '',
                    network: details.network || '',
                    gps: details.gps || '',
                    wifi: details.wifi || '',
                    bluetooth: details.bluetooth || '',
                    chargingPort: details.chargingPort || '',
                    // Battery specs
                    batteryCapacity: details.batteryCapacity || '',
                    chargingPower: details.chargingPower || '',
                    chargingTechnology: details.chargingTechnology || '',
                    // Dimensions
                    dimensions: details.dimensions || '',
                    weight: details.weight || '',
                    // Other specs
                    waterResistance: details.waterResistance || '',
                    sensors: details.sensors || '',
                    releaseTime: details.releaseTime || '',
                    // Related data
                    models: details.models || [],
                    mediaList: details.media || []
                });

                // Map status integer to enum string
                const statusMap = { 0: 'inactive', 1: 'active', 2: 'discontinued' };
                setCurrentStatus(statusMap[details.status] || 'active');
            } catch (error) {
                console.error('Load details error:', error);
                setFormData({
                    productId: product.productId || '',
                    name: product.name || '',
                    description: product.description || '',
                    basePrice: product.basePrice || '',
                    sellPrice: product.sellPrice || '',
                    comparePrice: product.comparePrice || '',
                    screenSize: '', screenTechnology: '', screenResolution: '', refreshRate: '', screenType: '', screenFeatures: '',
                    rearCamera: '', rearVideo: '', rearCameraFeatures: '', frontCamera: '', frontVideo: '',
                    chipset: '', cpu: '', gpu: '', operatingSystem: '',
                    nfc: '', simType: '', network: '', gps: '', wifi: '', bluetooth: '', chargingPort: '',
                    batteryCapacity: '', chargingPower: '', chargingTechnology: '',
                    dimensions: '', weight: '',
                    waterResistance: '', sensors: '', releaseTime: '',
                    models: [],
                    mediaList: []
                });
                // Fallback status mapping from list data
                const statusMap = { 0: 'inactive', 1: 'active', 2: 'discontinued' };
                setCurrentStatus(statusMap[product.status] || 'active');
            }
        } else {
            setFormData({
                productId: '',
                name: '',
                description: '',
                basePrice: '',
                sellPrice: '',
                comparePrice: '',
                screenSize: '', screenTechnology: '', screenResolution: '', refreshRate: '', screenType: '', screenFeatures: '',
                rearCamera: '', rearVideo: '', rearCameraFeatures: '', frontCamera: '', frontVideo: '',
                chipset: '', cpu: '', gpu: '', operatingSystem: '',
                nfc: '', simType: '', network: '', gps: '', wifi: '', bluetooth: '', chargingPort: '',
                batteryCapacity: '', chargingPower: '', chargingTechnology: '',
                dimensions: '', weight: '',
                waterResistance: '', sensors: '', releaseTime: '',
                models: [],
                mediaList: []
            });
        }
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
        setProductSearchTerm('');
        setShowProductDropdown(false);
        setExistingProductItems([]);
        setEditingProductItemId(null);
        setFormData({
            productId: '',
            name: '',
            description: '',
            basePrice: '',
            sellPrice: '',
            comparePrice: '',
            screenSize: '', screenTechnology: '', screenResolution: '', refreshRate: '', screenType: '', screenFeatures: '',
            rearCamera: '', rearVideo: '', rearCameraFeatures: '', frontCamera: '', frontVideo: '',
            chipset: '', cpu: '', gpu: '', operatingSystem: '',
            nfc: '', simType: '', network: '', gps: '', wifi: '', bluetooth: '', chargingPort: '',
            batteryCapacity: '', chargingPower: '', chargingTechnology: '',
            dimensions: '', weight: '',
            waterResistance: '', sensors: '', releaseTime: '',
            models: [],
            mediaList: []
        });
    };

    // Handle form change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle status change
    const handleStatusChange = async (newStatus) => {
        if (!selectedProduct || updatingStatus) return;

        try {
            setUpdatingStatus(true);
            await ProductItemService.updateStatus(selectedProduct.id, newStatus);
            toast.success('Cập nhật trạng thái thành công!');
            setCurrentStatus(newStatus);
            // Refresh the product list to show updated status
            fetchProducts();
        } catch (error) {
            console.error('Update status error:', error);
            toast.error(error.message || 'Không thể cập nhật trạng thái');
        } finally {
            setUpdatingStatus(false);
        }
    };

    // ==================== PRODUCT SEARCH HANDLERS ====================
    const handleProductSearch = (e) => {
        setProductSearchTerm(e.target.value);
        setShowProductDropdown(true);
    };

    const selectProduct = async (product) => {
        setFormData(prev => ({ ...prev, productId: product.id }));
        setProductSearchTerm(product.name);
        setShowProductDropdown(false);
        setEditingProductItemId(null); // Reset to create new mode

        // Load existing ProductItems for this product
        setLoadingProductItems(true);
        try {
            const response = await ProductItemService.getAllForList({
                productId: product.id,
                pageSize: 100
            });
            setExistingProductItems(response?.data?.items || []);
        } catch (error) {
            console.error('Load product items error:', error);
            setExistingProductItems([]);
        } finally {
            setLoadingProductItems(false);
        }
    };

    const clearProductSelection = () => {
        setFormData(prev => ({ ...prev, productId: '' }));
        setProductSearchTerm('');
        setExistingProductItems([]);
        setEditingProductItemId(null);
    };

    // ==================== SELECT EXISTING PRODUCT ITEM TO EDIT ====================
    const selectExistingProductItem = async (item) => {
        setEditingProductItemId(item.id);

        // Load full details of the selected ProductItem
        try {
            const response = await ProductItemService.getDetails(item.id);
            const details = response.data;
            setFormData(prev => ({
                ...prev,
                name: details.name || '',
                description: details.description || '',
                basePrice: details.basePrice || '',
                sellPrice: details.sellPrice || '',
                comparePrice: details.comparePrice || '',
                // Screen specs
                screenSize: details.screenSize || '',
                screenTechnology: details.screenTechnology || '',
                screenResolution: details.screenResolution || '',
                refreshRate: details.refreshRate || '',
                screenType: details.screenType || '',
                screenFeatures: details.screenFeatures || '',
                // Camera specs
                rearCamera: details.rearCamera || '',
                rearVideo: details.rearVideo || '',
                rearCameraFeatures: details.rearCameraFeatures || '',
                frontCamera: details.frontCamera || '',
                frontVideo: details.frontVideo || '',
                // Chip specs
                chipset: details.chipset || '',
                cpu: details.cpu || '',
                gpu: details.gpu || '',
                operatingSystem: details.operatingSystem || '',
                // Connectivity specs
                nfc: details.nfc || '',
                simType: details.simType || '',
                network: details.network || '',
                gps: details.gps || '',
                wifi: details.wifi || '',
                bluetooth: details.bluetooth || '',
                chargingPort: details.chargingPort || '',
                // Battery specs
                batteryCapacity: details.batteryCapacity || '',
                chargingPower: details.chargingPower || '',
                chargingTechnology: details.chargingTechnology || '',
                // Dimensions
                dimensions: details.dimensions || '',
                weight: details.weight || '',
                // Other specs
                waterResistance: details.waterResistance || '',
                sensors: details.sensors || '',
                releaseTime: details.releaseTime || '',
                // Related data
                models: details.models || [],
                mediaList: details.media || []
            }));
        } catch (error) {
            console.error('Load product item details error:', error);
            // Fallback to basic info from list
            setFormData(prev => ({
                ...prev,
                name: item.name || '',
                description: item.description || '',
                basePrice: item.basePrice || '',
                sellPrice: item.sellPrice || '',
                comparePrice: item.comparePrice || '',
                screenSize: '', screenTechnology: '', screenResolution: '', refreshRate: '', screenType: '', screenFeatures: '',
                rearCamera: '', rearVideo: '', rearCameraFeatures: '', frontCamera: '', frontVideo: '',
                chipset: '', cpu: '', gpu: '', operatingSystem: '',
                nfc: '', simType: '', network: '', gps: '', wifi: '', bluetooth: '', chargingPort: '',
                batteryCapacity: '', chargingPower: '', chargingTechnology: '',
                dimensions: '', weight: '',
                waterResistance: '', sensors: '', releaseTime: '',
                models: [],
                mediaList: []
            }));
        }
    };

    const clearEditingProductItem = () => {
        setEditingProductItemId(null);
        setFormData(prev => ({
            ...prev,
            name: '',
            description: '',
            basePrice: '',
            sellPrice: '',
            comparePrice: '',
            screenSize: '', screenTechnology: '', screenResolution: '', refreshRate: '', screenType: '', screenFeatures: '',
            rearCamera: '', rearVideo: '', rearCameraFeatures: '', frontCamera: '', frontVideo: '',
            chipset: '', cpu: '', gpu: '', operatingSystem: '',
            nfc: '', simType: '', network: '', gps: '', wifi: '', bluetooth: '', chargingPort: '',
            batteryCapacity: '', chargingPower: '', chargingTechnology: '',
            dimensions: '', weight: '',
            waterResistance: '', sensors: '', releaseTime: '',
            models: [],
            mediaList: []
        }));
    };

    // ==================== PRODUCT HANDLERS ====================
    const openCreateProductModal = () => {
        setNewProductData({
            name: '',
            description: '',
            brandId: '',
            categoryId: '',
            status: 'active',
            warrantyMonths: 12
        });
        setShowCreateProductModal(true);
    };

    const closeCreateProductModal = () => {
        setShowCreateProductModal(false);
        setNewProductData({
            name: '',
            description: '',
            brandId: '',
            categoryId: '',
            status: 'active',
            warrantyMonths: 12
        });
    };

    const handleNewProductChange = (e) => {
        const { name, value } = e.target;
        setNewProductData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();

        if (!newProductData.name) {
            toast.error('Vui lòng nhập tên sản phẩm!');
            return;
        }
        if (!newProductData.brandId) {
            toast.error('Vui lòng chọn hãng sản xuất!');
            return;
        }
        if (!newProductData.categoryId) {
            toast.error('Vui lòng chọn danh mục!');
            return;
        }

        setCreateProductLoading(true);

        try {
            const response = await ProductService.create(newProductData);
            const newProduct = response.data;

            // Add to products list
            setProductsList(prev => [newProduct, ...prev]);

            // Auto-select the new product
            setFormData(prev => ({ ...prev, productId: newProduct.id }));

            toast.success('Tạo sản phẩm thành công!');
            closeCreateProductModal();
        } catch (error) {
            console.error('Create product error:', error);
            toast.error(error.message || 'Không thể tạo sản phẩm!');
        } finally {
            setCreateProductLoading(false);
        }
    };

    // Reload products list
    const reloadProductsList = async () => {
        try {
            const response = await ProductService.getAll({ pageSize: 200 });
            setProductsList(response?.data?.items || []);
        } catch (error) {
            console.error('Reload products error:', error);
        }
    };

    // ==================== MODEL HANDLERS ====================
    const addModel = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        setFormData(prev => ({
            ...prev,
            models: [
                ...prev.models,
                {
                    id: null, // null = create new
                    name: '',
                    ramGb: '',
                    romGb: '',
                    grade: '',
                    colors: []
                }
            ]
        }));
    };

    const updateModel = (modelIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            models: prev.models.map((model, idx) =>
                idx === modelIndex ? { ...model, [field]: value } : model
            )
        }));
    };

    const removeModel = (modelIndex, e) => {
        e?.preventDefault();
        e?.stopPropagation();
        console.log('Removing model at index:', modelIndex);
        setFormData(prev => {
            const newModels = prev.models.filter((_, idx) => idx !== modelIndex);
            console.log('Models before:', prev.models.length, 'after:', newModels.length);
            return {
                ...prev,
                models: newModels
            };
        });
    };

    // ==================== COLOR HANDLERS ====================
    const addColor = (modelIndex, e) => {
        e?.preventDefault();
        e?.stopPropagation();
        setFormData(prev => ({
            ...prev,
            models: prev.models.map((model, idx) =>
                idx === modelIndex
                    ? {
                        ...model,
                        colors: [
                            ...(model.colors || []),
                            {
                                id: null,
                                name: '',
                                hexCode: '#000000',
                                qtyAvailable: 0
                            }
                        ]
                    }
                    : model
            )
        }));
    };

    const updateColor = (modelIndex, colorIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            models: prev.models.map((model, mIdx) =>
                mIdx === modelIndex
                    ? {
                        ...model,
                        colors: model.colors.map((color, cIdx) =>
                            cIdx === colorIndex ? { ...color, [field]: value } : color
                        )
                    }
                    : model
            )
        }));
    };

    const removeColor = (modelIndex, colorIndex, e) => {
        e?.preventDefault();
        e?.stopPropagation();
        console.log('Removing color at model:', modelIndex, 'color:', colorIndex);
        setFormData(prev => {
            const newModels = prev.models.map((model, mIdx) =>
                mIdx === modelIndex
                    ? {
                        ...model,
                        colors: model.colors.filter((_, cIdx) => cIdx !== colorIndex)
                    }
                    : model
            );
            return {
                ...prev,
                models: newModels
            };
        });
    };

    // ==================== MEDIA HANDLERS ====================
    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Chỉ chấp nhận file png, jpg, webp
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
        const invalidFile = files.find(file => !allowedTypes.includes(file.type));
        if (invalidFile) {
            alert("Chỉ chấp nhận file ảnh PNG hoặc JPG!");
            return;
        }

        setUploadingMedia(true);
        try {
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);

                const token = localStorage.getItem("accessToken");
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL || "/api"}/upload/image`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': token ? `Bearer ${token}` : ''
                        },
                        body: formData
                    }
                );

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const result = await response.json();
                return result.data;
            });

            const uploadedImages = await Promise.all(uploadPromises);

            setFormData(prev => ({
                ...prev,
                mediaList: [
                    ...prev.mediaList,
                    ...uploadedImages.map((img, idx) => ({
                        id: null,
                        url: img.secureUrl,
                        publicId: img.publicId,
                        isPrimary: prev.mediaList.length === 0 && idx === 0 // First uploaded is primary if no existing
                    }))
                ]
            }));

            toast.success(`Đã upload ${uploadedImages.length} ảnh thành công!`);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Không thể upload ảnh. Vui lòng thử lại!');
        } finally {
            setUploadingMedia(false);
            // Reset file input
            e.target.value = '';
        }
    };

    const addMedia = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        setFormData(prev => ({
            ...prev,
            mediaList: [
                ...prev.mediaList,
                {
                    id: null,
                    url: '',
                    publicId: '',
                    isPrimary: prev.mediaList.length === 0 // First one is primary
                }
            ]
        }));
    };

    const updateMedia = (mediaIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            mediaList: prev.mediaList.map((media, idx) =>
                idx === mediaIndex ? { ...media, [field]: value } : media
            )
        }));
    };

    const removeMedia = (mediaIndex, e) => {
        e?.preventDefault();
        e?.stopPropagation();
        console.log('Removing media at index:', mediaIndex);
        setFormData(prev => {
            const newMediaList = prev.mediaList.filter((_, idx) => idx !== mediaIndex);
            console.log('Media before:', prev.mediaList.length, 'after:', newMediaList.length);
            // If removed primary, set first one as primary
            if (newMediaList.length > 0 && !newMediaList.some(m => m.isPrimary)) {
                newMediaList[0].isPrimary = true;
            }
            return { ...prev, mediaList: newMediaList };
        });
    };

    const setPrimaryMedia = (mediaIndex, e) => {
        e?.preventDefault();
        e?.stopPropagation();
        setFormData(prev => ({
            ...prev,
            mediaList: prev.mediaList.map((media, idx) => ({
                ...media,
                isPrimary: idx === mediaIndex
            }))
        }));
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.productId) {
            toast.error('Vui lòng chọn sản phẩm!');
            return;
        }
        if (!formData.basePrice || !formData.sellPrice) {
            toast.error('Vui lòng nhập giá sản phẩm!');
            return;
        }

        setFormLoading(true);

        try {
            const submitData = {
                productId: formData.productId,
                name: formData.name || null,
                description: formData.description || null,
                basePrice: parseFloat(formData.basePrice),
                sellPrice: parseFloat(formData.sellPrice),
                comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
                // Screen specs
                screenSize: formData.screenSize ? parseFloat(formData.screenSize) : null,
                screenTechnology: formData.screenTechnology || null,
                screenResolution: formData.screenResolution || null,
                refreshRate: formData.refreshRate ? parseInt(formData.refreshRate) : null,
                screenType: formData.screenType || null,
                screenFeatures: formData.screenFeatures || null,
                // Camera specs
                rearCamera: formData.rearCamera || null,
                rearVideo: formData.rearVideo || null,
                rearCameraFeatures: formData.rearCameraFeatures || null,
                frontCamera: formData.frontCamera || null,
                frontVideo: formData.frontVideo || null,
                // Chip specs
                chipset: formData.chipset || null,
                cpu: formData.cpu || null,
                gpu: formData.gpu || null,
                operatingSystem: formData.operatingSystem || null,
                // Connectivity specs
                nfc: formData.nfc || null,
                simType: formData.simType || null,
                network: formData.network || null,
                gps: formData.gps || null,
                wifi: formData.wifi || null,
                bluetooth: formData.bluetooth || null,
                chargingPort: formData.chargingPort || null,
                // Battery specs
                batteryCapacity: formData.batteryCapacity ? parseInt(formData.batteryCapacity) : null,
                chargingPower: formData.chargingPower ? parseInt(formData.chargingPower) : null,
                chargingTechnology: formData.chargingTechnology || null,
                // Dimensions
                dimensions: formData.dimensions || null,
                weight: formData.weight ? parseInt(formData.weight) : null,
                // Other specs
                waterResistance: formData.waterResistance || null,
                sensors: formData.sensors || null,
                releaseTime: formData.releaseTime || null,
                // Related data
                models: formData.models,
                mediaList: formData.mediaList
            };

            const defaultSpecsReset = {
                name: '', description: '', basePrice: '', sellPrice: '', comparePrice: '',
                screenSize: '', screenTechnology: '', screenResolution: '', refreshRate: '', screenType: '', screenFeatures: '',
                rearCamera: '', rearVideo: '', rearCameraFeatures: '', frontCamera: '', frontVideo: '',
                chipset: '', cpu: '', gpu: '', operatingSystem: '',
                nfc: '', simType: '', network: '', gps: '', wifi: '', bluetooth: '', chargingPort: '',
                batteryCapacity: '', chargingPower: '', chargingTechnology: '',
                dimensions: '', weight: '',
                waterResistance: '', sensors: '', releaseTime: '',
                models: [], mediaList: []
            };

            if (modalMode === 'create') {
                // Check if editing existing ProductItem or creating new
                if (editingProductItemId) {
                    await ProductItemService.update(editingProductItemId, submitData);
                    toast.success('Cập nhật biến thể thành công!');
                    // Reload existing items list
                    const response = await ProductItemService.getAllForList({
                        productId: formData.productId,
                        pageSize: 100
                    });
                    setExistingProductItems(response?.data?.items || []);
                    setEditingProductItemId(null);
                    // Reset form for next create
                    setFormData(prev => ({ ...prev, ...defaultSpecsReset }));
                } else {
                    await ProductItemService.create(submitData);
                    toast.success('Tạo biến thể thành công!');
                    // Reload existing items list
                    const response = await ProductItemService.getAllForList({
                        productId: formData.productId,
                        pageSize: 100
                    });
                    setExistingProductItems(response?.data?.items || []);
                    // Reset form for next create
                    setFormData(prev => ({ ...prev, ...defaultSpecsReset }));
                }
            } else if (modalMode === 'edit') {
                await ProductItemService.update(selectedProduct.id, submitData);
                toast.success('Cập nhật sản phẩm thành công!');
                closeModal();
            }
            fetchProducts();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.message || 'Có lỗi xảy ra!');
        } finally {
            setFormLoading(false);
        }
    };

    // Handle delete
    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await ProductItemService.delete(deleteId);
            toast.success('Xóa sản phẩm thành công!');
            setShowDeleteConfirm(false);
            setDeleteId(null);
            fetchProducts();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.message || 'Không thể xóa sản phẩm!');
        }
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusMap = {
            'active': { label: 'Đang bán', class: 'status-active' },
            'inactive': { label: 'Ngừng bán', class: 'status-inactive' },
            'discontinued': { label: 'Ngừng bán', class: 'status-inactive' },
            'draft': { label: 'Nháp', class: 'status-draft' },
            'out_of_stock': { label: 'Hết hàng', class: 'status-out-of-stock' }
        };
        const statusInfo = statusMap[status] || { label: status, class: '' };
        return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
    };

    // Table columns
    const columns = [
        {
            key: 'primaryImageUrl',
            label: 'Ảnh',
            width: '80px',
            render: (value) => (
                <div className="product-image-cell">
                    {value ? (
                        <img src={value} alt="Product" className="product-thumbnail" />
                    ) : (
                        <div className="product-image-placeholder">
                            <i className="bi bi-image"></i>
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'name',
            label: 'Biến thể',
            render: (value, row) => (
                <div className="product-info-cell">
                    <span className="product-name">
                        {row.productName}{value ? ` - ${value}` : ''}
                    </span>
                    <span className="product-brand">{row.brandName}</span>
                </div>
            )
        },
        {
            key: 'sellPrice',
            label: 'Giá bán',
            width: '140px',
            render: (value, row) => (
                <div className="price-cell">
                    <span className="sell-price">{ProductItemService.formatPrice(value)}</span>
                    {row.discountPercent > 0 && (
                        <>
                            <span className="compare-price">{ProductItemService.formatPrice(row.comparePrice)}</span>
                            <span className="discount-badge">-{row.discountPercent}%</span>
                        </>
                    )}
                </div>
            )
        },
        {
            key: 'qtyAvailable',
            label: 'Số lượng',
            width: '100px',
            render: (value) => (
                <span className={`qty-badge ${value <= 0 ? 'qty-zero' : value < 5 ? 'qty-low' : ''}`}>
                    {value}
                </span>
            )
        },
        {
            key: 'categoryName',
            label: 'Danh mục',
            width: '120px'
        },
        {
            key: 'productStatus',
            label: 'Trạng thái',
            width: '120px',
            render: (value) => getStatusBadge(value)
        },
        {
            key: 'averageRating',
            label: 'Đánh giá',
            width: '100px',
            render: (value, row) => (
                <div className="rating-cell">
                    {value ? (
                        <>
                            <i className="bi bi-star-fill text-warning"></i>
                            <span>{value.toFixed(1)}</span>
                            <small>({row.totalRatings})</small>
                        </>
                    ) : (
                        <span className="text-muted">Chưa có</span>
                    )}
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '120px',
            render: (_, row) => (
                <div className="action-buttons">
                    <button
                        className="btn-action btn-view"
                        onClick={(e) => { e.stopPropagation(); openModal('view', row); }}
                        title="Xem chi tiết"
                    >
                        <i className="bi bi-eye"></i>
                    </button>
                    <button
                        className="btn-action btn-edit"
                        onClick={(e) => { e.stopPropagation(); openModal('edit', row); }}
                        title="Chỉnh sửa"
                    >
                        <i className="bi bi-pencil"></i>
                    </button>
                    <button
                        hidden
                        className="btn-action btn-delete"
                        onClick={(e) => { e.stopPropagation(); confirmDelete(row.id); }}
                        title="Xóa"
                    >
                        <i className="bi bi-trash"></i>
                    </button>
                </div>
            )
        }
    ];

    // Status options
    const statusOptions = [
        { value: '', label: 'Tất cả trạng thái' },
        { value: 'active', label: 'Đang bán' },
        { value: 'inactive', label: 'Ngừng bán' }
    ];

    // Sort options
    const sortOptions = [
        { value: 'createdAt', label: 'Ngày tạo' },
        { value: 'sellPrice', label: 'Giá bán' }
    ];

    return (
        <div className="admin-page products-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-content">
                    <div className="page-header-left">
                        <h1 className="page-title">
                            <i className="bi bi-phone"></i>
                            Quản lý sản phẩm
                        </h1>
                    </div>
                    <div className="page-header-right">
                        <button className="btn-refresh" onClick={fetchProducts} disabled={loading}>
                            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
                        </button>
                        <button className="btn-primary-admin" onClick={() => openModal('create')}>
                            <i className="bi bi-plus-lg"></i>
                            Thêm sản phẩm
                        </button>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="table-toolbar">
                <div className="toolbar-left">
                    <div className="search-box">
                        <i className="bi bi-search"></i>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="clear-search" onClick={() => setSearchTerm('')}>
                                <i className="bi bi-x"></i>
                            </button>
                        )}
                    </div>

                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={brandFilter}
                            onChange={(e) => { setBrandFilter(e.target.value); setCurrentPage(0); }}
                        >
                            <option value="">Tất cả hãng</option>
                            {brands.map(brand => (
                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={categoryFilter}
                            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(0); }}
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(0); }}
                        >
                            {sortOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={sortDir}
                            onChange={(e) => { setSortDir(e.target.value); setCurrentPage(0); }}
                        >
                            <option value="DESC">Giảm dần</option>
                            <option value="ASC">Tăng dần</option>
                        </select>
                    </div>
                </div>


            </div>

            {/* Data Table */}
            <DataTable
                title=""
                columns={columns}
                data={products}
                loading={loading}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        Trang {currentPage + 1} / {totalPages}
                    </div>
                    <div className="pagination-buttons">
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(0)}
                            disabled={currentPage === 0}
                        >
                            <i className="bi bi-chevron-double-left"></i>
                        </button>
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                        >
                            <i className="bi bi-chevron-left"></i>
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i;
                            } else if (currentPage < 3) {
                                pageNum = i;
                            } else if (currentPage > totalPages - 4) {
                                pageNum = totalPages - 5 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(pageNum)}
                                >
                                    {pageNum + 1}
                                </button>
                            );
                        })}

                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                            disabled={currentPage === totalPages - 1}
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(totalPages - 1)}
                            disabled={currentPage === totalPages - 1}
                        >
                            <i className="bi bi-chevron-double-right"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* View/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-container modal-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {modalMode === 'create' && (
                                    <>
                                        <i className="bi bi-plus-circle"></i>
                                        Thêm sản phẩm mới
                                    </>
                                )}
                                {modalMode === 'edit' && (
                                    <>
                                        <i className="bi bi-pencil-square"></i>
                                        Chỉnh sửa sản phẩm
                                    </>
                                )}
                                {modalMode === 'view' && (
                                    <>
                                        <i className="bi bi-eye"></i>
                                        Chi tiết sản phẩm
                                    </>
                                )}
                            </h3>
                            <button className="modal-close" onClick={closeModal}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {/* Product Info */}
                                {modalMode === 'view' && selectedProduct && (
                                    <div className="product-modal-header">
                                        <div className="product-modal-image">
                                            {selectedProduct.primaryImageUrl ? (
                                                <img src={selectedProduct.primaryImageUrl} alt={selectedProduct.productName} />
                                            ) : (
                                                <div className="product-image-placeholder-lg">
                                                    <i className="bi bi-phone"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="product-modal-info">
                                            <h4>{selectedProduct.productName}</h4>
                                            <p className="brand-name">{selectedProduct.brandName}</p>
                                            <div className="price-info">
                                                <span className="current-price">
                                                    {ProductItemService.formatPrice(selectedProduct.sellPrice)}
                                                </span>
                                                {selectedProduct.discountPercent > 0 && (
                                                    <>
                                                        <span className="original-price">
                                                            {ProductItemService.formatPrice(selectedProduct.comparePrice)}
                                                        </span>
                                                        <span className="discount">-{selectedProduct.discountPercent}%</span>
                                                    </>
                                                )}
                                            </div>
                                            {/* Models Section */}
                                            {modalMode === 'view' && formData.models?.length > 0 && (
                                                <div className="models-section">
                                                    {/* <h5><i className="bi bi-collection me-2"></i>Phiên bản</h5> */}
                                                    <div className="models-grid">
                                                        {formData.models.map((model, idx) => (
                                                            <div key={model.id || idx} className="model-card">
                                                                {/* <div className="model-name">{model.name}</div> */}
                                                                <div className="model-specs">
                                                                    {model.ramGb && <span>RAM: {model.ramGb}GB</span>}
                                                                    {model.romGb && <span>ROM: {model.romGb}GB</span>}
                                                                    {model.grade && <span>Grade: {model.grade}</span>}
                                                                </div>
                                                                {model.colors?.length > 0 && (
                                                                    <div className="model-colors-list">
                                                                        {model.colors.map((color, cIdx) => (
                                                                            <div key={color.id || cIdx} className="color-item-view">
                                                                                <span
                                                                                    className="color-dot"
                                                                                    style={{ backgroundColor: color.hexCode || '#ccc' }}
                                                                                ></span>
                                                                                <span className="color-name">{color.name || 'N/A'}</span>
                                                                                <span className={`color-qty ${(color.qtyAvailable || 0) === 0 ? 'qty-zero' : (color.qtyAvailable || 0) <= 5 ? 'qty-low' : ''}`}>
                                                                                    SL: {color.qtyAvailable || 0}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Status Update Section - View Mode */}
                                            {modalMode === 'view' && (
                                                <div className="status-section" style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                        <label style={{ fontWeight: '500', minWidth: '120px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <i className="bi bi-toggle-on"></i>
                                                            Trạng thái:
                                                        </label>
                                                        <select
                                                            value={currentStatus}
                                                            onChange={(e) => handleStatusChange(e.target.value)}
                                                            disabled={updatingStatus}
                                                            style={{
                                                                padding: '8px 12px',
                                                                borderRadius: '6px',
                                                                border: '1px solid #dee2e6',
                                                                background: 'white',
                                                                cursor: updatingStatus ? 'not-allowed' : 'pointer',
                                                                opacity: updatingStatus ? 0.6 : 1,
                                                                fontSize: '0.95rem'
                                                            }}
                                                        >
                                                            <option value="active">Đang bán</option>
                                                            <option value="draft">Nháp</option>
                                                            <option value="discontinued">Ngừng sản xuất</option>
                                                        </select>
                                                        {updatingStatus && (
                                                            <span style={{ fontSize: '0.85rem', color: '#6c757d', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                <i className="bi bi-hourglass-split"></i>
                                                                Đang cập nhật...
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {/* {getStatusBadge(selectedProduct.productStatus)} */}
                                        </div>
                                    </div>
                                )}

                                {/* Form Fields */}
                                {modalMode !== 'view' && (
                                    <>
                                        {/* Product Selection - Only show when creating */}
                                        {modalMode === 'create' && (
                                            <div className="product-selection-section">
                                                <div className="section-header">
                                                    <h5><i className="bi bi-box me-2"></i>Chọn sản phẩm</h5>
                                                    <button
                                                        type="button"
                                                        className="btn-add-item"
                                                        onClick={openCreateProductModal}
                                                    >
                                                        <i className="bi bi-plus-lg"></i> Tạo sản phẩm mới
                                                    </button>
                                                </div>

                                                <div className="product-search-wrapper" ref={productSearchRef}>
                                                    <div className="product-search-input-container">
                                                        <i className="bi bi-search product-search-icon"></i>
                                                        <input
                                                            type="text"
                                                            className="form-control product-search-input"
                                                            placeholder="Tìm kiếm sản phẩm theo tên, hãng, danh mục..."
                                                            value={productSearchTerm}
                                                            onChange={handleProductSearch}
                                                            onFocus={() => setShowProductDropdown(true)}
                                                        />
                                                        {formData.productId && (
                                                            <button
                                                                type="button"
                                                                className="product-clear-btn"
                                                                onClick={clearProductSelection}
                                                            >
                                                                <i className="bi bi-x-circle"></i>
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Dropdown Results */}
                                                    {showProductDropdown && (
                                                        <div className="product-search-dropdown">
                                                            {filteredProducts.length === 0 ? (
                                                                <div className="product-search-empty">
                                                                    <i className="bi bi-inbox"></i>
                                                                    <span>Không tìm thấy sản phẩm</span>
                                                                </div>
                                                            ) : (
                                                                filteredProducts.map(prod => (
                                                                    <div
                                                                        key={prod.id}
                                                                        className={`product-search-item ${formData.productId === prod.id ? 'selected' : ''}`}
                                                                        onClick={() => selectProduct(prod)}
                                                                    >
                                                                        <div className="product-search-item-info">
                                                                            <span className="product-search-item-name">{prod.name}</span>
                                                                            <span className="product-search-item-meta">
                                                                                {prod.brandName || 'N/A'} • {prod.categoryName || 'N/A'}
                                                                            </span>
                                                                        </div>
                                                                        {formData.productId === prod.id && (
                                                                            <i className="bi bi-check-lg text-success"></i>
                                                                        )}
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Selected Product Info */}
                                                    {formData.productId && (
                                                        <div className="selected-product-info">
                                                            {(() => {
                                                                const selected = productsList.find(p => p.id === formData.productId);
                                                                return selected ? (
                                                                    <>
                                                                        <i className="bi bi-check-circle text-success me-2"></i>
                                                                        <span><strong>{selected.name}</strong></span>
                                                                        <span className="text-muted ms-2">• Bảo hành: {selected.warrantyMonths || 0} tháng</span>
                                                                    </>
                                                                ) : null;
                                                            })()}
                                                        </div>
                                                    )}

                                                    {/* Existing ProductItems of selected Product */}
                                                    {formData.productId && (
                                                        <div className="existing-product-items-section">
                                                            <div className="existing-items-header">
                                                                <div className="existing-items-title">
                                                                    <i className="bi bi-box-seam me-2"></i>
                                                                    <span>Biến thể đã có</span>
                                                                    <span className="existing-items-count">({existingProductItems.length})</span>
                                                                </div>
                                                                {editingProductItemId && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn-create-new-variant"
                                                                        onClick={clearEditingProductItem}
                                                                    >
                                                                        <i className="bi bi-plus-lg"></i> Tạo mới
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {loadingProductItems ? (
                                                                <div className="existing-items-loading">
                                                                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                                                    <span>Đang tải...</span>
                                                                </div>
                                                            ) : existingProductItems.length === 0 ? (
                                                                <div className="existing-items-empty">
                                                                    <i className="bi bi-inbox"></i>
                                                                    <span>Chưa có biến thể nào - Bạn đang tạo mới</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="existing-items-hint">
                                                                        <i className="bi bi-info-circle me-1"></i>
                                                                        {editingProductItemId
                                                                            ? 'Đang chỉnh sửa biến thể đã chọn'
                                                                            : 'Click vào biến thể để sửa, hoặc nhập thông tin bên dưới để tạo mới'}
                                                                    </div>
                                                                    <div className="existing-items-table">
                                                                        <div className="existing-items-table-header">
                                                                            <div className="col-image">Ảnh</div>
                                                                            <div className="col-price">Giá bán</div>
                                                                            <div className="col-qty">SL</div>
                                                                            <div className="col-models">Models</div>
                                                                            <div className="col-colors">Màu sắc</div>
                                                                        </div>
                                                                        <div className="existing-items-table-body">
                                                                            {existingProductItems.map((item) => (
                                                                                <div
                                                                                    key={item.id}
                                                                                    className={`existing-item-row ${editingProductItemId === item.id ? 'selected' : ''}`}
                                                                                    onClick={() => selectExistingProductItem(item)}
                                                                                >
                                                                                    <div className="col-image">
                                                                                        {item.primaryImageUrl ? (
                                                                                            <img src={item.primaryImageUrl} alt="" />
                                                                                        ) : (
                                                                                            <div className="no-image">
                                                                                                <i className="bi bi-image"></i>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="col-price">
                                                                                        <span className="price-value">{ProductItemService.formatPrice(item.sellPrice)}</span>
                                                                                        {item.discountPercent > 0 && (
                                                                                            <span className="discount-tag">-{item.discountPercent}%</span>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="col-qty">
                                                                                        <span className={`qty-value ${item.qtyAvailable <= 0 ? 'out-of-stock' : item.qtyAvailable < 5 ? 'low-stock' : ''}`}>
                                                                                            {item.qtyAvailable}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="col-models">
                                                                                        {item.modelCount > 0 ? (
                                                                                            <span className="model-badge">{item.modelCount} model</span>
                                                                                        ) : (
                                                                                            <span className="no-data">-</span>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="col-colors">
                                                                                        {item.colorCount > 0 ? (
                                                                                            <span className="color-badge">{item.colorCount} màu</span>
                                                                                        ) : (
                                                                                            <span className="no-data">-</span>
                                                                                        )}
                                                                                    </div>
                                                                                    {editingProductItemId === item.id && (
                                                                                        <div className="selected-indicator">
                                                                                            <i className="bi bi-pencil-fill"></i>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Edit mode - Show product name (readonly) */}
                                        {modalMode === 'edit' && selectedProduct && (
                                            <div className="edit-product-info">
                                                <label className="form-label">Sản phẩm</label>
                                                <div className="readonly-product">
                                                    <i className="bi bi-phone me-2"></i>
                                                    <strong>{selectedProduct.productName}</strong>
                                                    <span className="text-muted ms-2">({selectedProduct.brandName})</span>
                                                </div>
                                            </div>
                                        )}



                                        <div className="form-row">
                                            <div className="form-col">
                                                <FormInput
                                                    label="Tên biến thể"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Nhập tên biến thể (tùy chọn)..."
                                                    leftIcon={<i className="bi bi-tag"></i>}
                                                />
                                                <small className="text-muted">Ví dụ: "128GB - Xanh dương", "Bản Quốc tế", v.v. (Có thể để trống)</small>
                                            </div>
                                            <div className="form-col">
                                                <FormInput
                                                    label="Giá gốc"
                                                    name="basePrice"
                                                    type="number"
                                                    value={formData.basePrice}
                                                    onChange={handleChange}
                                                    placeholder="Nhập giá gốc..."
                                                    leftIcon={<i className="bi bi-currency-dollar"></i>}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-col">
                                                <FormInput
                                                    label="Giá so sánh"
                                                    name="comparePrice"
                                                    type="number"
                                                    value={formData.comparePrice}
                                                    onChange={handleChange}
                                                    placeholder="Nhập giá so sánh..."
                                                    leftIcon={<i className="bi bi-arrow-left-right"></i>}
                                                />
                                            </div>
                                            <div className="form-col">
                                                <FormInput
                                                    label="Giá bán"
                                                    name="sellPrice"
                                                    type="number"
                                                    value={formData.sellPrice}
                                                    onChange={handleChange}
                                                    placeholder="Nhập giá bán..."
                                                    leftIcon={<i className="bi bi-tag"></i>}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* ================= THÔNG SỐ KỸ THUẬT ================= */}
                                        <div className="specs-section editable">
                                            <div className="section-header">
                                                <h5><i className="bi bi-cpu me-2"></i>Thông số kỹ thuật</h5>
                                            </div>

                                            {/* Screen Specs */}
                                            <div className="specs-group">
                                                <h6><i className="bi bi-phone me-2"></i>Màn hình</h6>
                                                <div className="form-row">
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Kích thước (inch)"
                                                            name="screenSize"
                                                            type="number"
                                                            step="0.1"
                                                            value={formData.screenSize}
                                                            onChange={handleChange}
                                                            placeholder="VD: 6.7"
                                                        />
                                                    </div>
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Công nghệ màn hình"
                                                            name="screenTechnology"
                                                            value={formData.screenTechnology}
                                                            onChange={handleChange}
                                                            placeholder="VD: Super Retina XDR"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Độ phân giải"
                                                            name="screenResolution"
                                                            value={formData.screenResolution}
                                                            onChange={handleChange}
                                                            placeholder="VD: 2868 x 1320"
                                                        />
                                                    </div>
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Tần số quét (Hz)"
                                                            name="refreshRate"
                                                            type="number"
                                                            value={formData.refreshRate}
                                                            onChange={handleChange}
                                                            placeholder="VD: 120"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Kiểu màn hình"
                                                            name="screenType"
                                                            value={formData.screenType}
                                                            onChange={handleChange}
                                                            placeholder="VD: Dynamic Island"
                                                        />
                                                    </div>
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Tính năng màn hình"
                                                            name="screenFeatures"
                                                            value={formData.screenFeatures}
                                                            onChange={handleChange}
                                                            placeholder="VD: Always On, HDR, True Tone"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Camera Specs */}
                                            <div className="specs-group">
                                                <h6><i className="bi bi-camera me-2"></i>Camera</h6>
                                                <div className="form-row">
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Camera sau"
                                                            name="rearCamera"
                                                            value={formData.rearCamera}
                                                            onChange={handleChange}
                                                            placeholder="VD: 48MP + 12MP + 12MP"
                                                        />
                                                    </div>
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Quay video (sau)"
                                                            name="rearVideo"
                                                            value={formData.rearVideo}
                                                            onChange={handleChange}
                                                            placeholder="VD: 4K@60fps, HDR"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Tính năng camera sau"
                                                            name="rearCameraFeatures"
                                                            value={formData.rearCameraFeatures}
                                                            onChange={handleChange}
                                                            placeholder="VD: Night mode, HDR, Zoom 5x"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Camera trước"
                                                            name="frontCamera"
                                                            value={formData.frontCamera}
                                                            onChange={handleChange}
                                                            placeholder="VD: 12MP TrueDepth"
                                                        />
                                                    </div>
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Quay video (trước)"
                                                            name="frontVideo"
                                                            value={formData.frontVideo}
                                                            onChange={handleChange}
                                                            placeholder="VD: 4K@30fps"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Chip Specs */}
                                            <div className="specs-group">
                                                <h6><i className="bi bi-cpu me-2"></i>Chip & RAM</h6>
                                                <div className="form-row">
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Chipset"
                                                            name="chipset"
                                                            value={formData.chipset}
                                                            onChange={handleChange}
                                                            placeholder="VD: Apple A19 Pro"
                                                        />
                                                    </div>
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="CPU"
                                                            name="cpu"
                                                            value={formData.cpu}
                                                            onChange={handleChange}
                                                            placeholder="VD: 6 lõi (2 hiệu năng + 4 tiết kiệm)"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="GPU"
                                                            name="gpu"
                                                            value={formData.gpu}
                                                            onChange={handleChange}
                                                            placeholder="VD: GPU 6 lõi"
                                                        />
                                                    </div>
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Hệ điều hành"
                                                            name="operatingSystem"
                                                            value={formData.operatingSystem}
                                                            onChange={handleChange}
                                                            placeholder="VD: iOS 26, Android 15"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Connectivity Specs */}
                                            <div className="specs-group">
                                                <h6><i className="bi bi-wifi me-2"></i>Kết nối</h6>
                                                <div className="form-row">
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Mạng"
                                                            name="network"
                                                            value={formData.network}
                                                            onChange={handleChange}
                                                            placeholder="VD: 5G, 4G LTE"
                                                        />
                                                    </div>
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Loại SIM"
                                                            name="simType"
                                                            value={formData.simType}
                                                            onChange={handleChange}
                                                            placeholder="VD: Dual SIM, eSIM"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Wi-Fi"
                                                            name="wifi"
                                                            value={formData.wifi}
                                                            onChange={handleChange}
                                                            placeholder="VD: Wi-Fi 7"
                                                        />
                                                    </div>
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Bluetooth"
                                                            name="bluetooth"
                                                            value={formData.bluetooth}
                                                            onChange={handleChange}
                                                            placeholder="VD: Bluetooth 6.0"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="NFC"
                                                            name="nfc"
                                                            value={formData.nfc}
                                                            onChange={handleChange}
                                                            placeholder="VD: Có"
                                                        />
                                                    </div>
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="GPS"
                                                            name="gps"
                                                            value={formData.gps}
                                                            onChange={handleChange}
                                                            placeholder="VD: GPS, GLONASS, Galileo"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Cổng sạc"
                                                            name="chargingPort"
                                                            value={formData.chargingPort}
                                                            onChange={handleChange}
                                                            placeholder="VD: USB Type-C"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Battery Specs */}
                                            <div className="specs-group">
                                                <h6><i className="bi bi-battery-charging me-2"></i>Pin & Sạc</h6>
                                                <div className="form-row">
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Dung lượng pin (mAh)"
                                                            name="batteryCapacity"
                                                            type="number"
                                                            value={formData.batteryCapacity}
                                                            onChange={handleChange}
                                                            placeholder="VD: 4500"
                                                        />
                                                    </div>
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Công suất sạc (W)"
                                                            name="chargingPower"
                                                            type="number"
                                                            value={formData.chargingPower}
                                                            onChange={handleChange}
                                                            placeholder="VD: 45"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Công nghệ sạc"
                                                            name="chargingTechnology"
                                                            value={formData.chargingTechnology}
                                                            onChange={handleChange}
                                                            placeholder="VD: MagSafe, Qi2, Sạc nhanh"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dimensions & Other */}
                                            <div className="specs-group">
                                                <h6><i className="bi bi-rulers me-2"></i>Kích thước & Khác</h6>
                                                <div className="form-row">
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Kích thước"
                                                            name="dimensions"
                                                            value={formData.dimensions}
                                                            onChange={handleChange}
                                                            placeholder="VD: 163.4 x 78 x 8.75 mm"
                                                        />
                                                    </div>
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Trọng lượng (gram)"
                                                            name="weight"
                                                            type="number"
                                                            value={formData.weight}
                                                            onChange={handleChange}
                                                            placeholder="VD: 227"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Kháng nước/bụi"
                                                            name="waterResistance"
                                                            value={formData.waterResistance}
                                                            onChange={handleChange}
                                                            placeholder="VD: IP68"
                                                        />
                                                    </div>
                                                    <div className="form-col">
                                                        <FormInput
                                                            label="Thời điểm ra mắt"
                                                            name="releaseTime"
                                                            value={formData.releaseTime}
                                                            onChange={handleChange}
                                                            placeholder="VD: 09/2025"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-col" style={{ flex: '1 1 100%' }}>
                                                        <FormInput
                                                            label="Cảm biến"
                                                            name="sensors"
                                                            value={formData.sensors}
                                                            onChange={handleChange}
                                                            placeholder="VD: Face ID, Vân tay, Gia tốc kế, Con quay hồi chuyển"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mô tả biến thể (ProductItem Description) */}
                                        <div className="editable">
                                            <label className="form-label">
                                                <i className="bi bi-file-text me-2"></i>
                                                Mô tả biến thể
                                            </label>
                                            <SummernoteEditor
                                                value={formData.description}
                                                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                                                placeholder="Nhập mô tả chi tiết cho biến thể sản phẩm..."
                                                height={800}
                                            />
                                            <small className="text-muted">Mô tả chi tiết về tình trạng, đặc điểm riêng của biến thể này</small>
                                        </div>
                                    </>
                                )}
                                {/* Models Section
                                {modalMode === 'view' && formData.models?.length > 0 && (
                                    <div className="models-section">
                                        <h5><i className="bi bi-collection me-2"></i>Phiên bản</h5>
                                        <div className="models-grid">
                                            {formData.models.map((model, idx) => (
                                                <div key={model.id || idx} className="model-card">
                                                    <div className="model-name">{model.name}</div>
                                                    <div className="model-specs">
                                                        {model.ramGb && <span>RAM: {model.ramGb}GB</span>}
                                                        {model.romGb && <span>ROM: {model.romGb}GB</span>}
                                                        {model.grade && <span>Grade: {model.grade}</span>}
                                                    </div>
                                                    {model.colors?.length > 0 && (
                                                        <div className="model-colors">
                                                            {model.colors.map((color, cIdx) => (
                                                                <span
                                                                    key={color.id || cIdx}
                                                                    className="color-dot"
                                                                    style={{ backgroundColor: color.hexCode || '#ccc' }}
                                                                    title={color.name}
                                                                ></span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )} */}

                                {/* Media Section */}
                                {modalMode === 'view' && formData.mediaList?.length > 0 && (
                                    <div className="media-section">
                                        <h5><i className="bi bi-images me-2"></i>Hình ảnh</h5>
                                        <div className="media-grid">
                                            {formData.mediaList.map((media, idx) => (
                                                <div key={media.id || idx} className="media-item">
                                                    <img src={media.url} alt={`Product ${idx + 1}`} />
                                                    {media.isPrimary && (
                                                        <span className="primary-badge">Chính</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <br />

                                {/* Specifications Display - View Mode */}
                                <div className="specs-display-section">
                                    <h5><i className="bi bi-cpu me-2"></i>Thông số kỹ thuật</h5>

                                    {/* Screen */}
                                    {(formData.screenSize || formData.screenTechnology || formData.screenResolution || formData.refreshRate || formData.screenType || formData.screenFeatures) && (
                                        <div className="specs-display-group">
                                            <h6><i className="bi bi-phone me-2"></i>Màn hình</h6>
                                            <div className="specs-grid">
                                                {formData.screenSize && <div className="spec-item"><span className="spec-label">Kích thước:</span> <span className="spec-value">{formData.screenSize}"</span></div>}
                                                {formData.screenTechnology && <div className="spec-item"><span className="spec-label">Công nghệ:</span> <span className="spec-value">{formData.screenTechnology}</span></div>}
                                                {formData.screenResolution && <div className="spec-item"><span className="spec-label">Độ phân giải:</span> <span className="spec-value">{formData.screenResolution}</span></div>}
                                                {formData.refreshRate && <div className="spec-item"><span className="spec-label">Tần số quét:</span> <span className="spec-value">{formData.refreshRate}Hz</span></div>}
                                                {formData.screenType && <div className="spec-item"><span className="spec-label">Kiểu màn hình:</span> <span className="spec-value">{formData.screenType}</span></div>}
                                                {formData.screenFeatures && <div className="spec-item"><span className="spec-label">Tính năng:</span> <span className="spec-value">{formData.screenFeatures}</span></div>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Camera */}
                                    {(formData.rearCamera || formData.rearVideo || formData.rearCameraFeatures || formData.frontCamera || formData.frontVideo) && (
                                        <div className="specs-display-group">
                                            <h6><i className="bi bi-camera me-2"></i>Camera</h6>
                                            <div className="specs-grid">
                                                {formData.rearCamera && <div className="spec-item"><span className="spec-label">Camera sau:</span> <span className="spec-value">{formData.rearCamera}</span></div>}
                                                {formData.rearVideo && <div className="spec-item"><span className="spec-label">Quay video (sau):</span> <span className="spec-value">{formData.rearVideo}</span></div>}
                                                {formData.rearCameraFeatures && <div className="spec-item"><span className="spec-label">Tính năng:</span> <span className="spec-value">{formData.rearCameraFeatures}</span></div>}
                                                {formData.frontCamera && <div className="spec-item"><span className="spec-label">Camera trước:</span> <span className="spec-value">{formData.frontCamera}</span></div>}
                                                {formData.frontVideo && <div className="spec-item"><span className="spec-label">Quay video (trước):</span> <span className="spec-value">{formData.frontVideo}</span></div>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Chip */}
                                    {(formData.chipset || formData.cpu || formData.gpu || formData.operatingSystem) && (
                                        <div className="specs-display-group">
                                            <h6><i className="bi bi-cpu me-2"></i>Chip & RAM</h6>
                                            <div className="specs-grid">
                                                {formData.chipset && <div className="spec-item"><span className="spec-label">Chipset:</span> <span className="spec-value">{formData.chipset}</span></div>}
                                                {formData.cpu && <div className="spec-item"><span className="spec-label">CPU:</span> <span className="spec-value">{formData.cpu}</span></div>}
                                                {formData.gpu && <div className="spec-item"><span className="spec-label">GPU:</span> <span className="spec-value">{formData.gpu}</span></div>}
                                                {formData.operatingSystem && <div className="spec-item"><span className="spec-label">Hệ điều hành:</span> <span className="spec-value">{formData.operatingSystem}</span></div>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Connectivity */}
                                    {(formData.network || formData.simType || formData.wifi || formData.bluetooth || formData.nfc || formData.gps || formData.chargingPort) && (
                                        <div className="specs-display-group">
                                            <h6><i className="bi bi-wifi me-2"></i>Kết nối</h6>
                                            <div className="specs-grid">
                                                {formData.network && <div className="spec-item"><span className="spec-label">Mạng:</span> <span className="spec-value">{formData.network}</span></div>}
                                                {formData.simType && <div className="spec-item"><span className="spec-label">Loại SIM:</span> <span className="spec-value">{formData.simType}</span></div>}
                                                {formData.wifi && <div className="spec-item"><span className="spec-label">Wi-Fi:</span> <span className="spec-value">{formData.wifi}</span></div>}
                                                {formData.bluetooth && <div className="spec-item"><span className="spec-label">Bluetooth:</span> <span className="spec-value">{formData.bluetooth}</span></div>}
                                                {formData.nfc && <div className="spec-item"><span className="spec-label">NFC:</span> <span className="spec-value">{formData.nfc}</span></div>}
                                                {formData.gps && <div className="spec-item"><span className="spec-label">GPS:</span> <span className="spec-value">{formData.gps}</span></div>}
                                                {formData.chargingPort && <div className="spec-item"><span className="spec-label">Cổng sạc:</span> <span className="spec-value">{formData.chargingPort}</span></div>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Battery */}
                                    {(formData.batteryCapacity || formData.chargingPower || formData.chargingTechnology) && (
                                        <div className="specs-display-group">
                                            <h6><i className="bi bi-battery-charging me-2"></i>Pin & Sạc</h6>
                                            <div className="specs-grid">
                                                {formData.batteryCapacity && <div className="spec-item"><span className="spec-label">Dung lượng:</span> <span className="spec-value">{formData.batteryCapacity} mAh</span></div>}
                                                {formData.chargingPower && <div className="spec-item"><span className="spec-label">Công suất sạc:</span> <span className="spec-value">{formData.chargingPower}W</span></div>}
                                                {formData.chargingTechnology && <div className="spec-item"><span className="spec-label">Công nghệ sạc:</span> <span className="spec-value">{formData.chargingTechnology}</span></div>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Dimensions & Other */}
                                    {(formData.dimensions || formData.weight || formData.waterResistance || formData.sensors || formData.releaseTime) && (
                                        <div className="specs-display-group">
                                            <h6><i className="bi bi-rulers me-2"></i>Kích thước & Khác</h6>
                                            <div className="specs-grid">
                                                {formData.dimensions && <div className="spec-item"><span className="spec-label">Kích thước:</span> <span className="spec-value">{formData.dimensions}</span></div>}
                                                {formData.weight && <div className="spec-item"><span className="spec-label">Trọng lượng:</span> <span className="spec-value">{formData.weight}g</span></div>}
                                                {formData.waterResistance && <div className="spec-item"><span className="spec-label">Kháng nước:</span> <span className="spec-value">{formData.waterResistance}</span></div>}
                                                {formData.releaseTime && <div className="spec-item"><span className="spec-label">Ra mắt:</span> <span className="spec-value">{formData.releaseTime}</span></div>}
                                                {formData.sensors && <div className="spec-item spec-wide"><span className="spec-label">Cảm biến:</span> <span className="spec-value">{formData.sensors}</span></div>}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <br />
                                <h5>Mô tả chi tiết</h5>
                                {/* View Details */}
                                {modalMode === 'view' && selectedProduct && (
                                    <div className="view-details">
                                        <div className="detail-row" hidden>
                                            <span className="detail-label">ID:</span>
                                            <span className="detail-value detail-id">#{selectedProduct.id}</span>
                                        </div>
                                        {formData.name && (
                                            <div className="detail-row">
                                                <span className="detail-label">Tên biến thể:</span>
                                                <span className="detail-value">{formData.name}</span>
                                            </div>
                                        )}
                                        <div className="detail-row">
                                            <span className="detail-label">Danh mục:</span>
                                            <span className="detail-value">{selectedProduct.categoryName}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Đánh giá:</span>
                                            <span className="detail-value">
                                                {selectedProduct.averageRating ? (
                                                    <>
                                                        <i className="bi bi-star-fill text-warning me-1"></i>
                                                        {selectedProduct.averageRating.toFixed(1)} ({selectedProduct.totalRatings} đánh giá)
                                                    </>
                                                ) : 'Chưa có đánh giá'}
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Bảo hành:</span>
                                            <span className="detail-value">{selectedProduct.warrantyMonths || 0} tháng</span>
                                        </div>
                                        {selectedProduct.createdAt && (
                                            <div className="detail-row">
                                                <span className="detail-label">Ngày tạo:</span>
                                                <span className="detail-value">
                                                    {new Date(selectedProduct.createdAt).toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                        )}
                                        {formData.description && (
                                            <div className="detail-row description-row">
                                                <span className="detail-label">Mô tả biến thể:</span>
                                                <div className="detail-value description-content" dangerouslySetInnerHTML={{ __html: formData.description }}></div>
                                            </div>
                                        )}

                                    </div>
                                )}



                                {/* Models Section - Edit Mode */}
                                {modalMode !== 'view' && (
                                    <div className="models-section editable">
                                        <div className="section-header">
                                            <h5><i className="bi bi-collection me-2"></i>Phiên bản ({formData.models?.length || 0})</h5>
                                            <button type="button" className="btn-add-item" onClick={addModel}>
                                                <i className="bi bi-plus-lg"></i> Thêm phiên bản
                                            </button>
                                        </div>

                                        {formData.models?.length === 0 && (
                                            <div className="empty-list">
                                                <i className="bi bi-inbox"></i>
                                                <p>Chưa có phiên bản nào</p>
                                            </div>
                                        )}

                                        <div className="models-edit-list">
                                            {formData.models?.map((model, modelIdx) => (
                                                <div key={model.id || modelIdx} className="model-edit-card">
                                                    <div className="model-edit-header">
                                                        <span className="model-number">Phiên bản #{modelIdx + 1}</span>
                                                        <button
                                                            type="button"
                                                            className="btn-remove-item"
                                                            onClick={(e) => removeModel(modelIdx, e)}
                                                            title="Xóa phiên bản"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>

                                                    <div className="model-edit-body">
                                                        <div className="form-row">
                                                            <div className="form-col">
                                                                <label className="form-label">Tên phiên bản</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={model.name || ''}
                                                                    onChange={(e) => updateModel(modelIdx, 'name', e.target.value)}
                                                                    placeholder="VD: 128GB/4GB"
                                                                />
                                                            </div>
                                                            <div className="form-col">
                                                                <label className="form-label">Grade</label>
                                                                <select
                                                                    className="form-control"
                                                                    value={model.grade || ''}
                                                                    onChange={(e) => updateModel(modelIdx, 'grade', e.target.value)}
                                                                >
                                                                    <option value="">Chọn grade</option>
                                                                    <option value="S">S - Như mới</option>
                                                                    <option value="A">A - Đẹp</option>
                                                                    <option value="B">B - Tốt</option>
                                                                    <option value="C">C - Trung bình</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="form-row">
                                                            <div className="form-col">
                                                                <label className="form-label">RAM (GB)</label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    value={model.ramGb || ''}
                                                                    onChange={(e) => updateModel(modelIdx, 'ramGb', e.target.value ? parseInt(e.target.value) : null)}
                                                                    placeholder="VD: 4"
                                                                />
                                                            </div>
                                                            <div className="form-col">
                                                                <label className="form-label">ROM (GB)</label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    value={model.romGb || ''}
                                                                    onChange={(e) => updateModel(modelIdx, 'romGb', e.target.value ? parseInt(e.target.value) : null)}
                                                                    placeholder="VD: 128"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Colors Section */}
                                                        <div className="colors-section">
                                                            <div className="colors-header">
                                                                <span className="colors-title">
                                                                    <i className="bi bi-palette me-1"></i>
                                                                    Màu sắc ({model.colors?.length || 0})
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    className="btn-add-color"
                                                                    onClick={(e) => addColor(modelIdx, e)}
                                                                >
                                                                    <i className="bi bi-plus"></i> Thêm màu
                                                                </button>
                                                            </div>

                                                            <div className="colors-edit-list">
                                                                {model.colors?.map((color, colorIdx) => (
                                                                    <div key={color.id || colorIdx} className="color-edit-item">
                                                                        <input
                                                                            type="color"
                                                                            className="color-picker"
                                                                            value={color.hexCode || '#000000'}
                                                                            onChange={(e) => updateColor(modelIdx, colorIdx, 'hexCode', e.target.value)}
                                                                            title="Chọn màu"
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            className="color-name-input"
                                                                            value={color.name || ''}
                                                                            onChange={(e) => updateColor(modelIdx, colorIdx, 'name', e.target.value)}
                                                                            placeholder="Tên màu (VD: Đen, Trắng)"
                                                                        />
                                                                        <input
                                                                            type="number"
                                                                            className="color-qty-input"
                                                                            value={color.qtyAvailable || 0}
                                                                            onChange={(e) => updateColor(modelIdx, colorIdx, 'qtyAvailable', parseInt(e.target.value) || 0)}
                                                                            placeholder="Số lượng"
                                                                            min="0"
                                                                            title="Số lượng"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="btn-remove-color"
                                                                            onClick={(e) => removeColor(modelIdx, colorIdx, e)}
                                                                            title="Xóa màu"
                                                                        >
                                                                            <i className="bi bi-x"></i>
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}



                                {/* Media Section - Edit Mode */}
                                {modalMode !== 'view' && (
                                    <div className="media-section editable">
                                        <div className="section-header">
                                            <h5><i className="bi bi-images me-2"></i>Hình ảnh ({formData.mediaList?.length || 0})</h5>
                                            <div className="media-upload-buttons">
                                                <label className="btn-upload-file">
                                                    <i className="bi bi-cloud-upload"></i>
                                                    {uploadingMedia ? 'Đang tải...' : 'Tải ảnh lên'}
                                                    <input
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                                        multiple
                                                        onChange={handleFileUpload}
                                                        disabled={uploadingMedia}
                                                        style={{ display: 'none' }}
                                                    />
                                                </label>
                                                <button type="button" className="btn-add-url" onClick={addMedia}>
                                                    <i className="bi bi-link-45deg"></i> Thêm URL
                                                </button>
                                            </div>
                                        </div>

                                        {formData.mediaList?.length === 0 && !uploadingMedia && (
                                            <div className="empty-list media-dropzone">
                                                <i className="bi bi-cloud-arrow-up"></i>
                                                <p>Kéo thả ảnh vào đây hoặc click "Tải ảnh lên"</p>
                                                <small>Hỗ trợ: JPG, PNG, WEBP (tối đa 5MB)</small>
                                            </div>
                                        )}

                                        {uploadingMedia && (
                                            <div className="upload-progress">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Đang tải...</span>
                                                </div>
                                                <span>Đang upload ảnh...</span>
                                            </div>
                                        )}

                                        <div className="media-edit-grid">
                                            {formData.mediaList?.map((media, mediaIdx) => (
                                                <div key={media.id || mediaIdx} className={`media-edit-item ${media.isPrimary ? 'is-primary' : ''}`}>
                                                    <div className="media-preview">
                                                        {media.url ? (
                                                            <img src={media.url} alt={`Media ${mediaIdx + 1}`} />
                                                        ) : (
                                                            <div className="media-placeholder">
                                                                <i className="bi bi-image"></i>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="media-edit-controls">
                                                        {!media.publicId && (
                                                            <input
                                                                type="text"
                                                                className="media-url-input"
                                                                value={media.url || ''}
                                                                onChange={(e) => updateMedia(mediaIdx, 'url', e.target.value)}
                                                                placeholder="URL hình ảnh..."
                                                            />
                                                        )}

                                                        <div className="media-actions">
                                                            <button
                                                                type="button"
                                                                className={`btn-set-primary ${media.isPrimary ? 'active' : ''}`}
                                                                onClick={(e) => setPrimaryMedia(mediaIdx, e)}
                                                                title={media.isPrimary ? 'Ảnh chính' : 'Đặt làm ảnh chính'}
                                                                disabled={media.isPrimary}
                                                            >
                                                                <i className="bi bi-star-fill"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn-remove-media"
                                                                onClick={(e) => removeMedia(mediaIdx, e)}
                                                                title="Xóa ảnh"
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {media.isPrimary && (
                                                        <span className="primary-label">Ảnh chính</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModal}>
                                    {modalMode === 'view' ? 'Đóng' : 'Hủy'}
                                </button>
                                {modalMode !== 'view' && (
                                    <button type="submit" className="btn-submit-modal" disabled={formLoading}>
                                        {formLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-lg"></i>
                                                {modalMode === 'create'
                                                    ? (editingProductItemId ? 'Cập nhật biến thể' : 'Tạo biến thể')
                                                    : 'Lưu thay đổi'}
                                            </>
                                        )}
                                    </button>
                                )}
                                {modalMode === 'view' && (
                                    <button
                                        type="button"
                                        className="btn-submit-modal"
                                        onClick={() => openModal('edit', selectedProduct)}
                                    >
                                        <i className="bi bi-pencil"></i>
                                        Chỉnh sửa
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header delete-header">
                            <div className="delete-icon">
                                <i className="bi bi-exclamation-triangle"></i>
                            </div>
                        </div>
                        <div className="modal-body text-center">
                            <h4>Xác nhận xóa</h4>
                            <p className="text-muted">
                                Bạn có chắc chắn muốn xóa sản phẩm này?<br />
                                Hành động này không thể hoàn tác.
                            </p>
                        </div>
                        <div className="modal-footer justify-center">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className="btn-delete-confirm"
                                onClick={handleDelete}
                            >
                                <i className="bi bi-trash"></i>
                                Xóa sản phẩm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Product Modal */}
            {showCreateProductModal && (
                <div className="modal-overlay" onClick={closeCreateProductModal}>
                    <div className="modal-container modal-md" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                <i className="bi bi-plus-circle"></i>
                                Tạo sản phẩm mới
                            </h3>
                            <button className="modal-close" onClick={closeCreateProductModal}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={handleCreateProduct}>
                            <div className="modal-body">
                                <div className="form-group mb-3">
                                    <label className="form-label">Tên sản phẩm <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={newProductData.name}
                                        onChange={handleNewProductChange}
                                        placeholder="VD: iPhone 14 Pro Max, Samsung Galaxy S24..."
                                        required
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label className="form-label">Mô tả</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        value={newProductData.description}
                                        onChange={handleNewProductChange}
                                        placeholder="Mô tả chi tiết sản phẩm..."
                                        rows={3}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-col">
                                        <label className="form-label">Hãng sản xuất <span className="text-danger">*</span></label>
                                        <select
                                            className="form-control"
                                            name="brandId"
                                            value={newProductData.brandId}
                                            onChange={handleNewProductChange}
                                            required
                                        >
                                            <option value="">-- Chọn hãng --</option>
                                            {brands.map(brand => (
                                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-col">
                                        <label className="form-label">Danh mục <span className="text-danger">*</span></label>
                                        <select
                                            className="form-control"
                                            name="categoryId"
                                            value={newProductData.categoryId}
                                            onChange={handleNewProductChange}
                                            required
                                        >
                                            <option value="">-- Chọn danh mục --</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row mt-3">
                                    <div className="form-col">
                                        <label className="form-label">Trạng thái</label>
                                        <select
                                            className="form-control"
                                            name="status"
                                            value={newProductData.status}
                                            onChange={handleNewProductChange}
                                        >
                                            <option value="active">Đang bán</option>
                                            <option value="inactive">Ngừng bán</option>
                                            <option value="draft">Nháp</option>
                                        </select>
                                    </div>
                                    <div className="form-col">
                                        <label className="form-label">Bảo hành (tháng)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="warrantyMonths"
                                            value={newProductData.warrantyMonths}
                                            onChange={handleNewProductChange}
                                            min={0}
                                            max={120}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeCreateProductModal}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit-modal" disabled={createProductLoading}>
                                    {createProductLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Đang tạo...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg"></i>
                                            Tạo sản phẩm
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
