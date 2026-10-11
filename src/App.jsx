import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, ShoppingBag, SlidersHorizontal, Sparkles, X, Plus, Minus, Trash2, RefreshCw, PackageCheck, Heart, ChevronRight, Check } from 'lucide-react'

const API_URL = 'https://fakestoreapi.com/products'
const PRODUCTS_KEY = 'smartstore_products_v1'
const CART_KEY = 'smartstore_cart_v1'
const FILTERS_KEY = 'smartstore_filters_v1'
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export default function App() {
  const savedFilters = readStorage(FILTERS_KEY, { search: '', category: 'all', minPrice: 0, maxPrice: 1000, selectedId: null })
  const [products, setProducts] = useState(() => readStorage(PRODUCTS_KEY, []))
  const [cart, setCart] = useState(() => readStorage(CART_KEY, []))
  const [search, setSearch] = useState(savedFilters.search || '')
  const [debouncedSearch, setDebouncedSearch] = useState(savedFilters.search || '')
  const [category, setCategory] = useState(savedFilters.category || 'all')
  const [minPrice, setMinPrice] = useState(Number(savedFilters.minPrice ?? 0))
  const [maxPrice, setMaxPrice] = useState(Number(savedFilters.maxPrice ?? 1000))
  const [selectedId, setSelectedId] = useState(savedFilters.selectedId ?? null)
  const [loading, setLoading] = useState(products.length === 0)
  const [error, setError] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [showSimilar, setShowSimilar] = useState(false)

  const fetchProducts = useCallback(async (force = false) => {
    if (!force) {
      const cached = readStorage(PRODUCTS_KEY, [])
      if (Array.isArray(cached) && cached.length) {
        setProducts(cached)
        setLoading(false)
        return
      }
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = await response.json()
      if (!Array.isArray(data)) throw new Error('Unexpected API response')
      setProducts(data)
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data))
    } catch {
      setError('We could not load products. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 350)
    return () => clearTimeout(timer)
  }, [search])
  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)) }, [cart])
  useEffect(() => {
    localStorage.setItem(FILTERS_KEY, JSON.stringify({ search, category, minPrice, maxPrice, selectedId }))
  }, [search, category, minPrice, maxPrice, selectedId])

  const categories = useMemo(() => [...new Set(products.map(p => p.category))].sort(), [products])
  const selectedProduct = products.find(p => p.id === selectedId) || null
  const filteredProducts = useMemo(() => products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(debouncedSearch)
    const matchesCategory = category === 'all' || p.category === category
    const matchesPrice = p.price >= minPrice && p.price <= maxPrice
    const matchesSimilar = !showSimilar || !selectedProduct || p.category === selectedProduct.category
    return matchesSearch && matchesCategory && matchesPrice && matchesSimilar
  }), [products, debouncedSearch, category, minPrice, maxPrice, showSimilar, selectedProduct])

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2200) }

  function addToCart(product) {
    setCart(old => {
      const found = old.find(item => item.id === product.id)
      return found ? old.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...old, { id: product.id, title: product.title, price: product.price, image: product.image, quantity: 1 }]
    })
    notify('Added to your bag')
  }
  function changeQuantity(id, delta) {
    setCart(old => old.map(item => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0))
  }
  function resetFilters() {
    setSearch(''); setDebouncedSearch(''); setCategory('all'); setMinPrice(0); setMaxPrice(1000); setShowSimilar(false)
  }
  function chooseProduct(product) {
    setSelectedId(product.id)
    setShowSimilar(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="SmartStore home"><span className="brand-mark"><ShoppingBag size={20}/></span><span>smart<span className="brand-accent">store</span><small>CURATED FINDS, MADE SIMPLE</small></span></a>
      <nav className="desktop-nav"><a className="nav-active" href="#products">Discover</a><a href="#recommendations">Recommendations</a><a href="#about">About</a></nav>
      <button className="cart-button" onClick={() => setCartOpen(true)}><ShoppingBag size={18}/><span>My bag</span><b>{cartCount}</b></button>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> YOUR NEXT FAVORITE THING</div><h1>Good finds.<br/><span>Better choices.</span></h1><p>Explore thoughtful picks across categories. Find your match, discover similar products, and keep everything you love in one place.</p><a className="primary-button" href="#products">Explore products <ChevronRight size={17}/></a><div className="hero-proof"><div className="proof-avatars"><span>✦</span><span>✧</span><span>✺</span></div><span><strong>Curated for you</strong><small>Simple shopping starts here</small></span></div></div>
        <div className="hero-art"><div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div><div className="hero-tag tag-top"><Sparkles size={15}/> A little something special</div><div className="hero-product-card"><div className="hero-product-image"><img src="https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg" alt="Featured everyday backpack"/></div><div className="hero-card-info"><div><span className="mini-label">EDITOR'S PICK</span><strong>Everyday essentials</strong></div><span className="hero-star">✦</span></div></div><div className="floating-chip chip-left"><span className="chip-icon"><Check size={15}/></span><span><b>Smart discovery</b><small>Made to fit your taste</small></span></div><div className="floating-chip chip-right"><span className="sparkle-dot">✦</span><span><b>Good things</b><small>Worth a closer look</small></span></div><div className="hero-tag tag-bottom">FIND YOUR KIND OF GOOD <span>↗</span></div></div>
      </section>

      <section className="stats-row" aria-label="Store highlights"><div><strong>{products.length || '—'}</strong><span>Products to explore</span></div><div><strong>{categories.length || '—'}</strong><span>Unique categories</span></div><div><strong>∞</strong><span>Ways to discover</span></div><div className="stats-note"><Sparkles size={17}/><span>Thoughtful finds, all in one place.</span></div></section>

      <section className="catalog-section" id="products">
        <div className="section-heading"><div><div className="eyebrow">THE COLLECTION</div><h2>Find your next favorite</h2><p>Browse the collection and let a good find find you.</p></div><button className="refresh-button" onClick={() => fetchProducts(true)} disabled={loading}><RefreshCw size={15} className={loading ? 'spin' : ''}/> Refresh products</button></div>
        <div className="catalog-layout">
          <aside className="filters-panel"><div className="filter-heading"><SlidersHorizontal size={17}/><h3>Refine your search</h3></div><label className="field-label" htmlFor="search">Search products</label><div className="search-input"><Search size={17}/><input id="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Try 'jacket' or 'bag'"/><kbd>⌕</kbd></div><p className="hint">Search updates after you pause typing.</p>
            <div className="filter-divider"></div><div className="filter-title-row"><label className="field-label" htmlFor="category">Category</label><span className="filter-count">{categories.length}</span></div><select id="category" value={category} onChange={e => { setCategory(e.target.value); setShowSimilar(false) }}><option value="all">All categories</option>{categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}</select>
            <div className="filter-divider"></div><div className="filter-title-row"><label className="field-label">Price range</label><span className="price-pill">USD</span></div><div className="price-inputs"><label><span>Min price</span><div><span>$</span><input aria-label="Minimum price" type="number" min="0" value={minPrice} onChange={e => setMinPrice(Math.max(0, Number(e.target.value) || 0))}/></div></label><span className="price-dash">—</span><label><span>Max price</span><div><span>$</span><input aria-label="Maximum price" type="number" min="0" value={maxPrice} onChange={e => setMaxPrice(Math.max(0, Number(e.target.value) || 0))}/></div></label></div>{minPrice > maxPrice && <p className="error-text">Minimum price must be lower than maximum.</p>}
            <div className="filter-divider"></div><button className={`similar-toggle ${showSimilar ? 'toggle-on' : ''}`} onClick={() => { if (!selectedProduct) { notify('Choose a product first to find similar items'); return } setShowSimilar(v => !v); setCategory('all') }}><span className="similar-icon"><Sparkles size={16}/></span><span><b>Show similar products</b><small>{selectedProduct ? `Based on ${selectedProduct.category}` : 'Select a product first'}</small></span><span className={`toggle ${showSimilar ? 'on' : ''}`}><i/></span></button><button className="reset-button" onClick={resetFilters}>Reset all filters <X size={14}/></button>
          </aside>

          <div className="product-area" id="recommendations"><div className="results-toolbar"><div><span className="results-count">{filteredProducts.length}</span> products found{debouncedSearch && <span className="search-for"> for “{debouncedSearch}”</span>}</div><div className="sort-note"><span className="live-dot"></span> Latest collection</div></div>
            {selectedProduct && <div className="selected-banner"><img src={selectedProduct.image} alt=""/><span><small>YOU SELECTED</small><b>{selectedProduct.title}</b><em>Choose “Show similar products” to explore more from this category.</em></span><button aria-label="Clear selected product" onClick={() => { setSelectedId(null); setShowSimilar(false) }}><X size={16}/></button></div>}
            {error && <div className="error-panel"><p>{error}</p><button className="primary-button" onClick={() => fetchProducts(true)}>Try again <RefreshCw size={15}/></button></div>}
            {loading && products.length === 0 ? <div className="loading-grid">{Array.from({length:6},(_,i)=><div className="skeleton-card" key={i}><div/><span/><span/><span/></div>)}</div> : !error && filteredProducts.length === 0 ? <div className="empty-state"><span><Search size={25}/></span><h3>No products found</h3><p>Try adjusting your search or widening your price range.</p><button className="primary-button" onClick={resetFilters}>Clear filters</button></div> : <div className="product-grid">{filteredProducts.map((product,index)=><article className={`product-card ${selectedId === product.id ? 'product-selected' : ''}`} key={product.id}><button className="product-image-button" onClick={() => chooseProduct(product)} aria-label={`Select ${product.title}`}><span className="product-number">{String(index+1).padStart(2,'0')}</span><span className="product-image-wrap"><img src={product.image} alt={product.title} loading="lazy"/></span><span className="quick-view">View details <ChevronRight size={14}/></span></button><div className="product-details"><span className="product-category">{product.category}</span><button className="product-title" onClick={() => chooseProduct(product)}>{product.title}</button><div className="product-rating"><span>★</span> {product.rating?.rate ?? '—'} <small>({product.rating?.count ?? 0} reviews)</small></div><div className="product-card-bottom"><strong>{money(product.price)}</strong><button className="add-button" onClick={() => addToCart(product)} aria-label={`Add ${product.title} to bag`}><Plus size={17}/></button></div></div></article>)}</div>}
            <div className="api-note"><span className="api-status"><span></span> API CONNECTED</span><span>Powered by FakeStoreAPI · Cached for your next visit</span></div>
          </div>
        </div>
      </section>
      <section className="bottom-cta" id="about"><div className="cta-icon"><PackageCheck size={24}/></div><div><h3>Your finds, right where you left them.</h3><p>Your bag and filters are saved on this device, so your shopping session is ready when you return.</p></div><button onClick={() => setCartOpen(true)}>View my bag <ChevronRight size={16}/></button></section>
    </main>
    <footer><a className="footer-brand" href="#top">smart<span>store</span></a><span>Made for curious shoppers.</span><span>React · FakeStoreAPI · LocalStorage</span></footer>

    {cartOpen && <div className="drawer-backdrop" onMouseDown={e => { if(e.target === e.currentTarget) setCartOpen(false) }}><aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping bag"><div className="drawer-header"><div><span className="eyebrow">YOUR PICKS</span><h2>My bag <span>({cartCount})</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close bag"><X size={20}/></button></div>{cart.length === 0 ? <div className="cart-empty"><span><ShoppingBag size={28}/></span><h3>Your bag is waiting</h3><p>Add something you love and it will show up here.</p><button className="primary-button" onClick={() => setCartOpen(false)}>Explore products <ChevronRight size={16}/></button></div> : <><div className="cart-items">{cart.map(item=><div className="cart-item" key={item.id}><div className="cart-item-image"><img src={item.image} alt={item.title}/></div><div className="cart-item-info"><strong>{item.title}</strong><span>{money(item.price)}</span><div className="quantity-control"><button onClick={() => changeQuantity(item.id,-1)} aria-label="Decrease quantity"><Minus size={13}/></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id,1)} aria-label="Increase quantity"><Plus size={13}/></button></div></div><button className="remove-item" onClick={() => setCart(old=>old.filter(i=>i.id!==item.id))} aria-label={`Remove ${item.title}`}><Trash2 size={16}/></button></div>)}</div><div className="cart-summary"><div><span>Subtotal</span><strong>{money(cartTotal)}</strong></div><p>Shipping and taxes are calculated at checkout.</p><button className="checkout-button" onClick={() => notify('Demo project — checkout is not connected')}>Continue to checkout <ChevronRight size={17}/></button><button className="clear-cart" onClick={() => setCart([])}>Clear bag</button></div></>}</aside></div>}
    {toast && <div className="toast"><span><Check size={15}/></span>{toast}</div>}
  </div>
}
