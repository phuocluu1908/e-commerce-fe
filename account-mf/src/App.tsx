import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

type OrderItem = {
  productId: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
};

type ApiResponse<T> = {
  message: string;
  data: T;
};

const ORDER_API_URL =
  import.meta.env.VITE_ORDER_API_URL ?? 'http://localhost:3004/api/orders';

function App() {
  const [userId, setUserId] = useState('demo-user-1');
  const [productId, setProductId] = useState('sku-001');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(49.99);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${ORDER_API_URL}?userId=${encodeURIComponent(userId)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch orders (${response.status})`);
      }

      const payload = (await response.json()) as ApiResponse<Order[]>;
      setOrders(payload.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
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

  const handleCreateOrder = async (event: FormEvent<HTMLFormElement>) => {
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    }
  };

  const handleCancelOrder = async (id: string) => {
    setError('');

    try {
      const response = await fetch(`${ORDER_API_URL}/${id}/cancel`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel order (${response.status})`);
      }

      await fetchOrders();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <section className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
          <p className="mt-2 text-slate-600">
            Create demo orders and track order status for the current account.
          </p>
          <p className="mt-4 text-sm text-slate-700">
            Pending total: <strong>${totalPending.toFixed(2)}</strong>
          </p>
        </header>

        <form
          onSubmit={handleCreateOrder}
          className="grid gap-3 rounded-xl bg-white p-6 shadow-sm md:grid-cols-5"
        >
          <input
            className="rounded-md border border-slate-200 px-3 py-2"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="User ID"
            required
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2"
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            placeholder="Product ID"
            required
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2"
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            required
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2"
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(event) => setPrice(Number(event.target.value))}
            required
          />
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-3 py-2 font-semibold text-white"
          >
            Create Order
          </button>
        </form>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        ) : null}

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Order History</h2>
            <button
              type="button"
              onClick={() => void fetchOrders()}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
            >
              Refresh
            </button>
          </div>

          {isLoading ? <p className="text-slate-600">Loading orders...</p> : null}

          {!isLoading && orders.length === 0 ? (
            <p className="text-slate-600">No orders found for this user.</p>
          ) : null}

          <ul className="space-y-3">
            {orders.map((order) => (
              <li
                key={order.id}
                className="rounded-lg border border-slate-200 p-4 text-sm text-slate-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-slate-900">{order.id}</strong>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs uppercase">
                    {order.status}
                  </span>
                </div>
                <p className="mt-2">Items: {order.items.length}</p>
                <p>Total: ${order.totalAmount.toFixed(2)}</p>
                <p>Created: {new Date(order.createdAt).toLocaleString()}</p>

                {order.status !== 'cancelled' ? (
                  <button
                    type="button"
                    onClick={() => void handleCancelOrder(order.id)}
                    className="mt-3 rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700"
                  >
                    Cancel Order
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}

export default App;
