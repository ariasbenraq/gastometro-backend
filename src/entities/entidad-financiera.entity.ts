import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'entidades_financieras' })
export class EntidadFinanciera {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'varchar', length: 50 })
  tipo: string;
}
