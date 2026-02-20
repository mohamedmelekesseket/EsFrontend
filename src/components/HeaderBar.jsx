import React,{useState,useEffect,useMemo,useRef} from 'react'
import * as LucideIcons from "lucide-react";
import { Menu,Search,UserRound,Smartphone,Footprints,Twitter ,Shirt ,X ,LogOut,User,Mail, CreditCard, ArrowLeft ,Truck, MapPin,ShoppingBag,ShieldUser,Edit2,Trash2 ,Dot,MoveRight,MoveLeft,Minus,Plus   } from 'lucide-react';
import { Link, useNavigate,useLocation  } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import EsL from '../images/Es4.png'
import { useAuth } from '../context/AuthContext';
import LogContainer from '../../Es1.png'

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function HeaderBar({showBag,setShowBag}   ) {
  const [categorySelected,setCategorySelected]=useState('')
  const [categorySelectedName,setCategorySelectedName]=useState('')
  const [showMenu,setShowMenu]=useState(false)
  const [showSearch,setShowSearch]=useState(false)
  const [genre,setGenre]=useState('men')
  const { user, setUser } = useAuth();

  const [ShowUser,setShowUser] =useState(false)
  const [HoverCat,setHoverCat] =useState(null)
  const [HoverSub,setHoverSub] =useState(null)
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [Allsubcategories, setAllSubcategories] = useState([]);
  const [productCart, setProductCart] = useState([]);
  const [product, setProduct] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [quantity, setquantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [image, setImage] = useState('');
  const [SearchGenre, setSearchGenre] = useState('Tous');
  const [name, setName] = useState('');
  const [images, setImages] = useState([]);
  const [colors, setColors] = useState([]);
  const [showBagEdit, setShowBagEdit] = useState(false)
  const [editingCartItem, setEditingCartItem] = useState(null)
  const [originalSize, setOriginalSize] = useState('')
  const [originalColor, setOriginalColor] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [Products, setProducts] = useState([]);
  const [AllProducts, setAllProducts] = useState([]);
  const [SearchMobile, setSearchMobile] = useState(false); // LIFTED STATE
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const subcategoriesScrollRef = useRef(null);
  const [isDeletingCart, setIsDeletingCart] = useState(false);
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);
  const [bagLoading, setBagLoading] = useState(false);


  const icons = {
    Shirt,
    ShoppingBag,
    Footprints,
    Smartphone
    // add more icons here
  };
  // Calculate total using useMemo
  const total = useMemo(() => {
    if (!productCart?.cart?.products) return 0;
    return productCart.cart.products.reduce((sum, product) => {
      return sum + (product.productId?.price * product.quantity);
    }, 0);
  }, [productCart]);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const controlHeader = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY) {
      // scrolling down → hide header
      setShowHeader(false);
    } else {
      // scrolling up → show header
      setShowHeader(true);
    }

    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", controlHeader);

    return () => {
      window.removeEventListener("scroll", controlHeader);
    };
  }, [lastScrollY]);

  
  
  const getProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/GetProduct`);
      setAllProducts(res.data)
       const featuredProducts = res.data
        .filter(p => p.isFeatured)
        .slice(0, 4);
       setProducts(featuredProducts);
      
    } catch (error) {
      console.log(error);
      
      toast.error(error.response?.data?.message || "Failed to fetch products", { id: "headerbar-fetch-products-error" });
    }
  };
  const getCategory = async () => {  
    try {
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-category`,{
      });
      setCategories(res.data);            
    } catch (error) {
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message, { id: "headerbar-fetch-category-error" })
      }
    }
  };
  const handleLogout = async () => {
    await axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });

    setUser(null);
    navigate('/');
};

  const getProductCart = async () => {   
    // We still check for user.id to make sure someone is "logged in" 
    // but we don't need the token here anymore.
    if (!user?.id) return; 

    try {
      const res = await axios.get(`${API_BASE_URL}/GetProductCart/${user.id}`, {
        withCredentials: true 
      });
      setProductCart(res.data);
    } catch (error) {
      // If the backend returns 401, it means the cookie is expired or missing
      if (error.response?.status === 401) {
        handleLogout(); // Force logout if session is dead
      }
      console.log(error);
    }
  };
  const getAllSubCategory = async (id) => {  
    try {
      const res = await axios.get(`${API_BASE_URL}/getAllSubCategory`);
      setAllSubcategories(res.data);     
       
    } catch (error) {
      console.log(error);
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message, { id: "headerbar-fetch-category-error" })
      }
    }
  };
  const getSubCategory = async (id) => {  
    try {
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-Subcategory/${id}`);
      setSubcategories(res.data);     
       
    } catch (error) {
      console.log(error);
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message, { id: "headerbar-fetch-category-error" })
      }
    }
  };
  const scrollSubcategories = (direction) => {
    if (!subcategoriesScrollRef.current) return;
    const container = subcategoriesScrollRef.current;
    const scrollAmount = container.offsetWidth * 0.7;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };
  const GetPById = async (id) => {  
    
    try {
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-product/${id}`);     
      setName(res.data.name)
      setProduct(res.data)  
      // console.log('Product data:', res.data);
      // console.log('Product images:', res.data.images);
      setColors(Array.isArray(res.data.color) ? res.data.color : []);
      setSizes(() => {
        try {
          const raw = Array.isArray(res.data.size) ? res.data.size[0] : res.data.size;
          return JSON.parse(raw);
        } catch {
          return [];
        }
      });
      setImages(res.data.images || []);
      if (Array.isArray(res.data.color) && res.data.color.length > 0) {
        setSelectedColor(res.data.color[0]);
      }
      // Set initial image based on the first color
      if (Array.isArray(res.data.color) && res.data.color.length > 0) {
        const initialImage = getImageByColor(res.data, res.data.color[0]);
        setImage(initialImage);
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message, { id: "headerbar-fetch-category-error" })
      }
    }
  };
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


