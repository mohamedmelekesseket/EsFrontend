import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ShoppingBag, Mail, Instagram,Twitter,Youtube, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import Loader from './Loader';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProductSelect = ({ setShowBag }) => {
  const location = useLocation();
  const { parentCategoryId, subcategoryId, genre } = location.state || {};
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [showModal,setShowModal]=useState(false)
  const [images, setImages] = useState([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const subcategoriesScrollRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const backdropVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.25,
        ease: "easeOut",
      },
    },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.96,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1], // luxury easing
      },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      y: 10,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const navigate = useNavigate();
  const formatImageUrl = (path) => {
    if (!path) return null;

    const isLocal = window.location.hostname === 'localhost';
    const base = isLocal 
      ? 'http://localhost:2025' 
      : 'https://esseket.duckdns.org';

    // Extract only the filename (e.g., "1766...png")
    // This removes any "/uploads/" or "C:\..." prefix coming from the DB
    const fileName = path.split('/').pop().split('\\').pop();

    return `${base}/uploads/${fileName}`;
  };

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const { data } = await axios.get(`${API_BASE_URL}/Admin/Get-products`);

      // Filter products by subcategory & genre
      const filtered = data.filter(
        p => p.subcategoryId === subcategoryId && p.genre === genre
      );

      setAllProducts(filtered);
      setRelatedProducts(filtered.filter(p => p._id !== id));


      // Find selected product
      const selectedProduct = filtered.find(p => p._id === id);
      if (!selectedProduct) return;
      console.log(selectedProduct.images);
      
      // BASIC INFO
      setProduct(selectedProduct);
      setName(selectedProduct.name || '');
      setPrice(selectedProduct.price || '');
      setDescription(selectedProduct.description || '');

      // COLORS
      const productColors = Array.isArray(selectedProduct.color)
        ? selectedProduct.color
        : [];
      setColors(productColors);

      // SIZES
      // SIZES (FIX)
      // SIZES — FULL FIX
      let parsedSizes = [];

        if (Array.isArray(selectedProduct.size)) {
        if (
          selectedProduct.size.length === 1 &&
          typeof selectedProduct.size[0] === "string" &&
          selectedProduct.size[0].startsWith("[")
        ) {
          // Case: ['["XS","S","M","L","XL"]']
          try {
            parsedSizes = JSON.parse(selectedProduct.size[0]);
          } catch {
            parsedSizes = [];
          }
        } else {
          // Normal array case: ["XS", "S", "M"]
          parsedSizes = selectedProduct.size;
        }
      }

      setSizes(parsedSizes);



      // IMAGES
      const productImages = Array.isArray(selectedProduct.images)
        ? selectedProduct.images
        : [];
      setImages(productImages);
      // DEFAULT COLOR
      if (productColors.length > 0) {
        setSelectedColor(productColors[0]);
      }

      const firstColorImages = productImages.find(
        img => img.color?.toLowerCase() === productColors[0]?.toLowerCase()
      );

      if (firstColorImages?.urls?.length > 0) {
        setImage(formatImageUrl(firstColorImages.urls[0]));
      }


      // RESET SLIDER
      setCurrentImageIndex(0);

    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };



  useEffect(() => {
    if (subcategoryId && genre) {
      fetchProducts();
    }
    setSelectedSize('')
  }, [subcategoryId, genre, id]);

  const getImageByColor = (product, color) => {
    if (!product?.images?.length) return null;
    const match = product.images.find(
      img => img.color?.toLowerCase() === color?.toLowerCase()
    );

    return match?.urls?.[0]
      ? formatImageUrl(match.urls[0])
      : null;

  };




  useEffect(() => {
    if (!selectedColor || !images.length) return;

    const colorObj = images.find(
      img => img.color?.toLowerCase() === selectedColor?.toLowerCase()
    );

    if (colorObj?.urls?.length > 0) {
      const idx = Math.max(0, Math.min(currentImageIndex, colorObj.urls.length - 1));
      setImage(formatImageUrl(colorObj.urls[idx]));
    }
  }, [selectedColor, images, currentImageIndex]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedColor]);

  const scrollSubcategories = (direction) => {
    if (!subcategoriesScrollRef.current) return;
    const scrollAmount = direction === 'left' ? -180 : 180;
    subcategoriesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };


  const scrollToTop = () => {
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleNextImage = () => {
    const colorObj = images.find(img => img.color?.toLowerCase() === selectedColor?.toLowerCase());
    if (colorObj?.urls?.length > 0) {
      setCurrentImageIndex(prev => (prev + 1) % colorObj.urls.length);
    }
  };

  const handlePrevImage = () => {
    const colorObj = images.find(img => img.color?.toLowerCase() === selectedColor?.toLowerCase());
    if (colorObj?.urls?.length > 0) {
      setCurrentImageIndex(prev => (prev - 1 + colorObj.urls.length) % colorObj.urls.length);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      setShowModal(true)
      
      return;
    }
    if (!selectedColor) {
      toast.error("Please select a color", { id: "select-color" });

      return;
    }
    if (!selectedSize) {
      toast.error("You need to select a size", { id: "select-size" });

      return;
    }

    try {
      const cartData = {
        userId: user.id || user._id,
        products: [{ productId: id, quantity: 1, size: selectedSize, color: selectedColor }]
      };

      const res = await axios.post(`${API_BASE_URL}/AddToCart`, cartData, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("Product added to cart successfully!", {
          id: "add-to-cart-success",
        });
      }
    } catch (error) {
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message || "Failed to add product to cart");
      }
      console.error("Error adding to cart:", error);
    }
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNextImage();
    }
    if (isRightSwipe) {
      handlePrevImage();
    }
  };

  const handleMobileImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const clickPosition = y / rect.height;
    
    if (clickPosition < 0.5) {
      handlePrevImage();
    } else {
      handleNextImage();
    }
  };

  const getTotalImages = () => {
    const colorObj = images.find(img => img.color?.toLowerCase() === selectedColor?.toLowerCase());
    return colorObj?.urls?.length || 0;
  };

  return (
    <div className="ProductSelect">
    
      <Loader isLoading={loading} />
      {product && (
        <div style={{ display: 'flex',  width: "100%",overflowX:"hidden" }}>
          <div className="gallery" >
            <div className='Arrow-1' onClick={handlePrevImage}>
              <ArrowLeft style={{ cursor: "pointer", zIndex: '-1' }} />
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
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  />
                )}
              </AnimatePresence>

            </div>
            <div className='Arrow-2' onClick={handleNextImage}>
              <ArrowRight style={{ cursor: "pointer", zIndex: '-1' }} />
            </div>
          </div>

          <div className="ProductSelect-details">
            <h1 className="name">{name}</h1>
            <p className="price">{price}.00 TND</p>

            <div className="colorSection">
              <span style={{fontSize:"13px",color:"gray",fontWeight:"400"}}>Couleur: <span style={{fontSize:"13px",color:"black"}}> {selectedColor}</span></span>
              <div className="colorSwatches">
                {colors.map((color, index) => {
                  const imgUrl = getImageByColor(product, color);
                  const safeImgUrl = imgUrl ? imgUrl.replace(/\\/g, '/') : undefined;
                  return (
                    <div
                      key={index}
                      className='color'
                      onClick={() => setSelectedColor(color)}
                      style={{
                        width: '24px',
                        height: '24px',
                        margin: '5px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border:  '2px solid black',
                        backgroundColor: color,
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        boxShadow: '0 0 0 2px #fff inset',
                      }}
                      title={color}
                    />
                  );
                })}
              </div>
            </div>

            <span style={{color:"gray"}}>Taille</span>
            <div className="sizeSection">
              <div className="sizeOptions">
                {sizes.map((size, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      backgroundColor: selectedSize === size ? 'black' : '',
                      color: selectedSize === size ? 'white' : ''
                    }}
                    className="sizeBtn"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button className="addToCartBtn" onClick={handleAddToCart}>
              AJOUTER AU PANIER <ShoppingBag size={18}/>
            </button>

            <h4 className='PDH4'>✓ Livraison gratuite à partir de 200 TND</h4>
            <h4 className='PDH4'>✓ Retours gratuits sous 14 jours</h4>
            <h4 className='PDH4'>✓ Paiement sécurisé</h4>
          </div>
        </div>
      )}

      <h5 style={{marginLeft:"6%",marginTop:"10%",fontSize:"16px"}}>Complete your look</h5>
      <div className='SubcategoryProduct' style={{ display: 'flex', alignItems: 'center', marginTop: 32 }}>
        <div className='Arrow' onClick={() => scrollSubcategories('left')}>
          <ArrowLeft size={30} style={{ cursor: 'pointer' }} />
        </div>
        <div className="productsSub" ref={subcategoriesScrollRef}>
          {allProducts.map((prod) => {
            return (
              <div key={prod._id} onClick={() => {
                navigate(`/PorductSelecte/${prod._id}`, {
                  state: {
                    parentCategoryId: product.categoryId,
                    subcategoryId: product.subcategoryId,
                    genre: product.genre,
                  }
                });
                scrollToTop();
              }} className='PS'>
                <img   src={formatImageUrl(prod.images[0]?.urls[0])}  alt={prod.name} style={{ width: "100%", height: '95%', objectFit: 'cover'}} />
                <div style={{ fontSize: 12, marginTop: '1%' }}>{prod.name}</div>
              </div>
            );
          })}
        </div>
        <div className='Arrow' onClick={() => scrollSubcategories('right')}>
          <ArrowRight size={30} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* mobile */}
      <div className="mobile-view">
        {product && (
          <>
            <div className="mobile-image-container">
              <button
                className="favorite-btn"
                onClick={() => setIsFavorite(!isFavorite)}
                aria-label="Add to favorites"
              >
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
                      style={{
                        backgroundColor: color,
                        backgroundImage: safeImgUrl ? `url(${safeImgUrl})` : undefined,
                      }}
                    />
                  );
                })}
                {colors.length > 3 && <div className="more-colors">+{colors.length - 3}</div>}
              </div>

              <button
                className="mobile-select-size-btn"
                onClick={()=>(scrollToTop(),handleAddToCart())}
              >
                {selectedSize ? `AJOUTER AU PANIER - ${selectedSize}` : 'SÉLECTIONNER UNE TAILLE'}
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
          {relatedProducts.map((prod, index) =>
            <div key={prod._id || index} id='FeaturedProductCard' className='FeaturedProductCard'
              onClick={() => (navigate(`/PorductSelecte/${prod._id}`, {
                state: {
                  parentCategoryId: prod.categoryId,
                  subcategoryId: prod.subcategoryId,
                  genre: prod.genre,
                }
              }), scrollToTop())}>
              {prod.images?.[0]?.urls?.[0] && (
                <img src={formatImageUrl(prod.images[0].urls[3])} />
              )}


              <h2>{prod.name}</h2>
              <h3>{prod.price} TND</h3>
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="modal-backdrop"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                className="modal"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="close" onClick={() => setShowModal(false)}>
                  ×
                </button>

                <div className="lock-box">🔒</div>

                <h1>Connexion Requise</h1>

                <p>
                  Veuillez vous connecter pour ajouter des articles à votre panier
                  et profiter d'une expérience personnalisée.
                </p>

                <button className="btn-login" onClick={()=>navigate('/SeConnect')}>SE CONNECTER</button>
                {/* <button className="btn-continue">CONTINUER LES ACHATS</button> */}

                <div className="bottom-text">
                  Pas encore de compte ? <span onClick={()=>navigate('/SeConnect')}>Créer un compte</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      )}





     
     <footer className="footer-2">
      <div className="footer-links">
        <a href="#">Conditions générales d'achat</a>
        <span>•</span>
        <a href="#">Conditions générales de #esbeandstyle</a>
        <span>•</span>
        <a href="#">Politique de confidentialité</a>
        <span>•</span>
        <a href="#">Politique de cookies</a>
      </div>
      <div className="footer-copy">© 2025 ESBEAND CLOTHES</div>
    </footer>
    </div>
  );
};

export default ProductSelect;
