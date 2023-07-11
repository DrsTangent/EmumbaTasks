module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      taskNo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      hashedPassword: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  
    return User;
  };