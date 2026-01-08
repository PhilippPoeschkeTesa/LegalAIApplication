import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../repository/sequelize';

export interface UserDecisionAttributes {
  id: string;
  finding_id: string;
  user_id: string;
  action: 'accept' | 'reject' | 'edited' | 'ask_followup';
  final_text?: string;
  comment?: string;
  timestamp: Date;
}

export interface UserDecisionCreationAttributes
  extends Optional<UserDecisionAttributes, 'id' | 'final_text' | 'comment' | 'timestamp'> {}

export class UserDecision extends Model<UserDecisionAttributes, UserDecisionCreationAttributes>
  implements UserDecisionAttributes {
  public id!: string;
  public finding_id!: string;
  public user_id!: string;
  public action!: 'accept' | 'reject' | 'edited' | 'ask_followup';
  public final_text?: string;
  public comment?: string;
  public timestamp!: Date;
}

UserDecision.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    finding_id: { type: DataTypes.UUID, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    final_text: { type: DataTypes.TEXT },
    comment: { type: DataTypes.TEXT },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'user_decisions', timestamps: false }
);
