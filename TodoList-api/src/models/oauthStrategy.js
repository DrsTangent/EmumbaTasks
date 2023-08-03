module.exports = (sequelize, Sequelize) => {
    const Oauth_Strategy = sequelize.define("oauthStrategy", {
      accessToken: {
        type: Sequelize.STRING,
        allowNull: false
      },
      userID: {
        type: Sequelize.INTEGER,
        references: {
            model: 'Users',
            key: 'id'
        },
        primaryKey: true
      }
    });
    return Oauth_Strategy;
  };