import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { clearCart, syncCart, addToCartDB, removeFromCart, decrementQuantity } from '../../store/cartSlice';
import { addOrder } from '../../store/orderSlice';
import axios from 'axios';
import chaynik from '../../img/chaynik.png';
import korzina from '../../img/korzina.png';
import Logo from '../../img/Logo.png';
import Person from '../../img/Person.png';

import s from './Cart.module.css'

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const MAX_ADDRESS_LENGTH = 100;
  const MAX_NAME_LENGTH = 20;
  const cartItems = useSelector(state => state.cart.items);
  const { isAuthenticated, user, token } = useSelector(state => state.auth);

  const [address, setAddress] = useState('');
  const [name, setName] = useState('');

  const total = cartItems.reduce((sum, item) => {
    const itemTotal = Number(item.price) * item.quantity;
    return isNaN(itemTotal) ? sum : sum + itemTotal;
  }, 0);

  const handleIncrement = (item) => {
    dispatch(addToCartDB(item));
  };

  const handleDecrement = (item) => {
    if (!isAuthenticated) {
      alert('Пожалуйста, авторизуйтесь!');
      navigate('/login');
      return;
    }

    dispatch(decrementQuantity(item.id))
      .unwrap()
      .catch(error => {
        console.error('Ошибка уменьшения количества:', error);
        alert('Не удалось обновить корзину');
      });
  };

  const handleOrder = async () => {
    if (!isAuthenticated) {
      alert('Пожалуйста, войдите в аккаунт!');
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      alert('Корзина пуста!');
      return;
    }
    if (!address || !name) {
      alert('Заполните все поля!');
      return;
    }

    try {
      const invalidItems = cartItems.filter(item =>
        !item.image_url || !item.title || !item.price
      );

      if (invalidItems.length > 0) {
        throw new Error('Некорректные данные товаров в корзине');
      }

      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity
        })),
        total: Number(total.toFixed(2)),
        address,
        name
      };

      const response = await axios.post(
        'http://localhost:5000/api/orders',
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      dispatch(clearCart());
      navigate('/profile');
      dispatch(addOrder({
        ...response.data,
        items: cartItems,
        userId: user.id
      }));

    } catch (error) {
      console.error('Order error:', error);
      alert(
        error.response?.data?.message ||
        error.message ||
        'Ошибка при оформлении заказа'
      );

      try {
        await dispatch(syncCart());
      } catch (syncError) {
        console.error('Cart sync failed:', syncError);
      }
    }
  };

  return (
    <div className={s.container}>
      <header className={s.header}>
        <div className={s.navContainer}>
          <div className={s.nazv}>
            <Link to="/" className={s.logoLink}>
              <img src={Logo} alt="Логотип" className={s.logo} />
            </Link>
            <h1 className={s.title}>Aroma</h1>
          </div>
          <div className={s.iconsContainer}>
            <Link to="/cart" className={s.cartLink}>
              <img
                src={korzina}
                alt="Корзина"
                className={`${s.cartIcon} ${s.iconHover}`}
              />
            </Link>
            <Link to="/profile" className={s.profileLink}>
              <img
                src={Person}
                alt="Профиль"
                className={`${s.profileIcon} ${s.iconHover}`}
              />
            </Link>
          </div>
        </div>
      </header>

      <div className={s.mainContent}>
        <div className={s.cartItems}>
          {cartItems.map((item, index) => (
            <div
              key={item.id}
              className={`${s.cartItem} ${s.itemAnimation}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img
                src={`/img/${item.image_url}`}
                alt={item.title}
                className={s.itemImage}
                onError={(e) => {
                  e.target.src = 'placeholder-image-url';
                }}
              />

              <p className={s.itemTitle}>{item.title}</p>
              <div className={s.quantityControls}>
                <button
                  className={s.controlButton}
                  onClick={() => handleDecrement(item)}
                >
                  -
                </button>
                <span className={s.quantity}>{item.quantity}</span>
                <button
                  className={s.controlButton}
                  onClick={() => handleIncrement(item)}
                >
                  +
                </button>
              </div>
              <p className={s.itemPrice}>{item.price}Р x {item.quantity}</p>

            </div>
          ))}
        </div>

        <div className={s.orderSection}>
          <h1 className={s.orderTotal}>Сумма заказа: {total}Р</h1>

            <input
              className={s.inputField}
              placeholder={`Адрес`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              maxLength={MAX_ADDRESS_LENGTH}
            />

            <input
              className={s.inputField}
              placeholder={`Ваше имя`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={MAX_NAME_LENGTH}
            />


          <img src={chaynik} alt="" className={s.chaynikImage} />
          <button
            className={`${s.orderButton} ${s.pulseHover}`}
            onClick={handleOrder}
          >
            Заказать
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;