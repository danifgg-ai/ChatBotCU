/**
 * Script para inicializar o reparar archivos JSON del backend
 * Ejecutar con: node initializeDataFiles.js
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

// Estructura por defecto para cada archivo
const defaultData = {
  'embeddings.json': [],
  'conversations.json': [],
  'users.json': {},
  'waitingList.json': [],
  'userInteractions.json': {}
};

console.log('🔧 Inicializando archivos de datos...\n');

// Crear directorio data si no existe
if (!fs.existsSync(dataDir)) {
  console.log('📁 Creando directorio data/');
  fs.mkdirSync(dataDir, { recursive: true });
}

// Verificar y crear/reparar cada archivo
Object.entries(defaultData).forEach(([fileName, defaultValue]) => {
  const filePath = path.join(dataDir, fileName);
  
  try {
    if (!fs.existsSync(filePath)) {
      // Archivo no existe, crearlo
      console.log(`✨ Creando ${fileName}...`);
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      console.log(`   ✓ ${fileName} creado`);
      
    } else {
      // Archivo existe, verificar si es válido
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (!content || content.trim() === '') {
        console.log(`⚠️  ${fileName} está vacío, reparando...`);
        fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
        console.log(`   ✓ ${fileName} reparado`);
        
      } else {
        try {
          JSON.parse(content);
          console.log(`✓ ${fileName} es válido`);
        } catch (error) {
          console.log(`❌ ${fileName} tiene JSON inválido, reparando...`);
          // Hacer backup del archivo corrupto
          const backupPath = filePath + '.backup.' + Date.now();
          fs.writeFileSync(backupPath, content);
          console.log(`   💾 Backup guardado en: ${path.basename(backupPath)}`);
          
          // Recrear con datos por defecto
          fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
          console.log(`   ✓ ${fileName} reparado`);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error procesando ${fileName}:`, error.message);
  }
});

console.log('\n✅ Proceso completado\n');

// Mostrar resumen
console.log('📊 Resumen de archivos:');
Object.keys(defaultData).forEach(fileName => {
  const filePath = path.join(dataDir, fileName);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`   ${fileName}: ${stats.size} bytes`);
  }
});

console.log('\n💡 Ahora puedes iniciar el servidor con: node server.js\n');