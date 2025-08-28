require('dotenv').config();

module.exports = {
  railway: {
    username: 'root',
    password: 'marbfMzShOQqkJzCTJPfTkhUNISTliWS',
    database: 'railway',
    host: 'gondola.proxy.rlwy.net',
    port: 30653,
    dialect: 'mysql',
    dialectOptions: {
      ssl: false
    }
  }
};
