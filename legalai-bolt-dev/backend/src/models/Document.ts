import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../repository/sequelize';

export interface DocumentAttributes {
  id: string;
  title: string;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
  tags: string[];
  confidentiality_level: 'public' | 'internal' | 'confidential' | 'restricted';
  metadata: Record<string, any>;
}

export interface DocumentCreationAttributes
  extends Optional<DocumentAttributes, 'id' | 'created_at' | 'updated_at' | 'tags' | 'confidentiality_level' | 'metadata'> {}

export class Document extends Model<DocumentAttributes, DocumentCreationAttributes> implements DocumentAttributes {
  public id!: string;
  public title!: string;
  public owner_id!: string;
  public created_at!: Date;
  public updated_at!: Date;
  public tags!: string[];
  public confidentiality_level!: 'public' | 'internal' | 'confidential' | 'restricted';
  public metadata!: Record<string, any>;
}

Document.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner_id: {
      type: DataTypes.UUID,
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
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    confidentiality_level: {
      type: DataTypes.STRING,
      defaultValue: 'internal',
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'documents',
    timestamps: false,
  }
);
