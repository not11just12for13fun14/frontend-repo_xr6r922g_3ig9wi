import React, { useEffect, useMemo, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import { Search, ShoppingCart, LogIn, Star, Menu } from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function Navbar({ cartCount, onSearch, query }) {
  const navigate = useNavigate()
  const [text, setText] = useState(query || '')
  useEffect(() => setText(query || ''), [query])

  return (
    <div className="sticky top-0 z-20 bg-blue-600 text-white">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
        <button className="md:hidden"><Menu /></button>
        <div onClick={() => navigate('/')} className="font-bold text-xl cursor-pointer">Flipkart Mini</div>
        <div className="flex-1" />
        <div className="hidden md:flex items-center bg-white rounded overflow-hidden w-full max-w-xl">
          <input value={text} onChange={(e)=>{setText(e.target.value); onSearch?.(e.target.value)}} placeholder="Search for products, brands and more" className="px-3 py-2 flex-1 text-gray-800 outline-none" />
          <button className="bg-blue-500 px-3 py-2"><Search className="text-white" size={18}/></button>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <Link to="/login" className="flex items-center gap-2 hover:underline"><LogIn size={18}/> Login</Link>
          <Link to="/cart" className="relative flex items-center gap-2">
            <ShoppingCart size={18} />
            <span>Cart</span>
            {cartCount>0 && <span className="absolute -top-2 -right-2 bg-orange-500 text-xs px-1.5 rounded-full">{cartCount}</span>}
          </Link>
        </div>
      </div>
      <div className="md:hidden px-4 pb-3">
        <div className="flex items-center bg-white rounded overflow-hidden">
          <input value={text} onChange={(e)=>{setText(e.target.value); onSearch?.(e.target.value)}} placeholder="Search for products, brands and more" className="px-3 py-2 flex-1 text-gray-800 outline-none" />
          <button className="bg-blue-500 px-3 py-2"><Search className="text-white" size={18}/></button>
        </div>
      </div>
    </div>
  )
}

function Rating({ value }) {
  const full = Math.floor(value || 0)
  const hasHalf = value - full >= 0.5
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({length:5}).map((_,i)=> (
        <Star key={i} size={16} className={i < full ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
      ))}
      <span className="ml-1 text-xs text-gray-600">{value?.toFixed?.(1)}</span>
    </div>
  )
}

function ProductCard({ p }) {
  const navigate = useNavigate()
  return (
    <div onClick={()=>navigate(`/product/${p.id}`)} className="bg-white rounded shadow hover:shadow-lg transition cursor-pointer">
      <img src={p.images?.[0]} alt={p.title} className="w-full h-44 object-cover rounded-t" />
      <div className="p-3">
        <div className="font-semibold truncate">{p.title}</div>
        <div className="text-sm text-gray-600">{p.brand}</div>
        <div className="mt-2 flex items-center justify-between">
          <Rating value={p.rating || 4} />
          <div className="font-bold">${p.price}</div>
        </div>
      </div>
    </div>
  )
}

