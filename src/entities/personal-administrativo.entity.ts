import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Gasto } from './gasto.entity';
import { Ingreso } from './ingreso.entity';
import { Usuario } from './usuario.entity';

@Entity({ name: 'personal_administrativo' })
export class PersonalAdministrativo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @OneToMany(() => Gasto, (gasto) => gasto.aprobadoPor)
  gastos: Gasto[];

  @OneToMany(() => Ingreso, (ingreso) => ingreso.depositadoPor)
  ingresos: Ingreso[];
}
