import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../repository/sequelize';

export interface FindingAttributes {
  id: string;
  run_id: string;
  severity: 'High' | 'Medium' | 'Low';
  score: number;
  category: string;
  location_page?: number;
  location_start_offset?: number;
  location_end_offset?: string;
  evidence_snippet?: string;
  evidence_policy_ref?: string;
  evidence_rationale?: string;
  suggestion_proposed_rewrite?: string;
  verification_status: 'unverified' | 'verified_safe' | 'verified_risky';
  verifier_notes?: string;
  created_at: Date;
}

export interface FindingCreationAttributes
  extends Optional<
    FindingAttributes,
    | 'id'
    | 'location_page'
    | 'location_start_offset'
    | 'location_end_offset'
    | 'evidence_snippet'
    | 'evidence_policy_ref'
    | 'evidence_rationale'
    | 'suggestion_proposed_rewrite'
    | 'verification_status'
    | 'verifier_notes'
    | 'created_at'
  > {}

export class Finding extends Model<FindingAttributes, FindingCreationAttributes> implements FindingAttributes {
  public id!: string;
  public run_id!: string;
  public severity!: 'High' | 'Medium' | 'Low';
  public score!: number;
  public category!: string;
  public location_page?: number;
  public location_start_offset?: number;
  public location_end_offset?: string;
  public evidence_snippet?: string;
  public evidence_policy_ref?: string;
  public evidence_rationale?: string;
  public suggestion_proposed_rewrite?: string;
  public verification_status!: 'unverified' | 'verified_safe' | 'verified_risky';
  public verifier_notes?: string;
  public created_at!: Date;
}

Finding.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    run_id: { type: DataTypes.UUID, allowNull: false },
    severity: { type: DataTypes.STRING, allowNull: false },
    score: { type: DataTypes.INTEGER, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    location_page: { type: DataTypes.INTEGER },
    location_start_offset: { type: DataTypes.INTEGER },
    location_end_offset: { type: DataTypes.STRING },
    evidence_snippet: { type: DataTypes.TEXT },
    evidence_policy_ref: { type: DataTypes.TEXT },
    evidence_rationale: { type: DataTypes.TEXT },
    suggestion_proposed_rewrite: { type: DataTypes.TEXT },
    verification_status: { type: DataTypes.STRING, defaultValue: 'unverified' },
    verifier_notes: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'findings', timestamps: false }
);
