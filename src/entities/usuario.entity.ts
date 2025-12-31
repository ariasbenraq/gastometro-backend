import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RolesUsuario } from './roles-usuario.entity';

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nombre_apellido: string;

  @Column({ type: 'varchar', length: 80, nullable: true, unique: true })
  usuario: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'password_hash',
    nullable: true,
    select: false,
  })
  passwordHash?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono: string;

  @ManyToOne(() => RolesUsuario, (rol) => rol.usuarios, { nullable: true })
  @JoinColumn({ name: 'rol_id' })
  rol?: RolesUsuario;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
