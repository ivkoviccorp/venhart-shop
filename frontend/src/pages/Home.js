import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, newsletterAPI } from '../utils/api';
import { formatPrice } from '../utils/formatPrice';
import { toast } from 'react-toastify';
import { FiShield, FiRefreshCw, FiTruck, FiCreditCard, FiCheckCircle, FiArrowRight, FiPercent, FiMail, FiLock } from 'react-icons/fi';
import { FaGoogle, FaStar } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [currentReview, setCurrentReview] = useState(0);

  const reviews = [
    {
      name: 'Dženifer Ristićević',
      text: 'Veoma širok asortiman garderobe po pristupačnim cenama, prilagođen različitim ukusima i stilovima. Domaćinska i prijatna atmosfera učinila je kupovinu posebnim iskustvom - poslužena sam turskim čajem, što je dodatno upotpunilo celokupan ugođaj. Topla preporuka da ih posetite i podržite mali domaći brend. ❤️'
    },
    {
      name: 'Sara Ranković',
      text: 'Predivan ambijent, ljubazno osoblje, divna garderoba sa cenama za svačiji džep - od dnevnih do večernjih varijanti. Pravi porodični biznis 🥰 Ja sam uzela vrlo udoban i moderan komplet i dobila pravi turski čaj dok sam birala 👚🍵'
    },
    {
      name: 'Jovana Pavlović',
      text: 'Super stvari sa odličnim kvalitetom. A cene pristupačne. Imaju i muške i ženske stvari a ja sam našla ovaj divan kaiš. Osoblje je divno i uvek spremno da pomogne i objasni. Dobijete i pravi turski čaj za potpuni ugođaj. Topla preporuka za ovaj divan butik i porodičan biznis.'
    },
    {
      name: 'Nikola Pešić',
      text: 'Ne zna se šta je bolje, da li garderoba ili ljudi koji čine ovaj unikatan butik. Sa čajem ili kafom, ovo neće biti klasična kupovina garderobe, nego nezaboravno iskustvo ❤️ Veliki pozdrav za dream tim: Steva i Veka'
    },
    {
      name: 'Strahinja Simić',
      text: 'Sjajna usluga, momci su se baš potrudili, pristupačne cene 👌'
    },
    {
      name: 'Dušan Momirović',
      text: 'Top stvari sa top cenama! Vrhunski koncept butika.'
    },
    {
      name: 'Mladen Krstić',
      text: 'Odlična radnja, iz prve sam našao sako. Preporuka!!!'
    },
    {
      name: 'Marija Žarković',
      text: 'Super usluga! Došla po jednu, izašla sa pet stvari... 😄 Sve preporuke!!'
    },
    {
      name: 'M',
      text: 'Najbolja odela na Voždovcu.'
    }
  ];

  const categoryCards = [
    {
      title: 'Muške farmerke',
      value: 'Muške farmerke',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774377063/venhart-shop/nidachoiukzlnhvewiv6.jpg'
    },
    {
      title: 'Muška odela',
      value: 'Muška odela',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774376054/venhart-shop/kukeneqoxtikvmnkkg5q.webp'
    },
    {
      title: 'Ženske haljine i kompleti',
      value: 'Ženske haljine i kompleti',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774469591/venhart-shop/go7hpljtjnkxh53rjq8o.webp'
    },
    {
      title: 'Muški sakoi',
      value: 'Muški sakoi',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774731575/venhart-shop/sxa0knrny8zer9vxcqzq.webp'
    },
    {
      title: 'Muške košulje i natkošulje',
      value: 'Muške košulje i natkošulje',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774731962/venhart-shop/g07vkjvmghyaltjjzusi.webp'
    },
    {
      title: 'Ženska odela',
      value: 'Ženska odela',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774732113/venhart-shop/wurngrwyckcxrk3jwdra.webp'
    },
    {
      title: 'Muški džemperi',
      value: 'Muški džemperi',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774733423/venhart-shop/ma8wdz0hvi5jnjfgcxwx.webp'
    },
    {
      title: 'Ženski triko kompleti',
      value: 'Ženski triko komplet',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774733759/venhart-shop/muoyh2ivw25sum1xihwc.webp'
    },
    {
      title: 'Ženski sakoi',
      value: 'Ženski sakoi',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774733882/venhart-shop/xevqjnnwvuhjjqrkgnza.jpg'
    },
    {
      title: 'Muške kravate i aksesoari',
      value: 'Muške kravate i aksesoari',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774734343/venhart-shop/ndjujdf8oe9xplipywnq.webp'
    },
    {
      title: 'Muške majice',
      value: 'Muške majice',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774734460/venhart-shop/swxkhappel1anocyrxki.webp'
    },
    {
      title: 'Ženske pantalone',
      value: 'Ženske pantalone',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774904028/venhart-shop/dlu5ogf02asslywv4kee.webp'
    },
    {
      title: 'Čarape',
      value: 'Čarape',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774734039/venhart-shop/ykk1nt4f5cpfrtqvf7ok.jpg'
    }
  ];

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [reviews.length]);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productsAPI.getAll({ featured: true, limit: 12 });
      setFeaturedProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    if (!newsletterEmail.trim()) {
      toast.warning('Unesite email adresu');
      return;
    }

    setNewsletterLoading(true);

    try {
      await newsletterAPI.subscribe({ email: newsletterEmail });
      toast.success('Uspešno ste prijavljeni na newsletter!');
      setNewsletterEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri prijavi na newsletter');
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>VENHART</h1>
          <p className="hero-subtitle">CONCEPT STORE</p>
          <p className="hero-description">Elegancija. Stil. Kvalitet.</p>
          <Link to="/shop" className="btn btn-hero">
            Pogledaj kolekciju
          </Link>
        </div>
      </section>

      {/* First Purchase Discount Banner */}
      <section className="first-purchase-banner">
        <div className="container">
          <div className="first-purchase-box">
            <div className="first-purchase-icon">
              <FiPercent />
            </div>
            <div className="first-purchase-content">
              <span className="first-purchase-badge">SPECIJALNA PONUDA</span>
              <h2>10% POPUSTA NA PRVU KUPOVINU PREKO SAJTA</h2>
              <p>
                Iskoristite specijalnu pogodnost i ostvarite popust na svoju prvu online porudžbinu.
                Kupujte jednostavno, sigurno i uz dodatnu uštedu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <FiShield />
              </div>
              <h3>Bez rizika kupovine</h3>
              <p>Sigurna i pouzdana porudžbina uz proverene proizvode i podršku.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <FiRefreshCw />
              </div>
              <h3>Zamena veličine u roku od 7 dana</h3>
              <p>Ukoliko veličina ne odgovara, omogućena je brza zamena.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <FiTruck />
              </div>
              <h3>Brza dostava 24–48h</h3>
              <p>Poručite danas, a vaša pošiljka stiže brzo i sigurno.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <FiCreditCard />
              </div>
              <h3>Plaćanje pouzećem</h3>
              <p>Jednostavno i sigurno plaćanje prilikom preuzimanja porudžbine.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <FiCheckCircle />
              </div>
              <h3>100% sigurna kupovina</h3>
              <p>Profesionalna usluga, kvalitet i pažljivo odabrani modni komadi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Google Reviews Section */}
      <section className="reviews-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-tag">GOOGLE RECENZIJE</span>
              <h2 className="section-title">Šta naši kupci kažu o nama</h2>
            </div>
          </div>

          <div className="reviews-summary">
            <div className="reviews-summary-icon">
              <FaGoogle />
            </div>
            <div className="reviews-summary-text">
              <h3>5.0 / 5.0</h3>
              <div className="reviews-stars">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
              </div>
              <p>Na osnovu zadovoljnih kupaca i njihovih iskustava sa Venhart Concept Store.</p>
            </div>
          </div>

          <div className="reviews-slider">
            <div className="review-card">
              <div className="review-stars">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
              </div>
              <p className="review-text">"{reviews[currentReview].text}"</p>
              <h4 className="review-name">{reviews[currentReview].name}</h4>
              <span className="review-source">Google review</span>
            </div>
          </div>

          <div className="reviews-dots">
            {reviews.map((_, index) => (
              <button
                key={index}
                className={`review-dot ${currentReview === index ? 'active' : ''}`}
                onClick={() => setCurrentReview(index)}
                aria-label={`Recenzija ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* Secure Payment Banner */}
      <section className="payment-banner">
        <div className="container">
          <div className="payment-banner-box">
            <div className="payment-banner-icon">
              <FiLock />
            </div>
            <span className="payment-badge">SIGURNA KUPOVINA</span>
            <h2>Sigurno online plaćanje karticama</h2>
            <p>
              Kupujte brzo, jednostavno i bezbedno. Vaši podaci su zaštićeni najsavremenijim 
              sigurnosnim standardima putem CorvusPay sistema za online plaćanje.
            </p>
            <div className="payment-methods">
              <span>Visa</span>
              <span>Mastercard</span>
              <span>Maestro</span>
              <span>Dina</span>
            </div>
            <p className="payment-secure-note">
              🔒 SSL zaštita • 3D Secure verifikacija • PCI DSS standard
            </p>
          </div>
        </div>
      </section>

      {/* Brand / Intro Section */}
      <section className="brand-highlight">
        <div className="container">
          <div className="brand-highlight-content">
            <span className="brand-highlight-tag">PAŽLJIVO ODABRANO</span>
            <h2>Modni komadi koji ostavljaju utisak</h2>
            <p>
              U Venhart Concept Store-u biramo garderobu koja spaja savremen stil,
              kvalitetnu izradu i elegantan izgled — za muškarce i žene koji žele da
              se izdvoje sigurnim i sofisticiranim izborom.
            </p>
            <Link to="/shop" className="btn btn-dark">
              Istraži ponudu <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="home-categories">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-tag">KATEGORIJE</span>
              <h2 className="section-title">Istraži po kategorijama</h2>
            </div>
          </div>

          <div className="category-grid">
            {categoryCards.map((category) => (
              <Link
                key={category.value}
                to={`/shop?category=${encodeURIComponent(category.value)}`}
                className="category-card"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.45)), url(${category.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="category-card-overlay">
                  <h3>{category.title}</h3>
                  <span>
                    Pogledaj ponudu <FiArrowRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-tag">IZDVOJENO</span>
              <h2 className="section-title">Istaknuti proizvodi</h2>
            </div>
          </div>
          
          {loading ? (
            <div className="loading">Učitavanje...</div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <Link 
                  to={`/product/${product._id}`} 
                  key={product._id} 
                  className="product-card"
                >
                  <div className="product-image">
                    <img 
                      src={product.images[0]?.url || '/placeholder.jpg'} 
                      alt={product.name} 
                    />
                    {product.onSale && <span className="badge sale">SALE</span>}
                    {product.isNew && <span className="badge new">NEW</span>}
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <div className="product-price">
                      {product.oldPrice && (
                        <span className="old-price">{formatPrice(product.oldPrice)}</span>
                      )}
                      <span className="price">{formatPrice(product.price)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {featuredProducts.length === 0 && !loading && (
            <p className="no-products">Trenutno nema dostupnih proizvoda.</p>
          )}

          <div className="featured-cta">
            <Link to="/shop" className="btn btn-outline-dark">
              Pogledaj sve proizvode <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-box">
            <div className="newsletter-icon">
              <FiMail />
            </div>
            <span className="newsletter-badge">NEWSLETTER</span>
            <h2>Prijavite se za Venhart novosti</h2>
            <p>
              Budite među prvima koji će saznati za nove kolekcije, posebne ponude i ekskluzivne pogodnosti.
            </p>

            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Unesite vašu email adresu"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn newsletter-btn" disabled={newsletterLoading}>
                {newsletterLoading ? 'Prijava...' : 'Prijavi se'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="about-preview">
        <div className="container">
          <div className="about-content">
            <span className="section-tag">VENHART</span>
            <h2>O Nama</h2>
            <p>
              Venhart Concept Store je moderan butik muške i ženske garderobe koji nudi
              pažljivo birane komade sa fokusom na kvalitet, eleganciju i savremen stil.
            </p>
            <Link to="/about" className="btn btn-outline">
              Saznaj više
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;