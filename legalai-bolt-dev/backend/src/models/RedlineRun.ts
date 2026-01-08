import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../repository/sequelize';

export interface RedlineRunAttributes {
  id: string;
  document_id: string;
  version_id: string;
  profile_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  started_at?: Date;
  finished_at?: Date;
  primary_model?: string;
  verifier_model?: string;
  error_message?: string;
  overall_risk_score?: number;
  metadata: Record<string, any>;
  created_at: Date;
}

export interface RedlineRunCreationAttributes
  extends Optional<
    RedlineRunAttributes,
    'id' | 'profile_id' | 'status' | 'started_at' | 'finished_at' | 'primary_model' | 'verifier_model' | 'error_message' | 'overall_risk_score' | 'metadata' | 'created_at'
  > {}

export class RedlineRun extends Model<RedlineRunAttributes, RedlineRunCreationAttributes>
  implements RedlineRunAttributes {
  public id!: string;
  public document_id!: string;
  public version_id!: string;
  public profile_id!: string;
  public status!: 'queued' | 'running' | 'completed' | 'failed';
  public started_at?: Date;
  public finished_at?: Date;
  public primary_model?: string;
  public verifier_model?: string;
  public error_message?: string;
  public overall_risk_score?: number;
  public metadata!: Record<string, any>;
  public created_at!: Date;
}

RedlineRun.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    document_id: { type: DataTypes.UUID, allowNull: false },
    version_id: { type: DataTypes.UUID, allowNull: false },
    profile_id: { type: DataTypes.STRING, defaultValue: 'default' },
    status: { type: DataTypes.STRING, defaultValue: 'queued' },
    started_at: { type: DataTypes.DATE },
    finished_at: { type: DataTypes.DATE },
    primary_model: { type: DataTypes.STRING },
    verifier_model: { type: DataTypes.STRING },
    error_message: { type: DataTypes.TEXT },
    overall_risk_score: { type: DataTypes.INTEGER },
    metadata: { type: DataTypes.JSONB, defaultValue: {} },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'redline_runs', timestamps: false }
);
