import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import CartService from "../../services/cartService";

// Async thunks
export const fetchCart = createAsyncThunk(
    "cart/fetchCart",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await CartService.getCartByUserId(userId);
            return response.data; // List<CartResponse>
        } catch (error) {
            return rejectWithValue(error.message || "Không thể tải giỏ hàng");
        }
    }
);

export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async ({ userId, productColorId, quantity }, { rejectWithValue }) => {
        try {
            const response = await CartService.addToCart({ userId, productColorId, quantity });
            return response.data; // CartResponse
        } catch (error) {
            return rejectWithValue(error.message || "Không thể thêm vào giỏ hàng");
        }
    }
);

export const updateCartItem = createAsyncThunk(
    "cart/updateCartItem",
    async ({ cartItemId, quantity }, { rejectWithValue }) => {
        try {
            const response = await CartService.updateCartItem(cartItemId, quantity);
            // Nếu quantity <= 0, backend trả về data = null (item đã bị xóa)
            return { cartItemId, data: response.data, deleted: response.data === null };
        } catch (error) {
            return rejectWithValue(error.message || "Không thể cập nhật giỏ hàng");
        }
    }
);

export const removeFromCart = createAsyncThunk(
    "cart/removeFromCart",
    async (cartItemId, { rejectWithValue }) => {
        try {
            await CartService.deleteCartItem(cartItemId);
            return cartItemId;
        } catch (error) {
            return rejectWithValue(error.message || "Không thể xóa sản phẩm");
        }
    }
);

const initialState = {
    items: [],
    loading: false,
    error: null,
    success: null,
    totalItems: 0,
    totalPrice: 0
};

// Utility function to calculate totals
const calculateTotals = (items) => {
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0);
    return { totalItems, totalPrice };
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        clearCartError: (state) => {
            state.error = null;
        },
        clearCartSuccess: (state) => {
            state.success = null;
        },
        resetCart: (state) => {
            state.items = [];
            state.loading = false;
            state.error = null;
            state.success = null;
            state.totalItems = 0;
            state.totalPrice = 0;
        }
    },
    extraReducers: (builder) => {
        // Fetch Cart
        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload || [];
                const totals = calculateTotals(state.items);
                state.totalItems = totals.totalItems;
                state.totalPrice = totals.totalPrice;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Add to Cart
        builder
            .addCase(addToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                state.success = "Đã thêm vào giỏ hàng!";
                // Cập nhật hoặc thêm item
                const newItem = action.payload;
                const existingIndex = state.items.findIndex(
                    item => item.productColorId === newItem.productColorId
                );
                if (existingIndex >= 0) {
                    state.items[existingIndex] = newItem;
                } else {
                    state.items.push(newItem);
                }
                const totals = calculateTotals(state.items);
                state.totalItems = totals.totalItems;
                state.totalPrice = totals.totalPrice;
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Update Cart Item
        builder
            .addCase(updateCartItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.loading = false;
                const { cartItemId, data, deleted } = action.payload;
                if (deleted) {
                    // Item bị xóa (quantity <= 0)
                    state.items = state.items.filter(item => item.id !== cartItemId);
                    state.success = "Đã xóa sản phẩm khỏi giỏ hàng!";
                } else {
                    // Cập nhật item
                    const index = state.items.findIndex(item => item.id === cartItemId);
                    if (index >= 0) {
                        state.items[index] = data;
                    }
                    state.success = "Đã cập nhật giỏ hàng!";
                }
                const totals = calculateTotals(state.items);
                state.totalItems = totals.totalItems;
                state.totalPrice = totals.totalPrice;
            })
            .addCase(updateCartItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Remove from Cart
        builder
            .addCase(removeFromCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(item => item.id !== action.payload);
                state.success = "Đã xóa sản phẩm khỏi giỏ hàng!";
                const totals = calculateTotals(state.items);
                state.totalItems = totals.totalItems;
                state.totalPrice = totals.totalPrice;
            })
            .addCase(removeFromCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearCartError, clearCartSuccess, resetCart } = cartSlice.actions;

export default cartSlice.reducer;
