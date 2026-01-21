import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DistritoLima } from './distrito-lima.entity';
import { EntidadFinanciera } from './entidad-financiera.entity';
import { Usuario } from './usuario.entity';

@Entity({ name: 'registro_movilidades' })
export class RegistroMovilidades {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: string;

  @ManyToOne(() => DistritoLima, { nullable: false })
  @JoinColumn({ name: 'inicio_id' })
  inicio: DistritoLima;

  @ManyToOne(() => DistritoLima, { nullable: false })
  @JoinColumn({ name: 'fin_id' })
  fin: DistritoLima;

  @Column({ type: 'varchar', length: 250 })
  motivo: string;

  @Column({ type: 'varchar', length: 250 })
  detalle: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto: number;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => EntidadFinanciera, { nullable: false })
  @JoinColumn({ name: 'cliente_id' })
  cliente: EntidadFinanciera;

  @Column({ type: 'varchar', length: 100 })
  wo: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
