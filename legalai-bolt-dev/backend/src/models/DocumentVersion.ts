import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../repository/sequelize';

export interface DocumentVersionAttributes {
  id: string;
  document_id: string;
  version_number: number;
  file_type: 'docx' | 'pdf';
  blob_url: string;
  file_size?: number;
  created_by: string;
  created_at: Date;
  is_current: boolean;
  change_summary?: string;
}

export interface DocumentVersionCreationAttributes
  extends Optional<DocumentVersionAttributes, 'id' | 'created_at' | 'is_current' | 'file_size' | 'change_summary'> {}

export class DocumentVersion extends Model<DocumentVersionAttributes, DocumentVersionCreationAttributes>
  implements DocumentVersionAttributes {
  public id!: string;
  public document_id!: string;
  public version_number!: number;
  public file_type!: 'docx' | 'pdf';
  public blob_url!: string;
  public file_size?: number;
  public created_by!: string;
  public created_at!: Date;
  public is_current!: boolean;
  public change_summary?: string;
}

DocumentVersion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    document_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    version_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    file_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    blob_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    file_size: {
      type: DataTypes.BIGINT,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    is_current: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    change_summary: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    tableName: 'document_versions',
    timestamps: false,
  }
);
