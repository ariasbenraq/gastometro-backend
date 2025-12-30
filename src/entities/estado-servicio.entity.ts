import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TiendaIbk } from './tienda-ibk.entity';

@Entity({ name: 'estado_servicio' })
export class EstadoServicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  estado: string;

  @OneToMany(() => TiendaIbk, (tienda) => tienda.estadoServicio)
  tiendas: TiendaIbk[];
}
