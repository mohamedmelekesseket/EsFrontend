import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ShoppingBag, Mail, Instagram, Twitter, Youtube, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './Loader';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─── Helpers ────────────────────────────────────────────────────
const formatImageUrl = (path) => {
  if (!path) return null;
  const isLocal = window.location.hostname === 'localhost';
  const base = isLocal ? 'http://localhost:2025' : 'https://esseket.duckdns.org';
  const fileName = path.split('/').pop().split('\\').pop();
  return `${base}/uploads/${fileName}`;
};

const parseSizes = (raw) => {
  if (!Array.isArray(raw)) return [];
  if (raw.length === 1 && typeof raw[0] === 'string' && raw[0].startsWith('[')) {
    try { return JSON.parse(raw[0]); } catch { return []; }
  }
  return raw;
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.96, y: 10, transition: { duration: 0.2, ease: 'easeIn' } },
};

// ─── Component ────────────────────────────────────────────────────
const ProductSelect = ({ setShowBag }) => {
  const location = useLocation();
  const { parentCategoryId, subcategoryId, genre } = location.state || {};
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [product, setProduct] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [images, setImages] = useState([]);
  const [image, setImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  // Auth modal state
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Touch swipe
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const subcategoriesScrollRef = useRef(null);

  const getImageByColor = useCallback((prod, color) => {
    if (!prod?.images?.length) return null;
    const match = prod.images.find(img => img.color?.toLowerCase() === color?.toLowerCase());
    return match?.urls?.[0] ? formatImageUrl(match.urls[0]) : null;
  }, []);

  const getColorImages = useCallback((color) => {
    return images.find(img => img.color?.toLowerCase() === color?.toLowerCase());
  }, [images]);

  const getTotalImages = () => getColorImages(selectedColor)?.urls?.length || 0;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/Admin/Get-products`);
      const filtered = data.filter(p => p.subcategoryId === subcategoryId && p.genre === genre);

      setAllProducts(filtered);
      setRelatedProducts(filtered.filter(p => p._id !== id));

      const selectedProduct = filtered.find(p => p._id === id);
      if (!selectedProduct) {
        toast.error('Product not found');
        return;
      }

      setProduct(selectedProduct);
      setName(selectedProduct.name || '');
      setPrice(selectedProduct.price || '');

      const productColors = Array.isArray(selectedProduct.color) ? selectedProduct.color : [];
      setColors(productColors);
      setSizes(parseSizes(selectedProduct.size));

      const productImages = Array.isArray(selectedProduct.images) ? selectedProduct.images : [];
      setImages(productImages);

      if (productColors.length > 0) {
        setSelectedColor(productColors[0]);
        const firstColorImages = productImages.find(img => img.color?.toLowerCase() === productColors[0]?.toLowerCase());
        if (firstColorImages?.urls?.[0]) setImage(formatImageUrl(firstColorImages.urls[0]));
      }

      setCurrentImageIndex(0);
    } catch {
      toast.error('Failed to load product');
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [id, subcategoryId, genre]);

  useEffect(() => {
    if (subcategoryId && genre) fetchProducts();
    setSelectedSize('');
  }, [subcategoryId, genre, id]);

  // Update displayed image when color or index changes
  useEffect(() => {
    if (!selectedColor || !images.length) return;
    const colorObj = getColorImages(selectedColor);
    if (colorObj?.urls?.length > 0) {
      const idx = Math.max(0, Math.min(currentImageIndex, colorObj.urls.length - 1));
      setImage(formatImageUrl(colorObj.urls[idx]));
    }
  }, [selectedColor, images, currentImageIndex]);

  useEffect(() => { setCurrentImageIndex(0); }, [selectedColor]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

  const handleNextImage = () => {
    const total = getTotalImages();
    if (total > 0) setCurrentImageIndex(prev => (prev + 1) % total);
  };

  const handlePrevImage = () => {
    const total = getTotalImages();
    if (total > 0) setCurrentImageIndex(prev => (prev - 1 + total) % total);
  };

  const handleAddToCart = async () => {
    if (addingToCart) return;
    if (!selectedSize) { toast.error('You need to select a size', { id: 'select-size' }); return; }
    if (!user) { setShowModal(true); return; }
    if (!selectedColor) { toast.error('Please select a color', { id: 'select-color' }); return; }

    setAddingToCart(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/AddToCart`,
        { userId: user.id || user._id, products: [{ productId: id, quantity: 1, size: selectedSize, color: selectedColor }] },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      if (res.status === 200 || res.status === 201) {
        toast.success('Product added to cart successfully!', { id: 'add-to-cart-success' });
        setShowBag(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product to cart', { id: 'productselect-add-cart-error' });
    } finally {
      setAddingToCart(false);
    }
  };

  const SignIn = async () => {
    if (isLoading) return;
    setIsSubmitted(true);
    setEmailError('');
    setPasswordError('');

    if (!email) { setEmailError('Please fill in required field.'); return; }
    if (!password) { setPasswordError('Please fill in required field.'); return; }

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/SignIn`, { email, password }, { withCredentials: true });
      if (res.status === 200) {
        toast.success('Welcome back!', { id: 'productselect-signin-success' });
        const userData = res.data.user || res.data;
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setShowModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed', { id: 'productselect-signin-error' });
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollSubcategories = (direction) => {
    if (!subcategoriesScrollRef.current) return;
    subcategoriesScrollRef.current.scrollBy({ left: direction === 'left' ? -180 : 180, behavior: 'smooth' });
  };

  const handleTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) handleNextImage();
    if (distance < -50) handlePrevImage();
  };

  const handleMobileImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientY - rect.top) / rect.height;
    clickPosition < 0.5 ? handlePrevImage() : handleNextImage();
  };

  const navigateToProduct = (prod) => {
    navigate(`/PorductSelecte/${prod._id}`, {
      state: { parentCategoryId: prod.categoryId, subcategoryId: prod.subcategoryId, genre: prod.genre },
    });
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const SpinnerBtn = ({ label }) => (
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
      <span style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
      {label}
    </span>
  );

  return (
    <div className="ProductSelect">
      <Loader isLoading={loading} />

      {product && (
        <div style={{ display: 'flex', width: '100%', overflowX: 'hidden' }}>
          {/* Desktop Gallery */}
          <div className="gallery">
            <div className='Arrow-1' onClick={handlePrevImage}>
              <ArrowLeft style={{ cursor: 'pointer', zIndex: '-1' }} />
            </div>
            <div className="image-wrapper">
              <AnimatePresence mode="wait">
                {image && (
                  <motion.img
                    key={image}
                    src={image}
                    className='mainImage'
                    alt={name}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  />
                )}
              </AnimatePresence>
            </div>
            <div className='Arrow-2' onClick={handleNextImage}>
              <ArrowRight style={{ cursor: 'pointer', zIndex: '-1' }} />
            </div>
          </div>

          {/* Desktop Details */}
          <div className="ProductSelect-details">
            <h1 className="name">{name}</h1>
            <p className="price">{price}.00 TND</p>

            <div className="colorSection">
              <span style={{ fontSize: '13px', color: 'gray', fontWeight: '400' }}>
                Couleur: <span style={{ fontSize: '13px', color: 'black' }}>{selectedColor}</span>
              </span>
              <div className="colorSwatches">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    className='color'
                    onClick={() => setSelectedColor(color)}
                    style={{ width: '24px', height: '24px', margin: '5px', borderRadius: '50%', cursor: 'pointer', border: '2px solid black', backgroundColor: color, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', boxShadow: '0 0 0 2px #fff inset' }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <span style={{ color: 'gray' }}>Taille</span>
            <div className="sizeSection">
              <div className="sizeOptions">
                {sizes.map((size, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSize(size)}
                    style={{ backgroundColor: selectedSize === size ? 'black' : '', color: selectedSize === size ? 'white' : '' }}
                    className="sizeBtn"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="addToCartBtn"
              onClick={handleAddToCart}
              disabled={addingToCart}
              style={{ opacity: addingToCart ? 0.7 : 1, cursor: addingToCart ? 'not-allowed' : 'pointer' }}
            >
              {addingToCart ? <SpinnerBtn label="Ajout en cours..." /> : <><span>AJOUTER AU PANIER</span> <ShoppingBag size={18} /></>}
            </button>

            <h4 className='PDH4'>✓ Livraison gratuite à partir de 200 TND</h4>
            <h4 className='PDH4'>✓ Retours gratuits sous 14 jours</h4>
            <h4 className='PDH4'>✓ Paiement sécurisé</h4>
          </div>
        </div>
      )}

      {/* Related Products */}
      <h5 style={{ marginLeft: '6%', marginTop: '10%', fontSize: '16px' }}>Complete your look</h5>
      <div className='SubcategoryProduct' style={{ display: 'flex', alignItems: 'center', marginTop: 32 }}>
        <div className='Arrow' onClick={() => scrollSubcategories('left')}>
          <ArrowLeft size={30} style={{ cursor: 'pointer' }} />
        </div>
        <div className="productsSub" ref={subcategoriesScrollRef}>
          {allProducts.map(prod => (
            <div key={prod._id} onClick={() => navigateToProduct(prod)} className='PS'>
              <img
                src={formatImageUrl(prod.images?.[0]?.urls?.[3] ?? prod.images?.[0]?.urls?.[0])}
                alt={prod.name}
                style={{ width: '100%', height: '95%', objectFit: 'cover' }}
                onError={e => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
              />
              <div style={{ fontSize: 12, marginTop: '1%' }}>{prod.name}</div>
            </div>
          ))}
        </div>
        <div className='Arrow' onClick={() => scrollSubcategories('right')}>
          <ArrowRight size={30} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* Mobile View */}
      <div className="mobile-view">
        {product && (
          <>
            <div className="mobile-image-container">
              <button className="favorite-btn" onClick={() => setIsFavorite(prev => !prev)} aria-label="Add to favorites">
                <Heart className={isFavorite ? 'filled' : ''} />
              </button>

              <div
                className="mobile-image-wrapper"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleMobileImageClick}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={image}
                    src={image}
                    className="mobile-product-image"
                    alt={name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
              </div>

              <div className="image-indicators">
                {Array.from({ length: getTotalImages() }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`indicator-dot ${idx === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
            </div>

            <div className="mobile-details">
              <div className="mobile-header">
                <div>
                  <h1 className="mobile-product-name">{name}</h1>
                  <p className="mobile-product-price">{price} TND</p>
                </div>
              </div>

              <div className="mobile-color-selector">
                {colors.map((color, index) => {
                  const imgUrl = getImageByColor(product, color);
                  const safeImgUrl = imgUrl ? imgUrl.replace(/\\/g, '/') : undefined;
                  return (
                    <div
                      key={index}
                      className={`mobile-color-option ${color === selectedColor ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color, backgroundImage: safeImgUrl ? `url(${safeImgUrl})` : undefined }}
                    />
                  );
                })}
                {colors.length > 3 && <div className="more-colors">+{colors.length - 3}</div>}
              </div>

              <button
                className="mobile-select-size-btn"
                onClick={handleAddToCart}
                disabled={addingToCart}
                style={{ opacity: addingToCart ? 0.7 : 1, cursor: addingToCart ? 'not-allowed' : 'pointer' }}
              >
                {addingToCart
                  ? <SpinnerBtn label="Ajout..." />
                  : selectedSize ? `AJOUTER AU PANIER - ${selectedSize}` : 'SÉLECTIONNER UNE TAILLE'
                }
              </button>

              <div className="mobile-size-selector">
                <p className="size-label">Sélectionner une taille:</p>
                <div className="mobile-size-grid">
                  {sizes.map((size, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(size)}
                      className={`mobile-size-option ${selectedSize === size ? 'selected' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        <div className='SearchMobileProductS'>
          {relatedProducts.map((prod, index) => (
            <div
              key={prod._id || index}
              id='FeaturedProductCard'
              className='FeaturedProductCard'
              onClick={() => navigateToProduct(prod)}
            >
              {prod.images?.[0]?.urls?.[0] && (
                <img
                  src={formatImageUrl(prod.images?.[0]?.urls?.[3] ?? prod.images?.[0]?.urls?.[0])}
                  alt={prod.name}
                  onError={e => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                />
              )}
              <h2>{prod.name}</h2>
              <h3>{prod.price} TND</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-backdropV2"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
              className='connectDiv'
            >
              <h3>Connexion / Inscription</h3>
              <div className='Line' />
              <h2>Saisis ton adresse e-mail</h2>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="E-mail"
              />
              {emailError && <p className="error-text">{emailError}</p>}
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && SignIn()}
                placeholder="Password"
                style={{ marginTop: '7%' }}
              />
              {passwordError && <p className="error-text">{passwordError}</p>}
              <Link to='/ResetPassword' style={{ textDecoration: 'none', color: 'black' }}>
                <h4 style={{ marginLeft: '18%', fontSize: '11px' }}>Have you forgotten your password?</h4>
              </Link>
              <motion.button
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className='seconnectBt'
                onClick={SignIn}
                disabled={isLoading}
                style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
              >
                {isLoading ? <SpinnerBtn label="Signing In..." /> : 'Sign In'}
              </motion.button>
              <Link to='/Seconnect' style={{ textDecoration: 'none', color: 'black' }}>
                <h4>You don't have Account? Sign Up</h4>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="footer-2">
        <div className="footer-links">
          <a href="#">Conditions générales d'achat</a><span>•</span>
          <a href="#">Conditions générales de #esbeandstyle</a><span>•</span>
          <a href="#">Politique de confidentialité</a><span>•</span>
          <a href="#">Politique de cookies</a>
        </div>
        <div className="footer-copy">© 2025 ESBEAND CLOTHES</div>
      </footer>
    </div>
  );
};

export default ProductSelect;