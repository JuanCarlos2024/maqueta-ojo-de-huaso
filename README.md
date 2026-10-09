# Ojo de Huaso — Fase 1

Sistema de apoyo al análisis de atajadas del rodeo chileno.
Esta fase incluye la **interfaz**, la **carga y reproducción de videos locales** y la **selección del momento** a analizar.
La inteligencia artificial aún **no** está conectada: no se generan puntajes ni detecciones.

> Herramienta independiente de SIPLAN. No registra ni modifica puntajes oficiales.

## Requisitos

- Node.js 20 o superior

## Cómo ejecutar

```bash
npm install      # solo la primera vez
npm run dev      # abre http://localhost:5173
```

Otros comandos:

```bash
npm test         # pruebas unitarias (tiempos y validaciones)
npm run build    # compilación de producción en /dist
```

## Uso

1. **Inicio → Comenzar análisis** (o "Nuevo análisis" en el menú).
2. **Cargar video**: botón "Seleccionar video" o arrastrar y soltar un MP4. El archivo se reproduce localmente; nunca se sube a un servidor.
3. **Vista previa**: reproducir / pausar, ±5 s, barra de progreso, volumen, velocidad (1x / 0.5x / 0.25x) y pantalla completa. Atajos: espacio, ← y →.
4. **Seleccionar momento**: escribir los tiempos (`mm:ss.s` o segundos), usar "Marcar inicio / Marcar término" o arrastrar las manillas de la línea de tiempo.
5. **Reproducir momento seleccionado**: reproduce solo el intervalo y se detiene en el término.
6. **Analizar momento**: en esta fase solo informa que el módulo de IA se incorporará más adelante.

Validaciones del intervalo: inicio ≥ 0, término posterior al inicio, término ≤ duración del video, intervalo ≤ 60 s.

## Estructura

```
src/
├── App.jsx                      Rutas (Inicio, Nuevo análisis)
├── config/constants.js          Límite de 60 s, formatos aceptados, bandera AI_MODULE_AVAILABLE
├── components/
│   ├── layout/                  Sidebar, Header (tablet), PageHeader, Logo, Layout
│   ├── video/                   VideoUploader, VideoPlayer
│   ├── analysis/                TimeSelector, IntervalTimeline, AnalysisSummary, AiModuleNotice
│   └── ui/                      Card, Badge
├── hooks/useVideoFile.js        Archivo seleccionado, URL local y errores de reproducción
├── pages/                       Home, NewAnalysis
├── services/analysisService.js  Punto de integración con el futuro backend en Python
└── utils/                       time.js, validation.js (+ pruebas *.test.js)
```

## Mockups

Los diseños de referencia están en [`docs/mockups/`](docs/mockups/). En la Fase 1 se implementan *Nuevo análisis* y la validación del momento; las pantallas de análisis en proceso, resultado y detalle corresponden a fases futuras.

## Logotipo

`src/components/layout/Logo.jsx` contiene un logotipo provisional. Para usar el oficial, guardarlo en `public/` y reemplazar el contenido del componente por una etiqueta `<img>` (instrucciones en el archivo).

## Colores

Los colores de `src/index.css` (`@theme`) son una **propuesta visual inicial**, no códigos oficiales verificados de la Federación del Rodeo Chileno.

## Próximas fases (no implementadas)

Backend en Python, modelos de ML, recomendación de puntaje (0, 2, 3 y 4), detección de faltas, porcentajes de confianza, historial y exportación PDF / Excel.
El punto de conexión es `requestAnalysis()` en `src/services/analysisService.js`.
