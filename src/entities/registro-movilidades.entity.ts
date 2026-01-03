import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TiendaIbk } from './tienda-ibk.entity';
import { Usuario } from './usuario.entity';

@Entity({ name: 'registro_movilidades' })
export class RegistroMovilidades {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'varchar', length: 120 })
  inicio: string;

  @Column({ type: 'varchar', length: 120 })
  fin: string;

  @Column({ type: 'varchar', length: 250 })
  motivo: string;

  @Column({ type: 'varchar', length: 250 })
  detalle: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto: number;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => TiendaIbk, (tienda) => tienda.registrosMovilidades, {
    nullable: true,
  })
  @JoinColumn({ name: 'tienda_id' })
  tienda?: TiendaIbk;

  @Column({ type: 'varchar', length: 100 })
  ticket: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
