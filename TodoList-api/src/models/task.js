module.exports = (sequelize, Sequelize) => {
    const Task = sequelize.define("task", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      userID: {
        type: Sequelize.INTEGER,
        references: {
            model: User,
            key: 'id'
        }
      },
      description: {
        type: Sequelize.STRING
      },
      create_at: {
        type: Sequelize.DATETIME,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATETIME,
        defaultValue: Sequelize.NOW
      },
      due_time: {
        type: Sequelize.DATETIME,
        allowNull: false
      },
      file_path: {
        type: Sequelize.STRING,
      },
      completionStatus: {
        type: Sequelize.BOOLEAN,
        default: false
      },
      completionDate: {
        type: Sequelize.DATETIME
      }
    });
  
    return Task;
  };