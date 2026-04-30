import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from 'react';
const ORDER_API_URL = import.meta.env.VITE_ORDER_API_URL ?? 'http://localhost:3004/api/orders';
function App() {
    const [userId, setUserId] = useState('demo-user-1');
    const [productId, setProductId] = useState('sku-001');
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(49.99);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${ORDER_API_URL}?userId=${encodeURIComponent(userId)}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch orders (${response.status})`);
            }
            const payload = (await response.json());
            setOrders(payload.data ?? []);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
        }
        finally {
            setIsLoading(false);
        }
    }, [userId]);
    useEffect(() => {
        void fetchOrders();
    }, [fetchOrders]);
    const totalPending = useMemo(() => {
        return orders
            .filter((order) => order.status === 'pending')
            .reduce((sum, order) => sum + order.totalAmount, 0);
    }, [orders]);
    const handleCreateOrder = async (event) => {
        event.preventDefault();
        setError('');
        try {
            const response = await fetch(ORDER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    items: [
                        {
                            productId,
                            quantity,
                            price,
                        },
                    ],
                }),
            });
            if (!response.ok) {
                throw new Error(`Failed to create order (${response.status})`);
            }
            await fetchOrders();
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
        }
    };
    const handleCancelOrder = async (id) => {
        setError('');
        try {
            const response = await fetch(`${ORDER_API_URL}/${id}/cancel`, {
                method: 'PATCH',
            });
            if (!response.ok) {
                throw new Error(`Failed to cancel order (${response.status})`);
            }
            await fetchOrders();
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
        }
    };
    return (_jsx("main", { className: "min-h-screen bg-slate-50 p-6 md:p-10", children: _jsxs("section", { className: "mx-auto max-w-4xl space-y-6", children: [_jsxs("header", { className: "rounded-xl bg-white p-6 shadow-sm", children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "My Orders" }), _jsx("p", { className: "mt-2 text-slate-600", children: "Create demo orders and track order status for the current account." }), _jsxs("p", { className: "mt-4 text-sm text-slate-700", children: ["Pending total: ", _jsxs("strong", { children: ["$", totalPending.toFixed(2)] })] })] }), _jsxs("form", { onSubmit: handleCreateOrder, className: "grid gap-3 rounded-xl bg-white p-6 shadow-sm md:grid-cols-5", children: [_jsx("input", { className: "rounded-md border border-slate-200 px-3 py-2", value: userId, onChange: (event) => setUserId(event.target.value), placeholder: "User ID", required: true }), _jsx("input", { className: "rounded-md border border-slate-200 px-3 py-2", value: productId, onChange: (event) => setProductId(event.target.value), placeholder: "Product ID", required: true }), _jsx("input", { className: "rounded-md border border-slate-200 px-3 py-2", type: "number", min: 1, value: quantity, onChange: (event) => setQuantity(Number(event.target.value)), required: true }), _jsx("input", { className: "rounded-md border border-slate-200 px-3 py-2", type: "number", min: 0, step: "0.01", value: price, onChange: (event) => setPrice(Number(event.target.value)), required: true }), _jsx("button", { type: "submit", className: "rounded-md bg-slate-900 px-3 py-2 font-semibold text-white", children: "Create Order" })] }), error ? (_jsx("div", { className: "rounded-xl border border-red-200 bg-red-50 p-4 text-red-700", children: error })) : null, _jsxs("section", { className: "rounded-xl bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Order History" }), _jsx("button", { type: "button", onClick: () => void fetchOrders(), className: "rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700", children: "Refresh" })] }), isLoading ? _jsx("p", { className: "text-slate-600", children: "Loading orders..." }) : null, !isLoading && orders.length === 0 ? (_jsx("p", { className: "text-slate-600", children: "No orders found for this user." })) : null, _jsx("ul", { className: "space-y-3", children: orders.map((order) => (_jsxs("li", { className: "rounded-lg border border-slate-200 p-4 text-sm text-slate-700", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsx("strong", { className: "text-slate-900", children: order.id }), _jsx("span", { className: "rounded-full bg-slate-100 px-2 py-0.5 text-xs uppercase", children: order.status })] }), _jsxs("p", { className: "mt-2", children: ["Items: ", order.items.length] }), _jsxs("p", { children: ["Total: $", order.totalAmount.toFixed(2)] }), _jsxs("p", { children: ["Created: ", new Date(order.createdAt).toLocaleString()] }), order.status !== 'cancelled' ? (_jsx("button", { type: "button", onClick: () => void handleCancelOrder(order.id), className: "mt-3 rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700", children: "Cancel Order" })) : null] }, order.id))) })] })] }) }));
}
export default App;
