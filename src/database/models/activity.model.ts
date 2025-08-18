import { DataTypes, Model, Sequelize} from 'sequelize';

export class Activity extends Model {
    id!: string; // UUID
    description!: string; // Descripción de la actividad
    time!: Date; // Hora de la actividad
    location!: string; // Ubicación de la actividad
    presupuesto!: number; // Presupuesto asignado a la actividad
    transportationMode!: string; // Modo de transporte asociado a la actividad
    imgUrl!: string; // URL de la imagen representativa de la actividad
    itineraryId!: string; // ID del itinerario asociado
    tripId!: string; // ID del viaje asociado
}


export default (sequelize: Sequelize) => {
    
    Activity.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        presupuesto: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        transportationMode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        imgUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        itineraryId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'itineraries', // Nombre de la tabla de itinerarios
                key: 'id',
            },
        },
    }, {
        sequelize, // Pasar la instancia de Sequelize
        tableName: 'activities', // Nombre de la tabla
        timestamps: true, // Para crear createdAt y updatedAt automáticamente
        underscored: true, // Para usar snake_case en lugar de camelCase
    })
}
