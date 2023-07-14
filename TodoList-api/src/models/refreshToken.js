module.exports = (sequelize, Sequelize) => {
    const Refresh_Token = sequelize.define("refreshToken", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      refreshToken: {
        type: Sequelize.STRING,
        allowNull: false
      },
      userID: {
        type: Sequelize.INTEGER,
        references: {
            model: 'Users',
            key: 'id'
        }
      }
    });
    return Refresh_Token;
  };