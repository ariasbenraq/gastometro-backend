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

  @Column({ type: 'varchar', length: 80 })
  usuario: string;

  @Column({ type: 'varchar', length: 150 })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  telefono: string;

  @ManyToOne(() => RolesUsuario, (rol) => rol.usuarios, { nullable: true })
  @JoinColumn({ name: 'rol_id' })
  rol?: RolesUsuario;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
