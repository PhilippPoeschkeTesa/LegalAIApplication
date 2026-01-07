import { User } from '../models/User';
import { CreateUserDTO, UpdateUserDTO, UserCreationAttributes } from '../types/UserTypes';

export class UserRepository {
  async findById(id: string) {
    return User.findByPk(id);
  }
  async findByEmail(email: string) {
    return User.findOne({ where: { email } });
  }
  async create(userData: CreateUserDTO) {
    return User.create(userData as UserCreationAttributes);
  }
  async update(id: string, updates: UpdateUserDTO) {
    return User.update(updates, { where: { id } });
  }
  async delete(id: string) {
    return User.destroy({ where: { id } });
  }
  async findAll() {
    return User.findAll();
  }
}

export const userRepository = new UserRepository();
