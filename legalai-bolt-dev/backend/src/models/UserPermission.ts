import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../repository/sequelize';

export interface UserPermissionAttributes {
  id: string;
  user_id: string;
  permission_key: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserPermissionCreationAttributes {
  user_id: string;
  permission_key: string;
}

export class UserPermission extends Model<UserPermissionAttributes, UserPermissionCreationAttributes> 
  implements UserPermissionAttributes {
  public id!: string;
  public user_id!: string;
  public permission_key!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

UserPermission.init(
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
      onDelete: 'CASCADE',
    },
    permission_key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_permissions',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'permission_key'],
      },
    ],
  }
);
