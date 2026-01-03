import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PersonalAdministrativo } from './personal-administrativo.entity';
import { Usuario } from './usuario.entity';

@Entity({ name: 'ingresos' })
export class Ingreso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto: number;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => PersonalAdministrativo, (personal) => personal.ingresos, {
    nullable: true,
  })
  @JoinColumn({ name: 'depositado_por' })
  depositadoPor?: PersonalAdministrativo;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
