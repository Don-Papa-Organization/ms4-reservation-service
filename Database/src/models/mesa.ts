import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement
} from "sequelize-typescript";

@Table({ tableName: "mesa", timestamps: false })
export class Mesa extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    idMesa!: number;

    @Column({
        type: DataType.ENUM('VIP', 'Regular'),
        allowNull: false
    })
    tipo!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    numero!: number;

    @Column({
        type: DataType.ENUM('Disponible', 'Reservada', 'Ocupada','Fuerda de servicio'),
        allowNull: false
    })
    estado!: string;
}