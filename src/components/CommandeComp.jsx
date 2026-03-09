import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck, ChevronDown, ChevronUp, MoveRight, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PROVINCES = [
  'Ariana','Béja','Ben Arous','Bizerte','Gabès','Gafsa','Jendouba','Kairouan',
  'Kasserine','Kébili','Le Kef','Mahdia','La Manouba','Médenine','Monastir',
  'Nabeul','Sfax','Sidi Bouzid','Siliana','Sousse','Tataouine','Tozeur','Tunis','Zaghouan',
];

const formatImageUrl = (path) => {
  if (!path) return null;
  const isLocal = window.location.hostname === 'localhost';
  const base = isLocal ? 'http://localhost:2025' : 'https://esseket.duckdns.org';
  const fileName = path.split('/').pop().split('\\').pop();
  return `${base}/uploads/${fileName}`;
};

const getImageByColor = (product, color, index = 0) => {
  if (!product?.images?.length) return '';
  const match = product.images.find(img => img.color?.toLowerCase() === color?.toLowerCase());
  if (match?.urls?.[index]) return formatImageUrl(match.urls[index]);
  const fallback = product.images.find(img => img.urls?.[index]);
  return fallback?.urls?.[index] ? formatImageUrl(fallback.urls[index]) : '';
};

const InputGroup = ({ id, value, onChange, label, type = 'text' }) => (
  <div className="input-group">
    <input type={type} id={id} value={value} onChange={onChange} placeholder=" " />
    <label htmlFor={id} className={value ? 'active' : ''}>{label}</label>
  </div>
);

