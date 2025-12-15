/**
 * ============================================
 * FIRESTORE.SERVICE.JS - Servicio CRUD Genérico
 * ============================================
 * Operaciones básicas con Firestore
 */

const FirestoreService = {
  
  // ============================================
  // CREATE - Crear documento
  // ============================================
  
  /**
   * Crear documento con ID automático
   * @param {string} collection - Nombre de la colección
   * @param {Object} data - Datos del documento
   * @returns {Promise<Object>} Documento creado con ID
   */
  async create(collection, data) {
    try {
      if (ENV.isDev) {
        console.log(`📝 Creando documento en ${collection}:`, data);
      }
      
      // Agregar timestamps
      const docData = {
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = await firebase.firestore()
        .collection(collection)
        .add(docData);
      
      if (ENV.isDev) {
        console.log(`✅ Documento creado con ID: ${docRef.id}`);
      }
      
      return {
        id: docRef.id,
        ...docData
      };
      
    } catch (error) {
      console.error(`❌ Error creando documento en ${collection}:`, error);
      throw error;
    }
  },
  
  /**
   * Crear documento con ID específico
   * @param {string} collection - Nombre de la colección
   * @param {string} id - ID del documento
   * @param {Object} data - Datos del documento
   */
  async createWithId(collection, id, data) {
    try {
      if (ENV.isDev) {
        console.log(`📝 Creando documento ${id} en ${collection}:`, data);
      }
      
      const docData = {
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      await firebase.firestore()
        .collection(collection)
        .doc(id)
        .set(docData);
      
      if (ENV.isDev) {
        console.log(`✅ Documento ${id} creado`);
      }
      
      return {
        id,
        ...docData
      };
      
    } catch (error) {
      console.error(`❌ Error creando documento ${id}:`, error);
      throw error;
    }
  },
  
  // ============================================
  // READ - Leer documentos
  // ============================================
  
  /**
   * Obtener documento por ID
   * @param {string} collection - Nombre de la colección
   * @param {string} id - ID del documento
   * @returns {Promise<Object|null>} Documento o null
   */
  async getById(collection, id) {
    try {
      if (ENV.isDev) {
        console.log(`🔍 Obteniendo documento ${id} de ${collection}`);
      }
      
      const doc = await firebase.firestore()
        .collection(collection)
        .doc(id)
        .get();
      
      if (!doc.exists) {
        if (ENV.isDev) {
          console.warn(`⚠️ Documento ${id} no existe`);
        }
        return null;
      }
      
      const data = {
        id: doc.id,
        ...doc.data()
      };
      
      if (ENV.isDev) {
        console.log(`✅ Documento ${id} encontrado`);
      }
      
      return data;
      
    } catch (error) {
      console.error(`❌ Error obteniendo documento ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Obtener todos los documentos de una colección
   * @param {string} collection - Nombre de la colección
   * @returns {Promise<Array>} Array de documentos
   */
  async getAll(collection) {
    try {
      if (ENV.isDev) {
        console.log(`📚 Obteniendo todos los documentos de ${collection}`);
      }
      
      const snapshot = await firebase.firestore()
        .collection(collection)
        .get();
      
      const docs = [];
      snapshot.forEach(doc => {
        docs.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      if (ENV.isDev) {
        console.log(`✅ ${docs.length} documentos obtenidos`);
      }
      
      return docs;
      
    } catch (error) {
      console.error(`❌ Error obteniendo documentos de ${collection}:`, error);
      throw error;
    }
  },
  
  /**
   * Consultar documentos con filtros
   * @param {string} collection - Nombre de la colección
   * @param {Array} filters - Array de filtros [field, operator, value]
   * @param {Object} options - Opciones de ordenamiento y límite
   * @returns {Promise<Array>} Array de documentos
   */
  async query(collection, filters = [], options = {}) {
    try {
      if (ENV.isDev) {
        console.log(`🔍 Consultando ${collection}:`, { filters, options });
      }
      
      let query = firebase.firestore().collection(collection);
      
      // Aplicar filtros
      filters.forEach(([field, operator, value]) => {
        query = query.where(field, operator, value);
      });
      
      // Ordenamiento
      if (options.orderBy) {
        const direction = options.orderDirection || 'asc';
        query = query.orderBy(options.orderBy, direction);
      }
      
      // Límite
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const snapshot = await query.get();
      
      const docs = [];
      snapshot.forEach(doc => {
        docs.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      if (ENV.isDev) {
        console.log(`✅ ${docs.length} documentos encontrados`);
      }
      
      return docs;
      
    } catch (error) {
      console.error(`❌ Error consultando ${collection}:`, error);
      throw error;
    }
  },
  
  // ============================================
  // UPDATE - Actualizar documentos
  // ============================================
  
  /**
   * Actualizar documento
   * @param {string} collection - Nombre de la colección
   * @param {string} id - ID del documento
   * @param {Object} data - Datos a actualizar
   */
  async update(collection, id, data) {
    try {
      if (ENV.isDev) {
        console.log(`📝 Actualizando documento ${id} en ${collection}:`, data);
      }
      
      const updateData = {
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      await firebase.firestore()
        .collection(collection)
        .doc(id)
        .update(updateData);
      
      if (ENV.isDev) {
        console.log(`✅ Documento ${id} actualizado`);
      }
      
      return {
        id,
        ...updateData
      };
      
    } catch (error) {
      console.error(`❌ Error actualizando documento ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Actualizar o crear documento (upsert)
   * @param {string} collection - Nombre de la colección
   * @param {string} id - ID del documento
   * @param {Object} data - Datos del documento
   */
  async set(collection, id, data) {
    try {
      if (ENV.isDev) {
        console.log(`📝 Set documento ${id} en ${collection}:`, data);
      }
      
      const docData = {
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      await firebase.firestore()
        .collection(collection)
        .doc(id)
        .set(docData, { merge: true });
      
      if (ENV.isDev) {
        console.log(`✅ Documento ${id} guardado`);
      }
      
      return {
        id,
        ...docData
      };
      
    } catch (error) {
      console.error(`❌ Error guardando documento ${id}:`, error);
      throw error;
    }
  },
  
  // ============================================
  // DELETE - Eliminar documentos
  // ============================================
  
  /**
   * Eliminar documento
   * @param {string} collection - Nombre de la colección
   * @param {string} id - ID del documento
   */
  async delete(collection, id) {
    try {
      if (ENV.isDev) {
        console.log(`🗑️ Eliminando documento ${id} de ${collection}`);
      }
      
      await firebase.firestore()
        .collection(collection)
        .doc(id)
        .delete();
      
      if (ENV.isDev) {
        console.log(`✅ Documento ${id} eliminado`);
      }
      
      return { success: true, id };
      
    } catch (error) {
      console.error(`❌ Error eliminando documento ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Eliminar múltiples documentos
   * @param {string} collection - Nombre de la colección
   * @param {Array} ids - Array de IDs
   */
  async deleteMany(collection, ids) {
    try {
      if (ENV.isDev) {
        console.log(`🗑️ Eliminando ${ids.length} documentos de ${collection}`);
      }
      
      const batch = firebase.firestore().batch();
      
      ids.forEach(id => {
        const docRef = firebase.firestore()
          .collection(collection)
          .doc(id);
        batch.delete(docRef);
      });
      
      await batch.commit();
      
      if (ENV.isDev) {
        console.log(`✅ ${ids.length} documentos eliminados`);
      }
      
      return { success: true, count: ids.length };
      
    } catch (error) {
      console.error(`❌ Error eliminando documentos:`, error);
      throw error;
    }
  },
  
  // ============================================
  // LISTENERS - Escuchar cambios en tiempo real
  // ============================================
  
  /**
   * Escuchar cambios en un documento
   * @param {string} collection - Nombre de la colección
   * @param {string} id - ID del documento
   * @param {Function} callback - Función a ejecutar con los cambios
   * @returns {Function} Función para detener el listener
   */
  onSnapshot(collection, id, callback) {
    if (ENV.isDev) {
      console.log(`👂 Escuchando cambios en documento ${id} de ${collection}`);
    }
    
    return firebase.firestore()
      .collection(collection)
      .doc(id)
      .onSnapshot(
        doc => {
          if (doc.exists) {
            callback({
              id: doc.id,
              ...doc.data()
            });
          } else {
            callback(null);
          }
        },
        error => {
          console.error(`❌ Error en listener:`, error);
        }
      );
  },
  
  /**
   * Escuchar cambios en una consulta
   * @param {string} collection - Nombre de la colección
   * @param {Array} filters - Array de filtros
   * @param {Function} callback - Función a ejecutar con los cambios
   * @returns {Function} Función para detener el listener
   */
  onQuerySnapshot(collection, filters, callback) {
    if (ENV.isDev) {
      console.log(`👂 Escuchando cambios en consulta ${collection}:`, filters);
    }
    
    let query = firebase.firestore().collection(collection);
    
    filters.forEach(([field, operator, value]) => {
      query = query.where(field, operator, value);
    });
    
    return query.onSnapshot(
      snapshot => {
        const docs = [];
        snapshot.forEach(doc => {
          docs.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(docs);
      },
      error => {
        console.error(`❌ Error en listener:`, error);
      }
    );
  },
  
  // ============================================
  // UTILIDADES
  // ============================================
  
  /**
   * Verificar si un documento existe
   * @param {string} collection - Nombre de la colección
   * @param {string} id - ID del documento
   * @returns {Promise<boolean>}
   */
  async exists(collection, id) {
    try {
      const doc = await firebase.firestore()
        .collection(collection)
        .doc(id)
        .get();
      
      return doc.exists;
      
    } catch (error) {
      console.error(`❌ Error verificando existencia:`, error);
      throw error;
    }
  },
  
  /**
   * Contar documentos en una colección
   * @param {string} collection - Nombre de la colección
   * @param {Array} filters - Filtros opcionales
   * @returns {Promise<number>}
   */
  async count(collection, filters = []) {
    try {
      let query = firebase.firestore().collection(collection);
      
      filters.forEach(([field, operator, value]) => {
        query = query.where(field, operator, value);
      });
      
      const snapshot = await query.get();
      return snapshot.size;
      
    } catch (error) {
      console.error(`❌ Error contando documentos:`, error);
      throw error;
    }
  }
};

// Exportar globalmente
window.FirestoreService = FirestoreService;

console.log('✅ firestore.service.js cargado correctamente');
