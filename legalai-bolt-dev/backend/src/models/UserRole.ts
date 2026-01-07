import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../repository/sequelize';
import { UserRoleAttributes, UserRoleCreationAttributes } from '../types/UserRoleTypes';
import { User } from './User';
import { Role } from './Role';

export class UserRole extends Model<UserRoleAttributes, UserRoleCreationAttributes> implements UserRoleAttributes {
  public id!: string;
  public user_id!: string;
  public role_id!: string;
  public assigned_at!: Date;
  public assigned_by!: string;
  public is_active!: boolean;
}

UserRole.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    assigned_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'user_roles',
    timestamps: false,
  }
);

UserRole.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserRole.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
UserRole.belongsTo(User, { foreignKey: 'assigned_by', as: 'assigner' });
