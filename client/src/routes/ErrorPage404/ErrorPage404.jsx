import React from 'react';
import styles from './ErrorPage404.module.css';

const ErrorPage404 = () => {
  return (
    <div className={styles.container}>
      <div className={styles.space}>
        <div className={styles.stars}></div>
        <div className={styles.planet}></div>
        <div className={styles.astronaut}></div>
      </div>
      
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.subtitle}>Ой! Похоже, вы заблудились в космосе</p>
        <p className={styles.description}>
          Страница, которую вы ищете, была перемещена, удалена или, возможно, 
          никогда не существовала в нашей галактике.
        </p>
        <button 
          className={styles.homeButton}
          onClick={() => window.history.back()}
        >
          Вернуться на Землю
        </button>
      </div>
    </div>
  );
};

export default ErrorPage404;