import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'distritos_lima' })
export class DistritoLima {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'char', length: 6 })
  ubigeo: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  codigo_postal_ref?: string;
}
