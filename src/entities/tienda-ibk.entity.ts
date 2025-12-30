import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EstadoServicio } from './estado-servicio.entity';
import { RegistroMovilidades } from './registro-movilidades.entity';

@Entity({ name: 'tiendas_ibk' })
export class TiendaIbk {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EstadoServicio, (estado) => estado.tiendas, { nullable: true })
  @JoinColumn({ name: 'estado_servicio_id' })
  estadoServicio?: EstadoServicio;

  @Column({ type: 'varchar', length: 50 })
  codigo_tienda: string;

  @Column({ type: 'varchar', length: 150 })
  nombre_tienda: string;

  @Column({ type: 'varchar', length: 100 })
  distrito: string;

  @Column({ type: 'varchar', length: 100 })
  provincia: string;

  @Column({ type: 'varchar', length: 100 })
  departamento: string;

  @OneToMany(() => RegistroMovilidades, (registro) => registro.tienda)
  registrosMovilidades: RegistroMovilidades[];
}
