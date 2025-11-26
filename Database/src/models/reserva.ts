import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
} from "sequelize-typescript";
import { Mesa } from "./mesa";

@Table({ tableName: "reserva", timestamps: false })
export class Reserva extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    idReserva!: number;

    @Column({
        type: DataType.ENUM('pendiente', 'confirmada', 'cancelada'),
        allowNull: false
    })
    estado!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    fechaReserva!: Date;

    @ForeignKey(() => Mesa)
    @Column(DataType.INTEGER)
    idMesa!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    idCliente!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    cantidadPersonas!: number;

    @BelongsTo(() => Mesa)
    mesa!: Mesa;
}