const CommandeComp = () => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [rue, setRue] = useState('');
  const [ville, setVille] = useState('');
  const [complement, setComplement] = useState('');
  const [postal, setPostal] = useState('');
  const [open, setOpen] = useState(false);
  const [province, setProvince] = useState('');
  const [selected, setSelected] = useState('Province');
  const [productCart, setProductCart] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  const commandeRef = useRef(null);
  const navigate = useNavigate();

  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; }
    catch { return null; }
  });

  const filteredProvinces = PROVINCES.filter(p =>
    p.toLowerCase().includes(province.toLowerCase())
  );

  const handleSelect = (prov) => {
    setSelected(prov);
    setProvince(prov);
    setOpen(false);
  };

  const getProductCart = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/GetProductCart/${user.id}`, { withCredentials: true });
      // ✅ Backend returns { _id, userId, products: [...] } inside data
      // so unwrap and read .products directly
      const cartData = res.data.data || res.data;
      setProductCart(Array.isArray(cartData.products) ? cartData.products : []);
    } catch (error) {
      console.error('[getProductCart]', error);
      toast.error('Impossible de charger le panier.', { id: 'commande-fetch-cart-error' });
    }
  };

  useEffect(() => {
    if (user?.id) getProductCart();
  }, [user?.id]);

  useLayoutEffect(() => {
    const updateBodyHeight = () => {
      if (!commandeRef.current) return;
      const height = commandeRef.current.offsetHeight;
      requestAnimationFrame(() => {
        document.body.style.overflow = 'auto';
        document.body.style.overflowX = 'hidden';
        document.body.style.minHeight = `${height}px`;
        document.documentElement.style.minHeight = `${height}px`;
      });
    };

    updateBodyHeight();
    const resizeObserver = new ResizeObserver(updateBodyHeight);
    if (commandeRef.current) resizeObserver.observe(commandeRef.current);
    window.addEventListener('resize', updateBodyHeight);
    const timer = setTimeout(updateBodyHeight, 200);
    const overflowCheck = setInterval(() => {
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = 'auto';
        document.body.style.overflowX = 'hidden';
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      clearInterval(overflowCheck);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateBodyHeight);
      document.body.style.minHeight = '';
      document.documentElement.style.minHeight = '';
    };
  }, [productCart]);

  const handleGoToProduct = (item) => {
    const id = item.productId?._id;
    if (!id) return;
    navigate(`/PorductSelecte/${id}`, {
      state: {
        parentCategoryId: item.productId?.categoryId,
        subcategoryId: item.productId?.subcategoryId,
        genre: item.productId?.genre,
      },
    });
  };

  const DeletePrdCart = async (productToDelete) => {
    if (!user?.id || isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/DeletePrdCart`, {
        data: {
          userId: user.id,
          productId: productToDelete.productId._id,
          size: productToDelete.size,
          color: productToDelete.color,
        },
        withCredentials: true,
      });
      if (res.status === 200) {
        await getProductCart();
        toast.success('Produit supprimé du panier.', { id: 'cart-delete-success' });
      }
    } catch (error) {
      console.error('[DeletePrdCart]', error);
      toast.error('Suppression impossible.', { id: 'cart-delete-error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return;
    await DeletePrdCart(confirmDelete);
    setConfirmDelete(null);
  };

  const handleOrder = async () => {
    if (isOrdering) return;
    if (!nom || !prenom || !email || !telephone || !rue || !complement || !ville || !province || !postal) {
      return toast.error('Information non complet.', { id: 'order-incomplete-info' });
    }
    setIsOrdering(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/create-order/${user.id}`,
        { nom, prenom, email, telephone, rue, complement, ville, province, postal },
        { withCredentials: true }
      );
      toast.success('Commande envoyée avec succès.', { id: 'order-success' });
      // ✅ Handle { success, data: { order: {...} } } shape
      const orderData = res.data.data || res.data;
      navigate('/order-confirmation', { state: { order: orderData.order || orderData } });
    } catch (err) {
      console.error('[handleOrder]', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la commande.', { id: 'order-error' });
    } finally {
      setIsOrdering(false);
    }
  };

  const total = useMemo(() =>
    productCart.reduce((acc, item) => acc + (item.productId?.price || 0) * item.quantity, 0),
    [productCart]
  );

  return (
    <div className="Commande" ref={commandeRef}>
      <Link className="h1" to="/" style={{ textDecoration: 'none', color: 'black' }}>
        <MoveRight style={{ position: 'absolute', right: '10px', cursor: 'pointer' }} />
      </Link>
      <h1>Finaliser votre commande</h1>
      <h4>Quelques étapes simples pour recevoir vos produits</h4>

      <div className="facturation">
        <div className="facturation-1">
          <div id="Form">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="ICON"><ShoppingBag size={21} /></div>
              <h3 style={{ margin: '0', marginLeft: '1%' }}>Informations sur le destinataire</h3>
            </div>
            <div className="form">
              <InputGroup id="nom"       value={nom}       onChange={e => setNom(e.target.value)}       label="Nom" />
              <InputGroup id="prenom"    value={prenom}    onChange={e => setPrenom(e.target.value)}    label="Prénom" />
              <InputGroup id="email"     value={email}     onChange={e => setEmail(e.target.value)}     label="E-mail" type="email" />
              <InputGroup id="telephone" value={telephone} onChange={e => setTelephone(e.target.value)} label="Téléphone" />
            </div>
          </div>

          <div id="Form" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="ICON"><Truck size={21} /></div>
              <h3 style={{ margin: '0', marginLeft: '1%' }}>Adresse de livraison</h3>
            </div>
            <div className="form">
              <InputGroup id="rue"        value={rue}        onChange={e => setRue(e.target.value)}        label="Numéro et nom de rue *" />
              <InputGroup id="complement" value={complement} onChange={e => setComplement(e.target.value)} label="Escalier, étage... (Facultatif)" />
              <InputGroup id="ville"      value={ville}      onChange={e => setVille(e.target.value)}      label="Ville" />

              <div className="dropdown">
                <div className="dropdown-btn" onClick={() => setOpen(prev => !prev)}>
                  {selected} <span>{open ? <ChevronUp /> : <ChevronDown />}</span>
                </div>
                {open && (
                  <div className="dropdown-content">
                    <input
                      type="text"
                      placeholder="Cherche ici"
                      value={province}
                      onChange={e => setProvince(e.target.value)}
                    />
                    {filteredProvinces.map((prov, i) => (
                      <div key={i} className="dropdown-item" onClick={() => handleSelect(prov)}>{prov}</div>
                    ))}
                  </div>
                )}
              </div>

              <InputGroup id="postal" value={postal} onChange={e => setPostal(e.target.value)} label="Code postal" />
            </div>
          </div>

          <div className="cart-details" style={{ marginTop: '40px' }}>
            <h3>Produits dans votre panier</h3>
            <div className="cart-list">
              {productCart.map((item, index) => (
                <div key={index} className="cart-item">
                  <div
                    className={`cart-info ${item.productId?._id ? "clickable" : ""}`}
                    onClick={() => handleGoToProduct(item)}
                  >
                    <p><strong>Nom :</strong> {item.productId?.name}</p>
                    <p><strong>Taille :</strong> {item.size}</p>
                    <p><strong>Couleur :</strong> {item.color}</p>
                    <p><strong>Quantité :</strong> {item.quantity}</p>
                  </div>

                  <div className="cart-image" onClick={() => handleGoToProduct(item)}>
                    {(() => {
                      const src = getImageByColor(item.productId, item.color, 0);
                      return src ? (
                        <img
                          src={src}
                          alt={item.productId?.name || "product"}
                          className="cart-product-img"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : null;
                    })()}
                  </div>

                  <div className="cart-price">
                    <p className="cart-price-text"><strong>{item.productId?.price} DT</strong></p>
                    <Trash2
                      strokeWidth={2}
                      size={18}
                      className="cart-delete"
                      onClick={() => setConfirmDelete(item)}
                      title="Supprimer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div id='facturation-2' className="facturation-2">
          <h3>Résumé de l'achat ({productCart.length})</h3>
          <div style={{height:"1px",width:"100%",backgroundColor:"gray",marginTop:"2%",marginBottom:"1%"}}></div>
          <div className='phoneCommmande'>

          <div className="Continuer">
            {/* ✅ Clear breakdown: subtotal + delivery + total */}
              <div className="price-row">
                <h4 className="price-label" style={{color:"#BFD0E0"}}>Sous-total</h4>
                <h4 className="price-value"style={{color:"white"}}>{total.toFixed(2)} DT</h4>
              </div>

              <div className="price-row shipping">
                <h4 className="price-label" style={{color:"#BFD0E0"}}>Livraison</h4>
                <h4 className="price-value" style={{color:"white"}}>9.90 DT</h4>
              </div>

              <div className="price-row totalp">
                <h4 className="price-label total-label" style={{color:"#BFD0E0"}}>Total</h4>
                <h4 className="price-value total-value" style={{color:"white"}}>{(total + 9.9).toFixed(2)} DT</h4>
              </div>
          </div>
            <div className="btC">
              <button
                onClick={handleOrder}
                className="btContinuer"
                disabled={isOrdering}
                style={{ opacity: isOrdering ? 0.7 : 1, cursor: isOrdering ? 'not-allowed' : 'pointer' }}
              >
                {isOrdering ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <span style={{ width: '16px', height: '16px', border: '2px solid currentColor', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    Envoi...
                  </span>
                ) : 'Continuer la commande'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '18px 20px', width: '92%', maxWidth: '380px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',zIndex: 1000  }}>
            <h3 style={{ marginTop: 0, marginBottom: '8px' }}>Supprimer l'article</h3>
            <p style={{ marginTop: 0, color: '#555' }}>
              Voulez-vous vraiment supprimer <strong>{confirmDelete?.productId?.name}</strong> du panier ?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: '8px 12px', background: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Annuler</button>
              <button onClick={confirmDeleteItem} style={{ padding: '8px 12px', background: '#e53935', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* <footer className="footer-2">
        <div className="footer-links">
          <a href="#">Conditions générales d'achat</a><span>•</span>
          <a href="#">Conditions générales de #esbeandstyle</a><span>•</span>
          <a href="#">Politique de confidentialité</a><span>•</span>
          <a href="#">Politique de cookies</a>
        </div>
        <div className="footer-copy">© 2025 ESBEAND CLOTHES</div>
      </footer> */}
    </div>
  );
};

export default CommandeComp;