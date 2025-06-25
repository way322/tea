import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import { toggleFavorite } from '../../store/favoritesSlice';
import { useEffect } from 'react';
import { fetchProducts } from '../../store/productsSlice';


import fon from '../../img/fon.png';
import Heart from '../../img/Heart.png';
import korzina from '../../img/korzina.png';
import Logo from '../../img/Logo.png';
import Person from '../../img/Person.png';
import vidchay1 from '../../img/vidchay1.png';
import vidchay2 from '../../img/vidchay2.png';
import vidchay3 from '../../img/vidchay3.png';
import vidchay4 from '../../img/vidchay4.png';
import vidchay5 from '../../img/vidchay5.png';
import vidchay6 from '../../img/vidchay6.png';
import gruzovik from '../../img/gruzovik.png';
import dengi from '../../img/dengi.png';
import karobka from '../../img/karobka.png';
import lampa from '../../img/lampa.png';
import HeartFilled from '../../img/HeartFilled.png';
import korzina2 from '../../img/korzina2.png'

import { addToCartDB, syncCart } from '../../store/cartSlice';

import styles from './Home.module.css'


const HomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const catalogRef = useRef(null);


    const { isAuthenticated } = useSelector(state => state.auth);
    const favorites = useSelector(state => state.favorites.items);
    const products = useSelector(state => state.products.items);
    const productsStatus = useSelector(state => state.products.status);


    const handleCatalogClick = () => {
        catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const checkAuth = () => {
        if (!isAuthenticated) {
            alert('Пожалуйста, авторизуйтесь!');
            navigate('/login');
            return false;
        }
        return true;
    };

    const handleCartClick = (e) => {
        if (!isAuthenticated) {
            e.preventDefault();
            navigate('/login');
        }
    };

    const handleAddToCart = (product) => {
        if (!checkAuth()) return;
        dispatch(addToCartDB(product))
            .unwrap()
            .then(() => {
                dispatch(syncCart());
            })
            .catch(error => {
                console.error('Add to cart error:', error);
                alert('Ошибка при добавлении в корзину: ' + (error.message || 'Неизвестная ошибка'));
            });
    };

    const handleToggleFavorite = (product) => {
        if (!checkAuth()) return;
        dispatch(toggleFavorite(product.id)); 
    };
    useEffect(() => {
        if (productsStatus === 'idle') {
            dispatch(fetchProducts());
        }
    }, [productsStatus, dispatch]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.navContainer}>
                    <div className={styles.nazv}>
                    <Link to="/" className={styles.logoLink}>
                        <img src={Logo} alt="Логотип" className={styles.logo} />
                    </Link>
                    <h1 className={styles.title}>Aroma</h1>
                    </div>
                    <div className={styles.iconsContainer}>
                        <Link to="/cart" onClick={handleCartClick} className={styles.cartLink}>
                            <img src={korzina} alt="Корзина" className={styles.cartIcon} />
                        </Link>
                        <Link to="/profile" className={styles.profileLink}>
                            <img src={Person} alt="Профиль" className={styles.profileIcon} />
                        </Link>
                    </div>
                </div>
            </header>
    
            <section className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h2 className={styles.heroTitle}>Интернет-магазин чая</h2>
                    <div className={styles.heroText}>
                        <p>Добро пожаловать в Aroma, чайный магазин с самой большой коллекцией китайского чая в Европе.Мы осуществляем доставку китайского чая из Гамбурга, Германия, во все страны Европейского Союза. У нас вы можете заказать подарочный чайный набор в элегантной упаковке для своих близких.</p>

                    </div>
                    <button 
                        onClick={handleCatalogClick}
                        className={styles.catalogButton}
                    >
                        Каталог
                    </button>
                </div>
            </section>

            <section className={styles.teaTypesSection}>
                <h3 className={styles.sectionTitle}>Виды чая</h3>
                <div className={styles.teaTypesGrid}>
                    {['Белый чай', 'Зеленый чай', 'Матча', 'Пуэр', 'Улун', 'Черный чай'].map((tea, index) => (
                        <div key={tea} className={styles.teaTypeCard}>
                            <img
                                src={[vidchay1, vidchay2, vidchay3, vidchay4, vidchay5, vidchay6][index]}
                                alt={tea}
                                className={styles.teaTypeImage}
                            />
                            <p className={styles.teaTypeName}>{tea}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles.catalogSection} ref={catalogRef}>
                <h3 className={styles.sectionTitle}>Каталог</h3>
                <div className={styles.productsGrid}>
                    {products.map((product) => {
                        const isFavorite = favorites.includes(product.id);
                        return (
                            <div key={product.id} className={styles.productCard}>
                                <img
                                    src={`/img/${product.image_url}`}
                                    alt={product.title}
                                    className={styles.productImage}
                                />
                                <div className={styles.productInfo}>
                                    <p className={styles.productTitle}>{product.title}</p>
                                    <p className={styles.productPrice}>{product.price}Р</p>
                                    <div className={styles.productActions}>
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className={styles.cartButton}
                                            aria-label="Добавить в корзину"
                                        >
                                            <img src={korzina2} alt="Корзина" className={styles.actionIcon} />
                                        </button>
                                        <button
                                            onClick={() => handleToggleFavorite(product)}
                                            className={styles.favoriteButton}
                                            aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
                                        >
                                            <img
                                                src={isFavorite ? HeartFilled : Heart}
                                                alt="Избранное"
                                                className={styles.actionIcon}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            <section className={styles.infoSection}>
                <div>
                <div className={styles.infoCard}>
                    <img src={gruzovik} alt="Доставка" className={styles.infoIcon} />
                    <div>
                    <h4 className={styles.infoTitle}>Быстрая доставка</h4>
                    <p className={styles.infoText}>Мы рады поставлять нашу продукцию во все страны Мира.</p>
                    </div>
                </div>
                
                <div className={styles.infoCard}>
                    <img src={karobka} alt="Гарантия" className={styles.infoIcon} />
                    <div>
                    <h4 className={styles.infoTitle}>100% Удовлетворение</h4>
                    <p className={styles.infoText}>Возникли проблемы? Наша компания всегда готова прийти на помощь.</p>
                    </div>
                </div>
                </div>
                <div>
                <div className={styles.infoCard}>
                    <img src={lampa} alt="Особый заказ" className={styles.infoIcon} />
                    <div>
                    <h4 className={styles.infoTitle}>Ищете особый чай?</h4>
                    <p className={styles.infoText}>Мы здесь, чтобы помочь. Обращайтесь к нам с любыми особыми пожеланиями.</p>
                    </div>
                </div>
                
                <div className={styles.infoCard}>
                    <img src={dengi} alt="Оплата" className={styles.infoIcon} />
                    <div>
                    <h4 className={styles.infoTitle}>Способы оплаты</h4>
                    <p className={styles.infoText}>Мы принимаем PayPal, Apple Pay, Google Pay и основные карты.</p>
                    </div>
                </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;