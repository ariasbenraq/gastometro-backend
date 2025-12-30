import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PersonalAdministrativo } from './personal-administrativo.entity';

@Entity({ name: 'gastos' })
export class Gasto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'varchar', length: 150 })
  item: string;

  @Column({ type: 'varchar', length: 250 })
  motivo: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto: number;

  @ManyToOne(() => PersonalAdministrativo, (personal) => personal.gastos, {
    nullable: true,
  })
  @JoinColumn({ name: 'aprobado_por' })
  aprobadoPor?: PersonalAdministrativo;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
