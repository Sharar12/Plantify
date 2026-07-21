'use client';

// ============================================================
// WISHLIST PAGE — '/wishlist'
// User's saved plants grid with add-to-cart & remove actions
// ============================================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

interface Plant {
  id: number;
  name: string;
  scientific_name: string;
  price: number;
  thumbnail: string;
  category: string;
}

export default function Wishlist() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [wishlistPlants, setWishlistPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    fetchWishlist(userData.id);
  }, [router]);

  const fetchWishlist = async (userId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlists?user_id=${userId}`);
      const data = await res.json();
      setWishlistPlants(data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
    setLoading(false);
  };

  const removeFromWishlist = async (plantId: number) => {
    if (!user) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlists/${plantId}?user_id=${user.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setWishlistPlants(wishlistPlants.filter(p => p.id !== plantId));
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const addToCart = (plant: Plant) => {
    const cart = localStorage.getItem('cart');
    const cartItems = cart ? JSON.parse(cart) : [];
    const existingItem = cartItems.find((item: any) => item.id === plant.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartItems.push({ id: plant.id, name: plant.name, price: plant.price, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cartItems));
    alert('Added to cart!');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  if (loading) return <div className="text-green-600 text-center py-8">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Header user={user} onLogout={handleLogout} />
      <main className="flex-1 max-w-4xl self-center w-full px-4 py-8">
        <button onClick={() => router.back()} className="mb-6 text-sm text-green-600 hover:underline">← Back</button>
        
        <h1 className="text-3xl font-bold text-green-800 mb-6">My Wishlist</h1>
        
        {wishlistPlants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Your wishlist is empty</p>
            <Link href="/plants" className="mt-4 inline-block text-green-600 hover:underline">Browse plants</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistPlants.map((plant) => (
              <div key={plant.id} className="border border-green-200 rounded-lg overflow-hidden">
                <Link href={`/plant/${plant.id}`}>
                  <div className="h-40 bg-green-50 flex items-center justify-center">
                    {plant.thumbnail ? (
                      <img src={plant.thumbnail?.startsWith('http') ? plant.thumbnail : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${plant.thumbnail}`} alt={plant.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl text-green-300">🌿</span>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/plant/${plant.id}`}>
                    <h3 className="font-semibold text-green-800 hover:text-green-600">{plant.name}</h3>
                  </Link>
                  <p className="text-sm text-gray-500 italic">{plant.scientific_name}</p>
                  <p className="font-bold text-green-700 mt-2">TK.{Math.round(plant.price || 0)}</p>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => addToCart(plant)}
                      className="flex-1 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                    >
                      Add to Cart
                    </button>
                    <button 
                      onClick={() => removeFromWishlist(plant.id)}
                      className="px-3 py-2 border border-red-300 text-red-500 text-sm rounded-md hover:bg-red-50"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}