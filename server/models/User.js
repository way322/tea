import pool from '../db.js';

export default class User {
  static async findByPhone(phone) {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE phone_number = $1',
        [phone]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('User search error:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { rows } = await pool.query(
        'INSERT INTO users (phone_number, password) VALUES ($1, $2) RETURNING *',
        [userData.phone_number, userData.password]
      );
      return rows[0];
    } catch (error) {
      console.error('User creation error:', error);
      throw error;
    }
  }
}