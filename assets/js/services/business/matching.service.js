/**
 * ============================================
 * MATCHING.SERVICE.JS - Algoritmo de Emparejamiento
 * ============================================
 * Sistema inteligente de sugerencias de emparejamiento
 */

const MatchingService = {
  
  // ============================================
  // SUGERENCIAS DE EMPAREJAMIENTO
  // ============================================
  
  /**
   * Generar sugerencias de emparejamiento para un visitante
   * @param {string} visitanteId - ID de postulación visitante
   * @returns {Promise<Array>}
   */
  async getSugerenciasParaVisitante(visitanteId) {
    try {
      const visitante = await PostulacionesService.getById(visitanteId);
      
      if (!visitante || visitante.tipo !== CONSTANTS.TIPOS_POSTULACION.VISITANTE) {
        throw new Error('Postulación de visitante no válida');
      }
      
      // Obtener anfitriones aprobados del mismo evento
      const anfitriones = await PostulacionesService.getByEvento(
        visitante.eventoId,
        CONSTANTS.TIPOS_POSTULACION.ANFITRION
      );
      
      const aprobados = anfitriones.filter(a => 
        a.estado === CONSTANTS.ESTADOS.APROBADO &&
        a.capacidadDisponible >= visitante.numPersonas
      );
      
      // Calcular score para cada anfitrión
      const sugerencias = aprobados.map(anfitrion => ({
        anfitrion,
        score: this._calcularScore(visitante, anfitrion),
        detalles: this._getDetallesCompatibilidad(visitante, anfitrion)
      }));
      
      // Ordenar por score descendente
      sugerencias.sort((a, b) => b.score - a.score);
      
      return sugerencias;
      
    } catch (error) {
      console.error('Error generando sugerencias:', error);
      throw error;
    }
  },
  
  /**
   * Generar sugerencias de emparejamiento para un anfitrión
   * @param {string} anfitrionId - ID de postulación anfitrión
   * @returns {Promise<Array>}
   */
  async getSugerenciasParaAnfitrion(anfitrionId) {
    try {
      const anfitrion = await PostulacionesService.getById(anfitrionId);
      
      if (!anfitrion || anfitrion.tipo !== CONSTANTS.TIPOS_POSTULACION.ANFITRION) {
        throw new Error('Postulación de anfitrión no válida');
      }
      
      // Obtener visitantes aprobados del mismo evento
      const visitantes = await PostulacionesService.getByEvento(
        anfitrion.eventoId,
        CONSTANTS.TIPOS_POSTULACION.VISITANTE
      );
      
      const aprobados = visitantes.filter(v => 
        v.estado === CONSTANTS.ESTADOS.APROBADO &&
        v.numPersonas <= anfitrion.capacidadDisponible
      );
      
      // Calcular score para cada visitante
      const sugerencias = aprobados.map(visitante => ({
        visitante,
        score: this._calcularScore(visitante, anfitrion),
        detalles: this._getDetallesCompatibilidad(visitante, anfitrion)
      }));
      
      // Ordenar por score descendente
      sugerencias.sort((a, b) => b.score - a.score);
      
      return sugerencias;
      
    } catch (error) {
      console.error('Error generando sugerencias:', error);
      throw error;
    }
  },
  
  /**
   * Generar todas las sugerencias de un evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Array>}
   */
  async getSugerenciasEvento(eventoId) {
    try {
      const { visitantes, anfitriones } = await PostulacionesService.getPendientesByEvento(eventoId);
      
      const aprobadosVisitantes = visitantes.filter(v => v.estado === CONSTANTS.ESTADOS.APROBADO);
      const aprobadosAnfitriones = anfitriones.filter(a => a.estado === CONSTANTS.ESTADOS.APROBADO);
      
      const sugerencias = [];
      
      // Para cada visitante, encontrar mejores anfitriones
      for (const visitante of aprobadosVisitantes) {
        const candidatos = aprobadosAnfitriones.filter(a => 
          a.capacidadDisponible >= visitante.numPersonas
        );
        
        if (candidatos.length > 0) {
          const scores = candidatos.map(anfitrion => ({
            visitanteId: visitante.id,
            anfitrionId: anfitrion.id,
            visitante,
            anfitrion,
            score: this._calcularScore(visitante, anfitrion),
            detalles: this._getDetallesCompatibilidad(visitante, anfitrion)
          }));
          
          // Tomar el mejor match
          scores.sort((a, b) => b.score - a.score);
          sugerencias.push(scores[0]);
        }
      }
      
      // Ordenar por score general
      sugerencias.sort((a, b) => b.score - a.score);
      
      return sugerencias;
      
    } catch (error) {
      console.error('Error generando sugerencias del evento:', error);
      throw error;
    }
  },
  
  // ============================================
  // ALGORITMO DE SCORING
  // ============================================
  
  /**
   * Calcular score de compatibilidad (0-100)
   * @private
   * @param {Object} visitante - Postulación visitante
   * @param {Object} anfitrion - Postulación anfitrión
   * @returns {number}
   */
  _calcularScore(visitante, anfitrion) {
    let score = 0;
    let maxScore = 0;
    
    // 1. MISMO EVENTO (obligatorio) - 20 puntos
    maxScore += 20;
    if (visitante.eventoId === anfitrion.eventoId) {
      score += 20;
    } else {
      return 0; // No compatible
    }
    
    // 2. CAPACIDAD SUFICIENTE (obligatorio) - 20 puntos
    maxScore += 20;
    if (anfitrion.capacidadDisponible >= visitante.numPersonas) {
      score += 20;
      
      // Bonus si la capacidad es justa (no sobra mucho)
      const diferencia = anfitrion.capacidadDisponible - visitante.numPersonas;
      if (diferencia <= 2) {
        score += 5;
        maxScore += 5;
      }
    } else {
      return 0; // No compatible
    }
    
    // 3. COMPATIBILIDAD DE GÉNERO - 15 puntos
    maxScore += 15;
    if (anfitrion.generoAcepta === 'ambos') {
      score += 15;
    } else if (visitante.genero === anfitrion.generoAcepta) {
      score += 15;
    } else if (visitante.genero === 'mixto') {
      score += 8; // Medio punto
    }
    
    // 4. COMPATIBILIDAD DE FECHAS - 15 puntos
    maxScore += 15;
    const scoresFechas = this._calcularScoreFechas(visitante, anfitrion);
    score += scoresFechas;
    
    // 5. NIÑOS - 10 puntos
    maxScore += 10;
    const tieneNinos = visitante.edades?.some(e => e < 12);
    if (!tieneNinos) {
      score += 10; // No hay problema
    } else if (anfitrion.aceptaNinos) {
      score += 10; // Acepta niños
    } else {
      score += 0; // No acepta niños
    }
    
    // 6. MASCOTAS - 5 puntos
    maxScore += 5;
    if (!visitante.tieneMascotas) {
      score += 5;
    } else if (anfitrion.aceptaMascotas) {
      score += 5;
    }
    
    // 7. DISTANCIA AL EVENTO - 10 puntos
    maxScore += 10;
    if (anfitrion.distanciaEvento) {
      if (anfitrion.distanciaEvento.metros <= 1000) {
        score += 10; // Muy cerca
      } else if (anfitrion.distanciaEvento.metros <= 3000) {
        score += 7; // Cerca
      } else if (anfitrion.distanciaEvento.metros <= 5000) {
        score += 4; // Distancia razonable
      } else {
        score += 2; // Lejos pero aceptable
      }
    } else {
      score += 5; // Distancia desconocida
    }
    
    // 8. COMODIDADES - 5 puntos
    maxScore += 5;
    const comodidadesScore = this._calcularScoreComodidades(anfitrion);
    score += comodidadesScore;
    
    // Normalizar a escala de 0-100
    const finalScore = Math.round((score / maxScore) * 100);
    
    return Math.min(100, Math.max(0, finalScore));
  },
  
  /**
   * Calcular score de compatibilidad de fechas
   * @private
   */
  _calcularScoreFechas(visitante, anfitrion) {
    const llegada = new Date(visitante.fechaLlegada);
    const salida = new Date(visitante.fechaSalida);
    const disponibleDesde = new Date(anfitrion.fechaDisponibleDesde);
    const disponibleHasta = new Date(anfitrion.fechaDisponibleHasta);
    
    // Fechas perfectamente dentro del rango
    if (llegada >= disponibleDesde && salida <= disponibleHasta) {
      return 15;
    }
    
    // Llegada dentro del rango pero salida fuera (pequeño desborde)
    if (llegada >= disponibleDesde && llegada <= disponibleHasta) {
      const diasFuera = Math.ceil((salida - disponibleHasta) / (1000 * 60 * 60 * 24));
      if (diasFuera <= 1) return 12;
      if (diasFuera <= 2) return 8;
      return 5;
    }
    
    // Fechas no compatibles
    return 0;
  },
  
  /**
   * Calcular score de comodidades
   * @private
   */
  _calcularScoreComodidades(anfitrion) {
    if (!anfitrion.comodidades || anfitrion.comodidades.length === 0) {
      return 2;
    }
    
    // Más comodidades = mejor score
    const numComodidades = anfitrion.comodidades.length;
    if (numComodidades >= 5) return 5;
    if (numComodidades >= 3) return 4;
    if (numComodidades >= 1) return 3;
    return 2;
  },
  
  // ============================================
  // DETALLES DE COMPATIBILIDAD
  // ============================================
  
  /**
   * Obtener detalles de compatibilidad
   * @private
   */
  _getDetallesCompatibilidad(visitante, anfitrion) {
    const detalles = {
      pros: [],
      contras: [],
      neutros: []
    };
    
    // Capacidad
    if (anfitrion.capacidadDisponible >= visitante.numPersonas) {
      const diferencia = anfitrion.capacidadDisponible - visitante.numPersonas;
      if (diferencia === 0) {
        detalles.pros.push('Capacidad exacta');
      } else if (diferencia <= 2) {
        detalles.pros.push('Capacidad justa');
      } else {
        detalles.neutros.push(`Capacidad sobrada (${diferencia} espacios extra)`);
      }
    } else {
      detalles.contras.push('Capacidad insuficiente');
    }
    
    // Género
    if (anfitrion.generoAcepta === 'ambos') {
      detalles.pros.push('Acepta cualquier género');
    } else if (visitante.genero === anfitrion.generoAcepta) {
      detalles.pros.push('Género compatible');
    } else {
      detalles.contras.push('Posible incompatibilidad de género');
    }
    
    // Niños
    const tieneNinos = visitante.edades?.some(e => e < 12);
    if (tieneNinos) {
      if (anfitrion.aceptaNinos) {
        detalles.pros.push('Acepta niños');
      } else {
        detalles.contras.push('No acepta niños');
      }
    }
    
    // Mascotas
    if (visitante.tieneMascotas) {
      if (anfitrion.aceptaMascotas) {
        detalles.pros.push('Acepta mascotas');
      } else {
        detalles.contras.push('No acepta mascotas');
      }
    }
    
    // Distancia
    if (anfitrion.distanciaEvento) {
      const km = anfitrion.distanciaEvento.metros / 1000;
      if (km <= 1) {
        detalles.pros.push(`Muy cerca del evento (${km.toFixed(1)} km)`);
      } else if (km <= 3) {
        detalles.pros.push(`Cerca del evento (${km.toFixed(1)} km)`);
      } else if (km <= 5) {
        detalles.neutros.push(`Distancia razonable (${km.toFixed(1)} km)`);
      } else {
        detalles.contras.push(`Lejos del evento (${km.toFixed(1)} km)`);
      }
    }
    
    // Fechas
    const fechasCompatibles = this._validarFechas(visitante, anfitrion);
    if (fechasCompatibles.perfectas) {
      detalles.pros.push('Fechas perfectamente compatibles');
    } else if (fechasCompatibles.parciales) {
      detalles.neutros.push('Fechas parcialmente compatibles');
    } else {
      detalles.contras.push('Fechas incompatibles');
    }
    
    // Comodidades
    if (anfitrion.comodidades && anfitrion.comodidades.length > 0) {
      detalles.pros.push(`${anfitrion.comodidades.length} comodidades disponibles`);
    }
    
    return detalles;
  },
  
  /**
   * Validar compatibilidad de fechas
   * @private
   */
  _validarFechas(visitante, anfitrion) {
    const llegada = new Date(visitante.fechaLlegada);
    const salida = new Date(visitante.fechaSalida);
    const disponibleDesde = new Date(anfitrion.fechaDisponibleDesde);
    const disponibleHasta = new Date(anfitrion.fechaDisponibleHasta);
    
    const perfectas = llegada >= disponibleDesde && salida <= disponibleHasta;
    const parciales = (llegada >= disponibleDesde && llegada <= disponibleHasta) ||
                     (salida >= disponibleDesde && salida <= disponibleHasta);
    
    return { perfectas, parciales };
  },
  
  // ============================================
  // UTILIDADES
  // ============================================
  
  /**
   * Obtener etiqueta de score
   * @param {number} score - Score de 0-100
   * @returns {Object}
   */
  getScoreLabel(score) {
    if (score >= 90) {
      return { label: 'Excelente', color: 'success', emoji: '🌟' };
    } else if (score >= 75) {
      return { label: 'Muy Bueno', color: 'success', emoji: '✅' };
    } else if (score >= 60) {
      return { label: 'Bueno', color: 'info', emoji: '👍' };
    } else if (score >= 40) {
      return { label: 'Regular', color: 'warning', emoji: '⚠️' };
    } else {
      return { label: 'Bajo', color: 'error', emoji: '❌' };
    }
  }
};

// Exportar globalmente
window.MatchingService = MatchingService;

console.log('✅ matching.service.js cargado correctamente');