function HomePage({ cart, setQuery, query }) {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('All')

  useEffect(()=>{
    const params = new URLSearchParams()
    if (query) params.append('search', query)
    if (category && category !== 'All') params.append('category', category)
    fetch(`${API_BASE}/api/products?${params.toString()}`)
      .then(r=>r.json()).then(setProducts).catch(()=>{})
  }, [query, category])

  const categories = ['All','Mobiles','Laptops','Accessories','Fashion']

  return (
    <div>
      <div className="bg-blue-50 py-3">
        <div className="max-w-7xl mx-auto px-4 flex gap-3 overflow-x-auto">
          {categories.map(c => (
            <button key={c} onClick={()=>setCategory(c)} className={`px-4 py-2 rounded-full whitespace-nowrap ${category===c? 'bg-blue-600 text-white':'bg-white text-gray-700 border'}`}>{c}</button>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(p => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  )
}

function ProductDetails({ addToCart }) {
  const { id } = useParams()
  const [p, setP] = useState(null)
  const [imgIndex, setImgIndex] = useState(0)

  useEffect(()=>{
    fetch(`${API_BASE}/api/products/${id}`).then(r=>r.json()).then(setP).catch(()=>{})
  }, [id])

  if (!p) return <div className="max-w-5xl mx-auto px-4 py-10">Loading...</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-6">
      <div>
        <img src={p.images?.[imgIndex]} alt={p.title} className="w-full h-80 object-cover rounded" />
        <div className="flex gap-2 mt-3">
          {p.images?.map((src, i)=> (
            <img key={i} src={src} onClick={()=>setImgIndex(i)} className={`h-16 w-16 object-cover rounded cursor-pointer ${i===imgIndex? 'ring-2 ring-blue-600':''}`} />
          ))}
        </div>
      </div>
      <div>
        <div className="text-2xl font-semibold">{p.title}</div>
        <div className="text-gray-600">by {p.brand}</div>
        <div className="mt-2"><Rating value={p.rating || 4}/></div>
        <div className="text-3xl font-bold mt-4">${p.price}</div>
        <div className="mt-4 text-gray-700 whitespace-pre-line">{p.description}</div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {Object.entries(p.specs || {}).map(([k,v]) => (
            <div key={k} className="bg-gray-50 p-2 rounded text-sm"><span className="font-medium">{k}: </span>{String(v)}</div>
          ))}
        </div>
        <button onClick={()=>addToCart(p)} className="mt-6 bg-orange-500 text-white px-5 py-3 rounded hover:bg-orange-600">Add to Cart</button>
      </div>
    </div>
  )
}

function CartPage({ cart, setCart }) {
  const navigate = useNavigate()
  const inc = (id)=> setCart(prev => prev.map(it => it.id===id? {...it, quantity: it.quantity+1}: it))
  const dec = (id)=> setCart(prev => prev.map(it => it.id===id? {...it, quantity: Math.max(1, it.quantity-1)}: it))
  const removeIt = (id)=> setCart(prev => prev.filter(it => it.id!==id))
  const total = cart.reduce((s, it)=> s + it.price * it.quantity, 0)

  useEffect(()=>{
    if (cart.length===0) {
      // preload some demo items so it doesn't look empty
      fetch(`${API_BASE}/api/products`).then(r=>r.json()).then(list=>{
        const demo = list.slice(0,2).map(p => ({...p, quantity: 1}))
        setCart(demo)
      }).catch(()=>{})
    }
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>
      {cart.length===0? (
        <div>Loading cart...</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-white p-3 rounded shadow flex gap-3 items-center">
                <img src={item.images?.[0]} className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-600">{item.brand}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={()=>dec(item.id)} className="px-2 border rounded">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={()=>inc(item.id)} className="px-2 border rounded">+</button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${(item.price*item.quantity).toFixed(2)}</div>
                  <button onClick={()=>removeIt(item.id)} className="text-red-600 text-sm mt-2">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white p-4 rounded shadow h-fit">
            <div className="text-lg font-semibold">Price Details</div>
            <div className="flex justify-between mt-2 text-sm">
              <span>Total</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <button onClick={()=>navigate('/checkout')} className="mt-4 w-full bg-orange-500 text-white py-2 rounded">Proceed to Buy</button>
          </div>
        </div>
      )}
    </div>
  )
}

function CheckoutPage({ cart, setCart }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({name:'', address:'', phone:'', payment_method:'COD'})
  const total = cart.reduce((s, it)=> s + it.price * it.quantity, 0)

  const submit = async (e)=>{
    e.preventDefault()
    const payload = {
      items: cart.map(c => ({ product_id: c.id, title: c.title, price: c.price, quantity: c.quantity, image: c.images?.[0]})),
      ...form
    }
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
      const data = await res.json()
      alert(`Order placed! Total: $${data.total}`)
      setCart([])
      navigate('/')
    } catch {
      alert('Failed to place order')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-3">Delivery details</h2>
        <form onSubmit={submit} className="space-y-3">
          {['name','address','phone'].map(k => (
            <input key={k} required value={form[k]} onChange={(e)=>setForm({...form, [k]: e.target.value})} placeholder={k.charAt(0).toUpperCase()+k.slice(1)} className="w-full border rounded px-3 py-2" />
          ))}
          <select value={form.payment_method} onChange={(e)=>setForm({...form, payment_method:e.target.value})} className="w-full border rounded px-3 py-2">
            <option>COD</option>
            <option>Card</option>
            <option>UPI</option>
          </select>
          <button className="bg-green-600 text-white px-4 py-2 rounded">Place Order (${total.toFixed(2)})</button>
        </form>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-3">Order summary</h2>
        <div className="space-y-2">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-3 rounded shadow flex justify-between">
              <span>{item.title} x {item.quantity}</span>
              <span>${(item.price*item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right font-semibold">Total: ${total.toFixed(2)}</div>
      </div>
    </div>
  )
}

function AuthPage({ mode='login', onAuth }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(mode==='login'? {email:'', password:''} : {name:'', email:'', password:''})
  const submit = async (e) => {
    e.preventDefault()
    const endpoint = mode==='login'? '/api/auth/login' : '/api/auth/signup'
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Auth failed')
      const data = await res.json()
      localStorage.setItem('token', data.token)
      alert('Success!')
      onAuth?.(data)
      navigate('/')
    } catch (e) {
      alert('Failed: ' + e.message)
    }
  }
  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold mb-4">{mode==='login'? 'Login' : 'Create Account'}</h2>
      <form onSubmit={submit} className="space-y-3">
        {mode==='signup' && (
          <input required placeholder="Name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="w-full border rounded px-3 py-2" />
        )}
        <input required type="email" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} className="w-full border rounded px-3 py-2" />
        <input required type="password" placeholder="Password" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} className="w-full border rounded px-3 py-2" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">{mode==='login'? 'Login' : 'Create Account'}</button>
      </form>
      <div className="mt-3 text-sm">
        {mode==='login'? (
          <span>New here? <Link className="text-blue-600" to="/signup">Create an account</Link></span>
        ) : (
          <span>Already have an account? <Link className="text-blue-600" to="/login">Login</Link></span>
        )}
      </div>
    </div>
  )
}

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [list, setList] = useState([])
  const [form, setForm] = useState({ title:'', brand:'', price:0, category:'Mobiles', images:[''], description:'' })

  const load = async ()=>{
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setStats(await res.json())
      const prods = await (await fetch(`${API_BASE}/api/products`)).json()
      setList(prods)
    } catch {}
  }
  useEffect(()=>{ load() }, [])

  const add = async (e)=>{
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const payload = { ...form, price: Number(form.price), images: form.images.filter(Boolean) }
      const res = await fetch(`${API_BASE}/api/products`, { method:'POST', headers:{ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Add failed')
      alert('Product added')
      setForm({ title:'', brand:'', price:0, category:'Mobiles', images:[''], description:'' })
      load()
    } catch (e) {
      alert(e.message)
    }
  }

  const del = async (id)=>{
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/api/products/${id}`, { method:'DELETE', headers:{ Authorization: `Bearer ${token}` }})
      if (res.ok) { alert('Deleted'); load() } else alert('Delete failed')
    } catch {}
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">Users: <b>{stats.users}</b></div>
          <div className="bg-white p-4 rounded shadow">Orders: <b>{stats.orders}</b></div>
          <div className="bg-white p-4 rounded shadow">Products: <b>{stats.products}</b></div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Add Product</h3>
          <form onSubmit={add} className="space-y-2">
            <input required placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} className="w-full border rounded px-3 py-2" />
            <input required placeholder="Brand" value={form.brand} onChange={e=>setForm({...form, brand:e.target.value})} className="w-full border rounded px-3 py-2" />
            <input required type="number" step="0.01" placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full border rounded px-3 py-2" />
            <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="w-full border rounded px-3 py-2">
              {['Mobiles','Laptops','Accessories','Fashion'].map(c=> <option key={c}>{c}</option>)}
            </select>
            <input placeholder="Image URL" value={form.images[0]} onChange={e=>setForm({...form, images:[e.target.value]})} className="w-full border rounded px-3 py-2" />
            <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="w-full border rounded px-3 py-2" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Add</button>
          </form>
        </div>
        <div className="md:col-span-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(p => (
            <div key={p.id} className="bg-white p-3 rounded shadow">
              <img src={p.images?.[0]} className="h-32 w-full object-cover rounded" />
              <div className="mt-2 font-semibold truncate">{p.title}</div>
              <div className="text-sm text-gray-600">${p.price}</div>
              <button onClick={()=>del(p.id)} className="mt-2 text-red-600 text-sm">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Layout() {
  const [cart, setCart] = useState([])
  const [query, setQuery] = useState('')

  const addToCart = (p)=>{
    setCart(prev => {
      const ex = prev.find(x => x.id===p.id)
      if (ex) return prev.map(x => x.id===p.id? {...x, quantity: x.quantity+1 } : x)
      return [...prev, {...p, quantity: 1}]
    })
    alert('Added to cart')
  }

  const cartCount = cart.reduce((s, it)=> s + it.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar cartCount={cartCount} onSearch={setQuery} query={query} />
      <Routes>
        <Route path="/" element={<HomePage cart={cart} setQuery={setQuery} query={query} />} />
        <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} />} />
        <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />} />
        <Route path="/checkout" element={<CheckoutPage cart={cart} setCart={setCart} />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <footer className="mt-10 py-6 text-center text-sm text-gray-500">Built for learning • Flipkart-style UI</footer>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  )
}
