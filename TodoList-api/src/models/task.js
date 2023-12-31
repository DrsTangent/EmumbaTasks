
module.exports = (sequelize, Sequelize) => {
    const Task = sequelize.define("task", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      userID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
      },
      description: {
        type: Sequelize.STRING
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      fileUrl: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      completionStatus: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      completionDate: {
        type: Sequelize.DATE
      }
    });
  
    return Task;
  };