const getImageByColor = (product, color) => {
  if (!product?.images?.length) return '';

  const match = product.images.find(
    img => img.color?.toLowerCase() === color?.toLowerCase()
  );

  if (match?.urls?.[0]) {
    return formatImageUrl(match.urls[0]);
  }
  
  // Fallback to first image of the product
  const fallback = product.images[0];
  if (fallback?.urls?.[0]) {
    return formatImageUrl(fallback.urls[0]);
  }

  return '';
};

  useEffect(() => {
    getCategory();
    getAllSubCategory()
  }, []);
  useEffect(() => {
    getProductCart();
    
  }, [showBag, user?.id]);

  // Handle loader when ShoppingBag opens
  useEffect(() => {
    if (showBag) {
      setBagLoading(true);
      const timer = setTimeout(() => {
        setBagLoading(false);
      }, 1000); // 5 seconds

      return () => clearTimeout(timer);
    } else {
      setBagLoading(false);
    }
  }, [showBag]);

  useEffect(() => {
    getProducts()
  }, []);
  // Handle body overflow when shopping bag is open
  useEffect(() => {
    if (showBag || showBagEdit || showMenu || showSearch || SearchMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup function to restore overflow when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showBag, showBagEdit,showMenu,showSearch,SearchMobile]);


  useEffect(() => {
    setHoverCat('')
    setHoverSub('')
    setCategorySelected('')
  }, [showMenu]);

  // Update image when selected color changes
  useEffect(() => {
    if (product && selectedColor) {
      const newImage = getImageByColor(product, selectedColor);
      setImage(newImage);
    }
  }, [selectedColor, product]);
  



  const DeletePrdCart = async (productToDelete) => {
    if (!user?.id || isDeletingCart) return;
    setIsDeletingCart(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/DeletePrdCart`, {
        data: {
          userId: user.id,
          productId: productToDelete.productId._id,
          size: productToDelete.size,
          color: productToDelete.color
        },
       withCredentials: true
      });

      if (res.status === 200) {
        getProductCart();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeletingCart(false);
    }
  };
  const updateCartItem = async () => {
    if (!user?.id || !editingCartItem || isUpdatingCart) return;
    setIsUpdatingCart(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/cart-update`, {
          userId: user.id,
          cartItemId: editingCartItem._id, // Send the cart item ID for reliable lookup
          productId: product._id,
          size: selectedSize,
          quantity: quantity,
          color: selectedColor,
          originalSize: originalSize, // Original size to find item if cartItemId fails
          originalColor: originalColor // Original color to find item if cartItemId fails
      }, {
       withCredentials: true
      });

      if (res.status === 200) {
        getProductCart();
        setShowBagEdit(false);
        setEditingCartItem(null);
        setOriginalSize('');
        setOriginalColor('');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update cart item", { id: "headerbar-update-cart-error" });
    } finally {
      setIsUpdatingCart(false);
    }
  };
  const filteredProducts = AllProducts.filter(product =>
    product.name.toLowerCase().includes(searchInput.toLowerCase())
  );
  const filteredSubcategory = Allsubcategories.filter(subc =>
    subc.name.toLowerCase().includes(searchInput.toLowerCase())
  );

    const items = [
    { icon: <MapPin size={18} style={{ marginRight: "6px" }} />, text: "Livraison rapide sur toute la Tunisie" },
    { icon: <Mail size={18} style={{ marginRight: "6px" }} />, text: "EsBrand@gmail.com" },
    { icon: <CreditCard size={18} style={{ marginRight: "6px" }} />, text: "Tous les paiements sont acceptés" },
    { icon: <Truck size={18} style={{ marginRight: "6px" }} />, text: "Livraison gratuite à partir de 120 DT" }
  ];


  return (
    <div >
      <AnimatePresence>
        {showBag && (
          <motion.div
            className='overflow-2'
            onClick={() => {
              setShowBagEdit(false);
              setEditingCartItem(null);
              setOriginalSize('');
              setOriginalColor('');
              setShowBag(false); // CLOSE IMMEDIATELY
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <AnimatePresence mode="wait">
              {showBag && (
                <motion.div
                  id="ShoppingBag"
                  key="main-sidebar-container" // Key ensures the container stays stable
                  className={`ShoppingBag ${showBag ? "open" : ""}`}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{
                    opacity: { duration: 0.3, ease: "easeOut" },
                    x: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
                  }}
                  style={{ overflowY: "auto", overflowX: "hidden" }} // Allow vertical scroll, hide horizontal
                  onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside the bag
                >
                  {/* Show loader for 5 seconds when bag opens */}
                  {bagLoading ? (
                    <div className='container'>
                      {/* Central Logo */}
                      <img src={LogContainer} className='containerlogo' alt="" />

                      {/* Animated Ring */}
                      <motion.div
                        className='Ringcontainer'
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear"
                        }}
                      />
                    </div>
                  ) : (
                  /* Inside the sidebar, we switch content based on showBagEdit.
                    We use another AnimatePresence for a smooth internal transition.
                  */
                  <AnimatePresence mode="wait">
                    {!showBagEdit ? (
                      /* VIEW 1: THE CART LIST */
                      <motion.div 
                        key="cart-list-view"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                      >
                        {productCart.cart?.products?.length === 0 || !user ? (
                          <div>
                            <X className='XMobileBag' onClick={() => setShowBag(false)} style={{ cursor: "pointer",color:"gray", marginLeft: "90%",marginTop:"4%" }} />
                            <ArrowLeft className='IconMobileShoppingCard' onClick={() => setShowBag(false)} style={{ cursor: "pointer", marginLeft: "2%" }} />
                            <h3 style={{ textAlign: "center", position: "relative", top: "-10px" }}>ShoppingBag</h3>
                            <div className='EmptyBag' style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                              <ShoppingBag size={60} style={{ color: "#ccc", marginBottom: "15px" }} />
                              <h4 style={{ color: "#000000ff", marginBottom: "10px", fontSize: "18px" }}>Your cart is empty</h4>
                              <p style={{color:"gray",fontSize:"12px"}}>Why not try it with one of our suggestions?</p>
                              <div className='Line'></div>
                              <Link to="/" onClick={() => setShowBag(false)}>
                                {/* <button onClick={() => setShowMenu(true)}>Start Shopping</button> */}
                              </Link>
                              <div className='ShoppingBagProducts'>
                              <h2>You should like this</h2>
                              <div className='ShoppingBagProducts-cards'>
                                {AllProducts.map((prod, index) => {
                                  return (
                                    <div key={prod._id || index}  className='ShoppingBagProducts-card'
                                      onClick={()=>(navigate(`/PorductSelecte/${prod._id}`, {
                                        state: {
                                          parentCategoryId: prod.categoryId,
                                          subcategoryId: prod.subcategoryId,
                                          genre: prod.genre,
                                        }}),setSearchMobile(false))}>
                                    <img
                                        src={formatImageUrl(prod.images?.[0]?.urls?.[3])}
                                        alt={prod.name}
                                        onError={(e) => {
                                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                        }}
                                      />
                                      <h2>{prod.name?.substring(0, 9)}...</h2>
                                      <h3>{prod.price}.00 TND</h3>
                                    </div>
                                  )
                                })}

                              </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className='PdSb'>
                            <div className='PdSbHeader'>
                              <h3>Shopping Bag{<span className='conteurBag'>{productCart.cart?.products?.length}</span>}  </h3>
                              <X onClick={() => setShowBag(false)} style={{ marginRight: "5%", cursor: "pointer", color: "gray" }} />
                            </div>

                            <div className='PdSb-1'>
                              <AnimatePresence>
                                {productCart?.cart?.products?.map((product, index) => {
                                  const imageUrl = getImageByColor(product.productId, product.color, 0);
                                  return (
                                    <motion.div 
                                      className='PdSp-2' 
                                      key={product._id || `${product.productId?._id}-${product.size}-${product.color}`}
                                      initial={{ opacity: 0, y: -20, height: "auto" }}
                                      animate={{ 
                                        opacity: 1, 
                                        y: 0,
                                        height: "auto",
                                        transition: { duration: 0.2 }
                                      }}
                                      exit={{ 
                                        opacity: 0, 
                                        x: -300,
                                        height: 0,
                                        marginBottom: 0,
                                        paddingTop: 0,
                                        paddingBottom: 0,
                                        transition: { 
                                          duration: 0.4, 
                                          ease: [0.4, 0, 0.2, 1]
                                        } 
                                      }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      {imageUrl && <img src={imageUrl} alt="Product" />}
                                      <div className='PdSp-3'>
                                        
                                        <p>{product.productId?.name}</p>
                                        <h4>{product.productId?.price}.00 TND</h4>
                                        <p style={{color:"gray",fontSize:"14px"}} ><span style={{color:"black",fontSize:"14px",fontWeight:"600"}}> </span> {product.size} |<span style={{color:"black",fontWeight:"600"}}></span> {product.color} |<span style={{color:"black",fontWeight:"600"}}></span> {product.quantity} unit</p>
                                        <div className='PdSp-4'>
                                          <Edit2 size={19} onClick={() => {
                                            setEditingCartItem(product);
                                            setquantity(product.quantity);
                                            setSelectedSize(product.size);
                                            setSelectedColor(product.color);
                                            GetPById(product.productId._id);
                                            setShowBagEdit(true); // Switches to Edit view
                                          }} style={{ cursor: "pointer" }} />
                                          <Trash2 size={19} style={{ cursor: "pointer"}} onClick={() => DeletePrdCart(product)} />
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </AnimatePresence>
                              <div className='Line' style={{marginTop:"6%",borderTop:"1px solid gray"}}></div>
                              <div className='ShoppingBagProducts'>
                              <h2>You should like this</h2>
                              <div className='ShoppingBagProducts-cards'>
                                {AllProducts.map((prod, index) => {
                                  return (
                                    <div key={prod._id || index}  className='ShoppingBagProducts-card'
                                      onClick={()=>(navigate(`/PorductSelecte/${prod._id}`, {
                                        state: {
                                          parentCategoryId: prod.categoryId,
                                          subcategoryId: prod.subcategoryId,
                                          genre: prod.genre,
                                        }}),setShowBag(false))}>
                                    <img
                                        src={formatImageUrl(prod.images?.[0]?.urls?.[3])}
                                        alt={prod.name}
                                        onError={(e) => {
                                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                        }}
                                      />
                                      <h2>{prod.name?.substring(0, 9)}...</h2>
                                      <h3>{prod.price}.00 TND</h3>
                                    </div>
                                  )
                                })}

                              </div>
                              </div>
                            </div>
                            <div className='detailsTotal'>
                              <div className='total'>
                                <h2 style={{ color: "black", fontWeight: "500",fontSize:"15px" }}>Total <span style={{color:"gray",fontSize:"11px"}}>TVA comprise </span></h2>
                                <h2 style={{ fontWeight: "600", color: "black" }}>{total + 9.9} TND</h2>
                              </div>
                              <button className='PdSb-bt' onClick={() => (navigate('/Commande'), setShowBag(false))}>Passer Commande</button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      /* VIEW 2: THE EDIT FORM */
                      <motion.div  key="edit-product-view"
                        initial={{ opacity: 0, x: 50 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: 50 }}
                        className="ShoppingBag-Edit" 
                      >
                        {/* Back Button to go back to list */}
                        <div style={{ padding: "10px", display: "flex", alignItems: "center" }}>
                          <ArrowLeft onClick={() => setShowBagEdit(false)} style={{ cursor: "pointer" }} />
                          <h3 style={{ marginLeft: "10px" }}>Modify Item</h3>
                        </div>

                        {image && <img src={image} alt={name}  />}

                        <div className="colorSwatches" style={{margin:"0"}}>
                          {colors.map((color, index) => (
                            <div
                              key={index}
                              onClick={() => setSelectedColor(color)}
                              style={{
                                width: '19px', height: '19px', margin: '5px',  cursor: 'pointer',
                                border: color === selectedColor ? '2px solid #303030' : '2px solid black',
                                backgroundColor: color
                              }}
                            />
                          ))}
                        </div>

                        <div className="sizeSection" style={{margin:"0"}}>
                          <div className="sizeOptions">
                            {sizes.map((size, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedSize(size)}
                                style={{ backgroundColor: selectedSize === size ? 'black' : '',width:"30px",height:"30px", color: selectedSize === size ? 'white' : '' }}
                                className="sizeBtn"
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="quantitySelector" style={{margin:"0"}}>
                          <h4>Quantity</h4>
                          <div className="controls">
                            <button onClick={() => quantity > 1 && setquantity(quantity - 1)}><Minus size={18} /></button>
                            <span className="value">{quantity}</span>
                            <button onClick={() => setquantity(quantity + 1)}><Plus size={18} /></button>
                          </div>
                        </div>

                        <div className='EditShopBorder'>
                          <button className='Update' onClick={updateCartItem}>Update</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  )}
                </motion.div>
              )}
            </AnimatePresence> 
          </motion.div>
        )}
      </AnimatePresence>

      {showSearch && showMenu && (
        <div className='overflow'>
        </div>
      )}
      {location.pathname === "/" && (
        <div className='SearchMobile' onClick={() => setSearchMobile(true)}>
          <Search style={{ cursor: "pointer", position: "absolute", left: "2%" }} />
          <input type="text" placeholder="Search..." />
        </div>
      )}
      {SearchMobile && (
        <div className='SearchMobileComp'>
            <div className='FetchMobile'>
              <Search style={{cursor:"pointer",position:"absolute",left:"2%"}}/>
              <input id="FetchMobile" type="text" placeholder="Search..." />
            </div>
            <X style={{position:'absolute',right:"10px",cursor:"pointer"}} onClick={()=>setSearchMobile(false)} size={20}/>
            <div
              className='SearchMobileCompGenre'
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '16px'
              }}
            >
              <MoveLeft
                size={22}
                onClick={() => scrollSubcategories('left')}
                style={{ cursor: 'pointer' }}
              />
              <div
                ref={subcategoriesScrollRef}
                className='SearchMobileCompGenreList'
                style={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: '0px',
                  padding: '4px 0',
                  paddingRight: '24px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {Allsubcategories.map((subcategory, index) => (
                  <h4
                    key={subcategory._id || index}
                    onClick={() => {
                    navigate(
                      `/ProductU/${subcategory.name}?subcategoryId=${subcategory._id}&genre=${genre}`,
                      {
                        state: {
                          parentCategoryId: subcategory.categoryId,
                          subcategoryId: subcategory._id,
                          genre: subcategory.genre,
                        },
                      }
                    );
                    setSearchMobile(false);
                  }}

                    style={{
                      flex: '0 0 auto',
                      minWidth: '100px',
                      margin: '0',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      color: '#303030',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {subcategory.name}
                  </h4>
                ))}
              </div>
              <MoveRight
                size={22}
                onClick={() => scrollSubcategories('right')}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <h1>You might be interested in</h1>

            <div className='SearchMobileProductS'>
              {AllProducts.map((prod, index) => {
                return (
                  <div key={prod._id || index} id='FeaturedProductCard' className='FeaturedProductCard'
                    onClick={()=>(navigate(`/PorductSelecte/${prod._id}`, {
                      state: {
                        parentCategoryId: prod.categoryId,
                        subcategoryId: prod.subcategoryId,
                        genre: prod.genre,
                      }}),setSearchMobile(false))}>
                   <img
                      src={formatImageUrl(prod.images?.[0]?.urls?.[3])}
                      alt={prod.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                      }}
                    />
                    <h2>{prod.name}</h2>
                    <h3>{prod.price} TND</h3>
                  </div>
                )
              })}
            </div>
        </div>  
      )}

      <div className={`Search ${showSearch ? "open" : ""}`}>
        <div className='divshowSearch'>
          <Search style={{cursor:"pointer",position:"absolute",left:"2%",color:"black"}}/>
          <input 
            id="SearchDesktop"
            type="text"
            className="SearchInput"
            placeholder="Search..."
            onChange={(e)=>setSearchInput(e.target.value)}
            style={{
              opacity: showSearch ? 1 : 0,
              pointerEvents: showSearch ? "auto" : "none",
              transition: "opacity 0.4s ease"
            }}
          />
        </div>
        <X 
          style={{
            position:'absolute',
            right:"10px",
            top: "20px",
            cursor:"pointer",
            color: "black"
          }} 
          onClick={() => setShowSearch(false)} 
          size={20}
        />
        {showSearch && (
          <>
            <div
              className='SearchMobileCompGenre'
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '16px'
              }}
            >
              <MoveLeft
                size={22}
                onClick={() => scrollSubcategories('left')}
                style={{ cursor: 'pointer' }}
              />
              <div
                ref={subcategoriesScrollRef}
                className='SearchMobileCompGenreList'
                style={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: '0px',
                  padding: '4px 0',
                  paddingRight: '24px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {filteredSubcategory.map((subcategory, index) => (
                  <h4
                    key={subcategory._id || index}
                    onClick={() => {
                    navigate(
                      `/ProductU/${subcategory.name}?subcategoryId=${subcategory._id}&genre=${genre}`,
                      {
                        state: {
                          parentCategoryId: subcategory.categoryId,
                          subcategoryId: subcategory._id,
                          genre: subcategory.genre,
                        },
                      }
                    );
                    setShowSearch(false);
                  }}
                    style={{
                      flex: '0 0 auto',
                      minWidth: '100px',
                      margin: '0',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      color: '#303030',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {subcategory.name}
                  </h4>
                ))}
              </div>
              <MoveRight
                size={22}
                onClick={() => scrollSubcategories('right')}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <h1 style={{
              fontSize: '19px',
              fontWeight: 400,
              marginTop: '7%',
              marginLeft: '2%'
            }}>You might be interested in</h1>

            <div className='SearchMobileProductS'>
              {AllProducts.map((prod, index) => {
                return (
                  <div key={prod._id || index} id='FeaturedProductCard' className='FeaturedProductCard'
                    onClick={()=>(navigate(`/PorductSelecte/${prod._id}`, {
                      state: {
                        parentCategoryId: prod.categoryId,
                        subcategoryId: prod.subcategoryId,
                        genre: prod.genre,
                      }}),setShowSearch (false))}>
                      <img
                        src={formatImageUrl(prod.images?.[0]?.urls?.[3])}
                        alt={prod.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                    <h2>{prod.name}</h2>
                    <h3 style={{fontWeight:"700"}}>{prod.price}.00 TND</h3>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <div    className='HeaderBar slide-down'>
        <div className='HeaderBar-1'>
          <Menu className='IconMenuHead' onClick={()=>(setShowMenu(!showMenu),setShowUser(false),setShowBag(false))} size={25} strokeWidth={3} style={{color:"white",cursor:"pointer",backgroundColor:"transparent"}}/>
          {/* <Menu className='IconMenuHead' onClick={()=>(setShowMenu(!showMenu),setShowUser(false),setShowBag(false))} size={45} strokeWidth={3} style={{color:"white",cursor:"pointer"}}/> */}
          <Link className='esLogoHead'  to='/' style={{textDecoration:"none",color:"white"}}>
            <img src={EsL} onClick={()=>(setShowMenu(false),setShowBag(false))}   alt="" />
          </Link>
          <div className='HeaderBar-3'> 
            <div className='HeaderIcons'>
              <div className="HeaderBar-4">
                {user ? (
                  <User  onClick={()=>(setShowMenu(false),setShowUser(!ShowUser),setIsDropdownOpen(true),setShowBag(false))} style={{cursor:"pointer",color:"white"}}/> 
                ):(
                  <Link to='/Seconnect'onClick={()=>(setShowMenu(false),setShowBag(false))}>
                  <button >Sign In <UserRound size={15} style={{position:"relative",left:"5px",top:"2px"}}/></button>
                  </Link>
                )}
              </div>
              <Search className='SearchX' onClick={()=>(setShowSearch(!showSearch))} style={{color:"white",cursor:"pointer"}}/>
              <ShoppingBag onClick={()=>(setShowMenu(false),setShowUser(false),setShowBag(!showBag))} style={{cursor:"pointer",color:"white"}}/>
              {
                productCart.cart?.products?.length === 0 ?(
                  ''
                ):(
                  <div className='CountPCart' style={{display:!user?'none':''}} onClick={()=>(setShowMenu(false),setShowBag(!showBag))}>{productCart.cart?.products?.length}</div>
                )
              }  
            </div>

          </div>
        </div> 
        
        <AnimatePresence>
          {showMenu && (
            <motion.div
              className='MenuUser'
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "90vh", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.3, ease: "easeOut" }
              }}
              style={{
                paddingBottom: "2%",
                overflow: "hidden"
              }}
            >
          <div>
          <X onClick={()=>setShowMenu(false)} style={{display: showMenu ?"":"none",cursor:"pointer", marginLeft:"90%"}}/>
          {/* <div className='MenuGenre' style={{display: showMenu ?"":"none"}}>
            <h2 onClick={()=>setGenre('men')} style={{fontWeight: genre === 'men' ?'':'300',color: genre === "men" ?"white":'gray'}}>Men</h2>
            <h2 onClick={()=>setGenre('women')}  style={{fontWeight: genre === 'women' ?'':'300',color: genre === "women" ?"white":'gray'}}>women</h2>
          </div> */}
          </div>
          <div style={{display:"flex",width:"100%"}}>
            <div className="list-1" >
              {categorySelected === '' ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="categories"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.4 }}
                  >
                {categories.map((category, index) => {
                  const iconName = typeof category.icon === 'string' ? category.icon.trim() : ''
                  const IconComponent = LucideIcons[iconName] || LucideIcons.Dot; // fallback to Dot if invalid

                  return (
                    <motion.span
                      key={category._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
                      style={{
                        display: showMenu === false ? "none" : "",
                      }}
                      className="SpanList"
                    >
                      {HoverCat === category._id ? (
                        <MoveRight style={{color:"#d2b285"}} />
                      ) : (
                        IconComponent && <IconComponent size={19}  />
                      )}

                      <h2
                        style={{
                          fontWeight: category._id === categorySelected ? "700" : "",
                        }}
                        onMouseEnter={() => setHoverCat(category._id)}
                        onMouseLeave={() => setHoverCat(null)}
                        onClick={() => {
                          getSubCategory(category._id);
                          setCategorySelectedName(category.name);
                          setCategorySelected(category._id);
                        }}
                      >
                        {category.name}
                      </h2>
                    </motion.span>
                  );
                })}


                  </motion.div>
                </AnimatePresence>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="subcategories"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4 }}
                  >
                    <span style={{ paddingBottom: "4%" }}>
                      <span
                        style={{ display: showMenu === false ? "none" : "", transition: "all 0.5s", padding: "2px" }}
                        className="SpanList"
                      >
                        <MoveLeft
                          style={{ cursor: "pointer",color:"#FBCA00" }}
                          onClick={() => {
                            setCategorySelected("");
                            setHoverCat("");
                          }}
                        />
                        <h3 style={{ margin: "0", marginLeft: "5%",color:"#FBCA00" }}>{categorySelectedName}</h3>
                      </span>

                      {subcategories.filter((subcategory) => subcategory.genre === genre).map((subcategory) => {
                        const parentCategory = categories.find((cat) => cat._id === subcategory.categoryId);
                        return (
                          <span
                            key={subcategory._id}
                            style={{ display: showMenu === false ? "none" : "", transition: "all 0.5s" }}
                            className="SpanList"
                          >
                            {HoverSub === subcategory._id ? <MoveRight /> : <Dot />}
                            <h2
                              onClick={() => {
                                navigate(
                                  `/ProductU/${subcategory.name}?subcategoryId=${subcategory._id}&genre=${genre}`,
                                  {
                                    state: {
                                      parentCategoryId: parentCategory ? parentCategory._id : "unknown",
                                      subcategoryId: subcategory._id,
                                      genre: genre,
                                    },
                                  }
                                );
                                setShowMenu(false);
                              }}
                              onMouseEnter={() => setHoverSub(subcategory._id)}
                              onMouseLeave={() => setHoverSub(null)}
                            >
                              {subcategory.name}
                            </h2>
                          </span>
                        );
                      })}
                    </span>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
            </motion.div>
          )}
        </AnimatePresence>
       
        


        {user && ShowUser && (
              <div className="user-menu">
                <div className='user-header'>
                  <div className="user-info">
                    {/* <div className="user-name">{user?.firstName} {user?.lastName}</div> */}
                    <div className="user-email">{user?.email}</div>
                    {/* <div className="user-role">
                      {user?.role === 'Admin' && 'Administrateur'}
                      {user?.role === 'Technician' && 'Technicien'}
                      {user?.role === 'client' && 'Client'}
                    </div> */}
                  </div>
                  
                </div>
                <Link to="/Coming" onClick={()=>(setIsDropdownOpen(false),setShowUser(false))} className="dropdown-item"><User size={16} /> Mon Profil</Link>
                {/* {(user?.role === 'Admin' || user?.role === 'Owner') && (
                )} */}
                  <Link
                    to="/ManagementDashboard"
                    onClick={() => (setIsDropdownOpen(false),setShowUser(false))}
                    className="dropdown-item"
                  >
                    <ShieldUser size={16} /> Administration
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item"><LogOut size={16} /> Déconnexion</button>
              </div>
            )}
      </div>
    </div>

  )
}

export default HeaderBar