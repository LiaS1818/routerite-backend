import path from 'path';
import fs from 'fs';
import { Sequelize, Model } from 'sequelize-typescript';

// Tu instancia de Sequelize desde la configuración
import { databaseConfig } from '../config/database.config';

const sequelize = new Sequelize(databaseConfig);

// Objeto para almacenar todos los modelos exportados
const db: { [key: string]: any } = {};

// Ruta de la carpeta actual (models/)
const modelsDir = __dirname;

// Leer todos los archivos de modelos en esta carpeta
fs.readdirSync(modelsDir)
  .filter((file) => {
    const ext = path.extname(file);
    return (
      file !== 'index.ts' && // evitar este archivo
      file !== 'index.js' &&
      (ext === '.ts' || ext === '.js')
    );
  })
  .forEach((file) => {
    const modelPath = path.join(modelsDir, file);
    const modelModule = require(modelPath);

    // Registrar cada clase de modelo exportada
    Object.entries(modelModule).forEach(([modelName, modelClass]) => {
      if (
        typeof modelClass === 'function' &&
        modelClass.prototype instanceof Model
      ) {
        sequelize.addModels([modelClass as typeof Model & { new (): Model }]);
        db[modelName] = modelClass; // guardar referencia para exportar
      }
    });
  });

// Exportar la conexión y los modelos
export { sequelize };
export default db;
