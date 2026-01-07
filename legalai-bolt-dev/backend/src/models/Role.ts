import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../repository/sequelize';
import { RoleAttributes, RoleCreationAttributes } from '../types/RoleTypes';

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public permissions!: any;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    permissions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'roles',
    timestamps: false,
  }
);
