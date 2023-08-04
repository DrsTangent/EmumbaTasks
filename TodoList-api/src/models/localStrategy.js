module.exports = (sequelize, Sequelize) => {
    const Local_Strategy = sequelize.define("localStrategy", {
      hashedPassword: {
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
    return Local_Strategy;
  };