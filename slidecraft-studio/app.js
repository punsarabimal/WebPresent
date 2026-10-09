/**
 * SlideCraft Studio - Core Application Architecture
 * Pure Vanilla JavaScript (ES6+) - Local-First Presentation Suite
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. CONSTANTS & SYSTEM CONFIGURATION
  // =========================================================================
  const CANVAS_WIDTH = 1920;
  const CANVAS_HEIGHT = 1080;
  const SNAP_THRESHOLD = 12;
  const DB_NAME = 'SlideCraftStudioDB';
  const DB_VERSION = 1;
  const MAX_HISTORY_STEPS = 40;

  // =========================================================================
  // 2. INDEXEDDB LOCAL STORAGE MANAGER
  // =========================================================================
  class StorageManager {
    constructor() {
      this.db = null;
    }

    async init() {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('projects')) {
            db.createObjectStore('projects', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('media_assets')) {
            db.createObjectStore('media_assets', { keyPath: 'id' });
          }
        };
        req.onsuccess = (e) => {
          this.db = e.target.result;
          resolve(this.db);
        };
        req.onerror = (e) => {
          console.error('IndexedDB open error:', e);
          reject(e);
        };
      });
    }

    async saveProject(project) {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        try {
          const tx = this.db.transaction('projects', 'readwrite');
          const store = tx.objectStore('projects');
          const cloned = JSON.parse(JSON.stringify(project));
          cloned.updatedAt = Date.now();
          const req = store.put(cloned);
          req.onsuccess = () => resolve(true);
          req.onerror = (err) => reject(err);
        } catch (err) {
          reject(err);
        }
      });
    }

    async getProject(id) {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        try {
          const tx = this.db.transaction('projects', 'readonly');
          const store = tx.objectStore('projects');
          const req = store.get(id);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = (err) => reject(err);
        } catch (err) {
          reject(err);
        }
      });
    }

    async getAllProjects() {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        try {
          const tx = this.db.transaction('projects', 'readonly');
          const store = tx.objectStore('projects');
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = (err) => reject(err);
        } catch (err) {
          reject(err);
        }
      });
    }

    async deleteProject(id) {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        try {
          const tx = this.db.transaction('projects', 'readwrite');
          const store = tx.objectStore('projects');
          const req = store.delete(id);
          req.onsuccess = () => resolve(true);
          req.onerror = (err) => reject(err);
        } catch (err) {
          reject(err);
        }
      });
    }

    async saveMediaAsset(asset) {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        try {
          const tx = this.db.transaction('media_assets', 'readwrite');
          const store = tx.objectStore('media_assets');
          const req = store.put(asset);
          req.onsuccess = () => resolve(asset.id);
          req.onerror = (err) => reject(err);
        } catch (err) {
          reject(err);
        }
      });
    }

    async getMediaAsset(id) {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        try {
          const tx = this.db.transaction('media_assets', 'readonly');
          const store = tx.objectStore('media_assets');
          const req = store.get(id);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = (err) => reject(err);
        } catch (err) {
          reject(err);
        }
      });
    }

    async getAllMediaAssets() {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        try {
          const tx = this.db.transaction('media_assets', 'readonly');
          const store = tx.objectStore('media_assets');
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = (err) => reject(err);
        } catch (err) {
          reject(err);
        }
      });
    }
  }

  // =========================================================================
  // 3. SAMPLE PRESENTATION SEED
  // =========================================================================
  function createSampleProject() {
    return {
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      title: 'Welcome to SlideCraft Studio',
      theme: 'modern-dark',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      slides: [
        // Slide 1: Hero Title Slide
        {
          id: 's_1',
          title: 'Title Slide',
          background: {
            type: 'gradient-linear',
            color1: '#0f172a',
            color2: '#1e1b4b',
            angle: 135
          },
          notes: 'Welcome everyone! Today we introduce SlideCraft Studio: an elite browser-based presentation editor engineered purely in HTML, CSS, and Vanilla JavaScript.',
          transition: { type: 'fade', duration: 0.6 },
          elements: [
            {
              id: 'el_title_deco',
              type: 'shape',
              shapeType: 'rounded-rect',
              x: 810,
              y: 200,
              width: 300,
              height: 48,
              rotation: 0,
              opacity: 1,
              zIndex: 1,
              fill: 'rgba(99, 102, 241, 0.15)',
              stroke: '#6366f1',
              strokeWidth: 2,
              cornerRadius: 24,
              animation: { type: 'fade-in', trigger: 'with-previous', duration: 0.5, delay: 0 }
            },
            {
              id: 'el_badge_text',
              type: 'text',
              x: 810,
              y: 200,
              width: 300,
              height: 48,
              rotation: 0,
              opacity: 1,
              zIndex: 2,
              content: 'LOCAL-FIRST SUITE',
              fontFamily: 'Inter, sans-serif',
              fontSize: 16,
              fontWeight: '700',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'center',
              color: '#818cf8',
              backgroundColor: 'transparent',
              lineHeight: 1.2,
              animation: { type: 'fade-in', trigger: 'with-previous', duration: 0.5, delay: 0 }
            },
            {
              id: 'el_title_hero',
              type: 'text',
              x: 260,
              y: 310,
              width: 1400,
              height: 180,
              rotation: 0,
              opacity: 1,
              zIndex: 3,
              content: 'SlideCraft Studio',
              fontFamily: "'Playfair Display', serif",
              fontSize: 108,
              fontWeight: '700',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'center',
              color: '#ffffff',
              backgroundColor: 'transparent',
              lineHeight: 1.1,
              animation: { type: 'rise', trigger: 'with-previous', duration: 0.7, delay: 0.1 }
            },
            {
              id: 'el_sub_hero',
              type: 'text',
              x: 360,
              y: 520,
              width: 1200,
              height: 100,
              rotation: 0,
              opacity: 0.9,
              zIndex: 4,
              content: 'The Professional, Independent Presentation Editor Running Entirely in the Browser',
              fontFamily: 'Inter, sans-serif',
              fontSize: 32,
              fontWeight: '400',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'center',
              color: '#cbd5e1',
              backgroundColor: 'transparent',
              lineHeight: 1.4,
              animation: { type: 'rise', trigger: 'with-previous', duration: 0.7, delay: 0.2 }
            },
            {
              id: 'el_author_pill',
              type: 'shape',
              shapeType: 'rounded-rect',
              x: 660,
              y: 720,
              width: 600,
              height: 64,
              rotation: 0,
              opacity: 0.95,
              zIndex: 5,
              fill: 'rgba(30, 41, 59, 0.75)',
              stroke: '#334155',
              strokeWidth: 1,
              cornerRadius: 12,
              animation: { type: 'fade-in', trigger: 'with-previous', duration: 0.6, delay: 0.3 }
            },
            {
              id: 'el_author_text',
              type: 'text',
              x: 660,
              y: 720,
              width: 600,
              height: 64,
              rotation: 0,
              opacity: 1,
              zIndex: 6,
              content: 'Press F5 or Click "Present" in Top Right to Start Slideshow',
              fontFamily: 'Inter, sans-serif',
              fontSize: 20,
              fontWeight: '500',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'center',
              color: '#94a3b8',
              backgroundColor: 'transparent',
              lineHeight: 1.4,
              animation: { type: 'fade-in', trigger: 'with-previous', duration: 0.6, delay: 0.3 }
            }
          ]
        },

        // Slide 2: Two Columns / Key Capabilities
        {
          id: 's_2',
          title: 'Capabilities & Architecture',
          background: {
            type: 'solid',
            color1: '#0f172a'
          },
          notes: 'Highlighting our zero-backend architecture. Everything persists safely in IndexedDB, and presentation mode features full keyboard navigation.',
          transition: { type: 'slide-left', duration: 0.5 },
          elements: [
            {
              id: 'el_s2_header',
              type: 'text',
              x: 160,
              y: 120,
              width: 1600,
              height: 80,
              rotation: 0,
              opacity: 1,
              zIndex: 1,
              content: 'Engineered for Performance & Autonomy',
              fontFamily: "'Playfair Display', serif",
              fontSize: 64,
              fontWeight: '700',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'left',
              color: '#ffffff',
              backgroundColor: 'transparent',
              lineHeight: 1.2
            },
            {
              id: 'el_s2_line',
              type: 'shape',
              shapeType: 'line',
              x: 160,
              y: 220,
              width: 1600,
              height: 4,
              rotation: 0,
              opacity: 0.8,
              zIndex: 2,
              fill: '#4f46e5',
              stroke: '#6366f1',
              strokeWidth: 4,
              cornerRadius: 2
            },
            // Left Card
            {
              id: 'el_s2_card1',
              type: 'shape',
              shapeType: 'rounded-rect',
              x: 160,
              y: 280,
              width: 760,
              height: 640,
              rotation: 0,
              opacity: 1,
              zIndex: 3,
              fill: 'rgba(30, 41, 59, 0.6)',
              stroke: '#334155',
              strokeWidth: 2,
              cornerRadius: 16,
              animation: { type: 'slide-in-left', trigger: 'on-click', duration: 0.6, delay: 0 }
            },
            {
              id: 'el_s2_card1_text',
              type: 'text',
              x: 200,
              y: 330,
              width: 680,
              height: 540,
              rotation: 0,
              opacity: 1,
              zIndex: 4,
              content: '📦 100% Client-Side Engine\n\n• Zero Backend Requirement: Runs completely offline\n• IndexedDB Database: Instant persistent autosave\n• Full Vector Canvas: 1920 × 1080 logical resolution\n• Smart Alignment Guides: Precision object snapping\n• Direct WYSIWYG Editing: In-place text formatting\n• 40-Step History Stack: Complete Undo & Redo',
              fontFamily: 'Inter, sans-serif',
              fontSize: 26,
              fontWeight: '400',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'left',
              color: '#e2e8f0',
              backgroundColor: 'transparent',
              lineHeight: 1.7,
              animation: { type: 'slide-in-left', trigger: 'on-click', duration: 0.6, delay: 0 }
            },
            // Right Card
            {
              id: 'el_s2_card2',
              type: 'shape',
              shapeType: 'rounded-rect',
              x: 1000,
              y: 280,
              width: 760,
              height: 640,
              rotation: 0,
              opacity: 1,
              zIndex: 5,
              fill: 'rgba(30, 41, 59, 0.6)',
              stroke: '#334155',
              strokeWidth: 2,
              cornerRadius: 16,
              animation: { type: 'slide-in-right', trigger: 'on-click', duration: 0.6, delay: 0 }
            },
            {
              id: 'el_s2_card2_text',
              type: 'text',
              x: 1040,
              y: 330,
              width: 680,
              height: 540,
              rotation: 0,
              opacity: 1,
              zIndex: 6,
              content: '🎬 Fullscreen & Media Rich\n\n• Slideshow Mode: Keyboard driven (Arrows, Space, B)\n• Step-Through Animations: Sequenced slide objects\n• Media Folder Integration: Native File System Access\n• Multimedia Support: PNG, JPEG, SVG, MP4, MP3\n• PDF Printing: Clean 16:9 landscape export\n• Portable Packages: Export JSON decks with media',
              fontFamily: 'Inter, sans-serif',
              fontSize: 26,
              fontWeight: '400',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'left',
              color: '#e2e8f0',
              backgroundColor: 'transparent',
              lineHeight: 1.7,
              animation: { type: 'slide-in-right', trigger: 'on-click', duration: 0.6, delay: 0 }
            }
          ]
        },

        // Slide 3: Shapes & Design Elements
        {
          id: 's_3',
          title: 'Shapes & Visual Components',
          background: {
            type: 'gradient-linear',
            color1: '#090d16',
            color2: '#1e293b',
            angle: 160
          },
          notes: 'Demonstrating dynamic SVG shapes with custom fills, borders, opacity, and rotation transforms.',
          transition: { type: 'zoom', duration: 0.6 },
          elements: [
            {
              id: 'el_s3_title',
              type: 'text',
              x: 160,
              y: 100,
              width: 1600,
              height: 70,
              rotation: 0,
              opacity: 1,
              zIndex: 1,
              content: 'Rich Geometric Shapes & Vectors',
              fontFamily: "'Playfair Display', serif",
              fontSize: 60,
              fontWeight: '700',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'left',
              color: '#ffffff',
              backgroundColor: 'transparent',
              lineHeight: 1.2
            },
            {
              id: 'el_s3_sub',
              type: 'text',
              x: 160,
              y: 180,
              width: 1600,
              height: 40,
              rotation: 0,
              opacity: 0.8,
              zIndex: 2,
              content: 'Easily insert, rotate, style, and reorder custom shapes from the top ribbon palette.',
              fontFamily: 'Inter, sans-serif',
              fontSize: 24,
              fontWeight: '400',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'left',
              color: '#94a3b8',
              backgroundColor: 'transparent',
              lineHeight: 1.3
            },
            // Rect
            {
              id: 'el_s3_sh1',
              type: 'shape',
              shapeType: 'rounded-rect',
              x: 180,
              y: 300,
              width: 320,
              height: 320,
              rotation: 0,
              opacity: 1,
              zIndex: 3,
              fill: '#4f46e5',
              stroke: '#818cf8',
              strokeWidth: 4,
              cornerRadius: 24,
              animation: { type: 'zoom-in', trigger: 'on-click', duration: 0.6, delay: 0 }
            },
            {
              id: 'el_s3_sh1_lbl',
              type: 'text',
              x: 180,
              y: 430,
              width: 320,
              height: 60,
              rotation: 0,
              opacity: 1,
              zIndex: 4,
              content: 'Rounded Box',
              fontFamily: 'Inter, sans-serif',
              fontSize: 26,
              fontWeight: '600',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'center',
              color: '#ffffff',
              backgroundColor: 'transparent',
              lineHeight: 1.2,
              animation: { type: 'zoom-in', trigger: 'on-click', duration: 0.6, delay: 0 }
            },
            // Circle
            {
              id: 'el_s3_sh2',
              type: 'shape',
              shapeType: 'circle',
              x: 580,
              y: 300,
              width: 320,
              height: 320,
              rotation: 0,
              opacity: 1,
              zIndex: 5,
              fill: '#059669',
              stroke: '#34d399',
              strokeWidth: 4,
              cornerRadius: 0,
              animation: { type: 'zoom-in', trigger: 'on-click', duration: 0.6, delay: 0 }
            },
            {
              id: 'el_s3_sh2_lbl',
              type: 'text',
              x: 580,
              y: 430,
              width: 320,
              height: 60,
              rotation: 0,
              opacity: 1,
              zIndex: 6,
              content: 'Circle',
              fontFamily: 'Inter, sans-serif',
              fontSize: 26,
              fontWeight: '600',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'center',
              color: '#ffffff',
              backgroundColor: 'transparent',
              lineHeight: 1.2,
              animation: { type: 'zoom-in', trigger: 'on-click', duration: 0.6, delay: 0 }
            },
            // Triangle
            {
              id: 'el_s3_sh3',
              type: 'shape',
              shapeType: 'triangle',
              x: 980,
              y: 300,
              width: 320,
              height: 320,
              rotation: 0,
              opacity: 1,
              zIndex: 7,
              fill: '#d97706',
              stroke: '#fbbf24',
              strokeWidth: 4,
              cornerRadius: 0,
              animation: { type: 'zoom-in', trigger: 'on-click', duration: 0.6, delay: 0 }
            },
            {
              id: 'el_s3_sh3_lbl',
              type: 'text',
              x: 980,
              y: 450,
              width: 320,
              height: 60,
              rotation: 0,
              opacity: 1,
              zIndex: 8,
              content: 'Triangle',
              fontFamily: 'Inter, sans-serif',
              fontSize: 26,
              fontWeight: '600',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'center',
              color: '#ffffff',
              backgroundColor: 'transparent',
              lineHeight: 1.2,
              animation: { type: 'zoom-in', trigger: 'on-click', duration: 0.6, delay: 0 }
            },
            // Arrow
            {
              id: 'el_s3_sh4',
              type: 'shape',
              shapeType: 'arrow',
              x: 1380,
              y: 350,
              width: 360,
              height: 220,
              rotation: 0,
              opacity: 1,
              zIndex: 9,
              fill: '#e11d48',
              stroke: '#fb7185',
              strokeWidth: 4,
              cornerRadius: 0,
              animation: { type: 'zoom-in', trigger: 'on-click', duration: 0.6, delay: 0 }
            },
            {
              id: 'el_s3_callout',
              type: 'shape',
              shapeType: 'callout',
              x: 480,
              y: 720,
              width: 960,
              height: 200,
              rotation: 0,
              opacity: 0.95,
              zIndex: 10,
              fill: 'rgba(30, 41, 59, 0.9)',
              stroke: '#6366f1',
              strokeWidth: 2,
              cornerRadius: 16
            },
            {
              id: 'el_s3_callout_txt',
              type: 'text',
              x: 520,
              y: 760,
              width: 880,
              height: 100,
              rotation: 0,
              opacity: 1,
              zIndex: 11,
              content: '💡 Tip: Select any shape on the canvas to customize its fill, stroke color, border width, and corner radius in the Properties inspector!',
              fontFamily: 'Inter, sans-serif',
              fontSize: 22,
              fontWeight: '500',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'center',
              color: '#f8fafc',
              backgroundColor: 'transparent',
              lineHeight: 1.4
            }
          ]
        },

        // Slide 4: Media & Folder Integration
        {
          id: 's_4',
          title: 'Local Media Integration',
          background: {
            type: 'solid',
            color1: '#0f172a'
          },
          notes: 'Explaining our browser security compliance. The app connects directly to the local media folder via the File System Access API without any server.',
          transition: { type: 'slide-up', duration: 0.5 },
          elements: [
            {
              id: 'el_s4_title',
              type: 'text',
              x: 160,
              y: 120,
              width: 1600,
              height: 70,
              rotation: 0,
              opacity: 1,
              zIndex: 1,
              content: 'Seamless Local Media Folder Access',
              fontFamily: "'Playfair Display', serif",
              fontSize: 60,
              fontWeight: '700',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'left',
              color: '#ffffff',
              backgroundColor: 'transparent',
              lineHeight: 1.2
            },
            {
              id: 'el_s4_card1',
              type: 'shape',
              shapeType: 'rounded-rect',
              x: 160,
              y: 260,
              width: 500,
              height: 580,
              rotation: 0,
              opacity: 1,
              zIndex: 2,
              fill: 'rgba(30, 41, 59, 0.5)',
              stroke: '#3b82f6',
              strokeWidth: 2,
              cornerRadius: 16
            },
            {
              id: 'el_s4_card1_txt',
              type: 'text',
              x: 190,
              y: 300,
              width: 440,
              height: 500,
              rotation: 0,
              opacity: 1,
              zIndex: 3,
              content: '📁 File System Access API\n\nDirectly connects to your project\'s "media/" directory.\n\n• Native browser directory handle\n• Inspects local videos, images, and audio\n• Generates instant previews\n• Keeps persistent file references in IndexedDB\n• Zero server uploads required',
              fontFamily: 'Inter, sans-serif',
              fontSize: 22,
              fontWeight: '400',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'left',
              color: '#e2e8f0',
              backgroundColor: 'transparent',
              lineHeight: 1.6
            },
            {
              id: 'el_s4_card2',
              type: 'shape',
              shapeType: 'rounded-rect',
              x: 710,
              y: 260,
              width: 500,
              height: 580,
              rotation: 0,
              opacity: 1,
              zIndex: 4,
              fill: 'rgba(30, 41, 59, 0.5)',
              stroke: '#10b981',
              strokeWidth: 2,
              cornerRadius: 16
            },
            {
              id: 'el_s4_card2_txt',
              type: 'text',
              x: 740,
              y: 300,
              width: 440,
              height: 500,
              rotation: 0,
              opacity: 1,
              zIndex: 5,
              content: '📂 Standard Upload Fallback\n\nFull compatibility across all modern web browsers.\n\n• Directory picker (webkitdirectory)\n• Multiple file input dialog\n• Drag-and-drop support\n• Stores media Blobs in browser DB\n• Works seamlessly on Safari, Firefox & Mobile',
              fontFamily: 'Inter, sans-serif',
              fontSize: 22,
              fontWeight: '400',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'left',
              color: '#e2e8f0',
              backgroundColor: 'transparent',
              lineHeight: 1.6
            },
            {
              id: 'el_s4_card3',
              type: 'shape',
              shapeType: 'rounded-rect',
              x: 1260,
              y: 260,
              width: 500,
              height: 580,
              rotation: 0,
              opacity: 1,
              zIndex: 6,
              fill: 'rgba(30, 41, 59, 0.5)',
              stroke: '#f59e0b',
              strokeWidth: 2,
              cornerRadius: 16
            },
            {
              id: 'el_s4_card3_txt',
              type: 'text',
              x: 1290,
              y: 300,
              width: 440,
              height: 500,
              rotation: 0,
              opacity: 1,
              zIndex: 7,
              content: '📦 Portable Bundling\n\nShare and export decks without missing assets.\n\n• Export project JSON\n• Export complete bundle with media embedded\n• Print directly to PDF via standard browser print\n• Perfect for client presentations and backups',
              fontFamily: 'Inter, sans-serif',
              fontSize: 22,
              fontWeight: '400',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'left',
              color: '#e2e8f0',
              backgroundColor: 'transparent',
              lineHeight: 1.6
            }
          ]
        },

        // Slide 5: Section Divider / Call To Action
        {
          id: 's_5',
          title: 'Start Creating',
          background: {
            type: 'gradient-linear',
            color1: '#1e1b4b',
            color2: '#0f172a',
            angle: 135
          },
          notes: 'Concluding remarks. Invite users to add new slides, experiment with text and shapes, and build their decks.',
          transition: { type: 'fade', duration: 0.6 },
          elements: [
            {
              id: 'el_s5_rule',
              type: 'shape',
              shapeType: 'line',
              x: 860,
              y: 360,
              width: 200,
              height: 6,
              rotation: 0,
              opacity: 1,
              zIndex: 1,
              fill: '#6366f1',
              stroke: '#818cf8',
              strokeWidth: 6,
              cornerRadius: 3
            },
            {
              id: 'el_s5_title',
              type: 'text',
              x: 260,
              y: 420,
              width: 1400,
              height: 120,
              rotation: 0,
              opacity: 1,
              zIndex: 2,
              content: 'Your Canvas Awaits',
              fontFamily: "'Playfair Display', serif",
              fontSize: 90,
              fontWeight: '700',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'center',
              color: '#ffffff',
              backgroundColor: 'transparent',
              lineHeight: 1.1
            },
            {
              id: 'el_s5_subtitle',
              type: 'text',
              x: 360,
              y: 570,
              width: 1200,
              height: 80,
              rotation: 0,
              opacity: 0.85,
              zIndex: 3,
              content: 'Add new slides, insert shapes, import multimedia, and craft your presentation.',
              fontFamily: 'Inter, sans-serif',
              fontSize: 28,
              fontWeight: '400',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'center',
              color: '#cbd5e1',
              backgroundColor: 'transparent',
              lineHeight: 1.4
            }
          ]
        }
      ]
    };
  }

  // =========================================================================
  // 4. MAIN SLIDECRAFT APP CONTROLLER
  // =========================================================================
  class SlideCraftApp {
    constructor() {
      this.storage = new StorageManager();
      this.project = null;
      this.currentSlideIndex = 0;
      this.selectedElementIds = [];
      this.zoom = 1;
      this.autoFitZoom = true;
      this.snapToGrid = true;
      this.gridSize = 20;

      // Interaction State
      this.dragState = null;
      this.resizeState = null;
      this.rotateState = null;
      this.marqueeState = null;
      this.isEditingText = false;
      this.editingElementId = null;

      // History for Undo/Redo
      this.historyStack = [];
      this.historyIndex = -1;

      // Slideshow State
      this.isPresentationActive = false;
      this.presentationSlideIndex = 0;
      this.presentationStep = 0;
      this.presentationLaserActive = false;

      // Media Handles Cache
      this.directoryHandle = null;
      this.mediaAssetsCache = [];

      // Autosave debouncer
      this.autosaveTimeout = null;
    }

    async init() {
      await this.storage.init();

      // Check existing projects or seed default
      const allProjects = await this.storage.getAllProjects();
      if (allProjects.length > 0) {
        // Load most recently updated
        allProjects.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        this.project = allProjects[0];
      } else {
        this.project = createSampleProject();
        await this.storage.saveProject(this.project);
      }

      this.cacheInitialHistory();
      this.bindUI();
      this.setupCanvasResizeObserver();
      this.renderAll();
      this.showToast('SlideCraft Studio initialized with local persistence', 'info');
    }

    // -----------------------------------------------------------------------
    // HISTORY & UNDO/REDO
    // -----------------------------------------------------------------------
    cacheInitialHistory() {
      this.historyStack = [JSON.stringify(this.project)];
      this.historyIndex = 0;
      this.updateHistoryButtons();
    }

    pushHistory(actionDescription = 'Edit') {
      const snap = JSON.stringify(this.project);
      if (this.historyStack[this.historyIndex] === snap) return;

      // Truncate redo tree if we made a new change
      this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
      this.historyStack.push(snap);

      if (this.historyStack.length > MAX_HISTORY_STEPS) {
        this.historyStack.shift();
      } else {
        this.historyIndex++;
      }

      this.updateHistoryButtons();
      this.triggerAutosave();
    }

    undo() {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.project = JSON.parse(this.historyStack[this.historyIndex]);
        if (this.currentSlideIndex >= this.project.slides.length) {
          this.currentSlideIndex = Math.max(0, this.project.slides.length - 1);
        }
        this.selectedElementIds = [];
        this.renderAll();
        this.updateHistoryButtons();
        this.triggerAutosave();
        this.showToast('Undo', 'info');
      }
    }

    redo() {
      if (this.historyIndex < this.historyStack.length - 1) {
        this.historyIndex++;
        this.project = JSON.parse(this.historyStack[this.historyIndex]);
        if (this.currentSlideIndex >= this.project.slides.length) {
          this.currentSlideIndex = Math.max(0, this.project.slides.length - 1);
        }
        this.selectedElementIds = [];
        this.renderAll();
        this.updateHistoryButtons();
        this.triggerAutosave();
        this.showToast('Redo', 'info');
      }
    }

    updateHistoryButtons() {
      const btnUndo = document.getElementById('ribbonUndo');
      const btnRedo = document.getElementById('ribbonRedo');
      if (btnUndo) btnUndo.disabled = this.historyIndex <= 0;
      if (btnRedo) btnRedo.disabled = this.historyIndex >= this.historyStack.length - 1;
    }

    // -----------------------------------------------------------------------
    // AUTOSAVE & PERSISTENCE
    // -----------------------------------------------------------------------
    triggerAutosave() {
      this.setSaveStatus('unsaved', 'Unsaved changes');
      clearTimeout(this.autosaveTimeout);
      this.autosaveTimeout = setTimeout(async () => {
        try {
          await this.storage.saveProject(this.project);
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          this.setSaveStatus('saved', `Autosaved ${time}`);
        } catch (e) {
          console.error('Autosave error:', e);
          this.setSaveStatus('unsaved', 'Autosave failed');
        }
      }, 1200);
    }

    setSaveStatus(status, text) {
      const dot = document.querySelector('.save-indicator .status-dot');
      const label = document.getElementById('saveStatusText');
      if (dot) {
        dot.className = 'status-dot ' + (status === 'saved' ? 'saved' : 'unsaved');
      }
      if (label) label.textContent = text;
    }

    // -----------------------------------------------------------------------
    // SLIDE MANAGEMENT
    // -----------------------------------------------------------------------
    getCurrentSlide() {
      if (!this.project || !this.project.slides || this.project.slides.length === 0) {
        return null;
      }
      return this.project.slides[this.currentSlideIndex] || this.project.slides[0];
    }

    addSlideWithPreset(layoutType = 'title-content') {
      const newSlide = this.createPresetSlide(layoutType);
      this.project.slides.splice(this.currentSlideIndex + 1, 0, newSlide);
      this.currentSlideIndex++;
      this.selectedElementIds = [];
      this.pushHistory(`Add ${layoutType} slide`);
      this.renderAll();
      this.showToast(`Added ${newSlide.title}`, 'success');
    }

    createPresetSlide(type) {
      const id = 's_' + Math.random().toString(36).substring(2, 9);
      const base = {
        id,
        title: 'New Slide',
        background: { type: 'solid', color1: '#0f172a' },
        notes: '',
        transition: { type: 'fade', duration: 0.5 },
        elements: []
      };

      if (type === 'title') {
        base.title = 'Title Slide';
        base.elements = [
          {
            id: 'el_' + Math.random().toString(36).substring(2, 8),
            type: 'text',
            x: 260,
            y: 360,
            width: 1400,
            height: 140,
            rotation: 0,
            opacity: 1,
            zIndex: 1,
            content: 'Double Click to Edit Title',
            fontFamily: "'Playfair Display', serif",
            fontSize: 90,
            fontWeight: '700',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'center',
            color: '#ffffff',
            backgroundColor: 'transparent',
            lineHeight: 1.2
          },
          {
            id: 'el_' + Math.random().toString(36).substring(2, 8),
            type: 'text',
            x: 360,
            y: 540,
            width: 1200,
            height: 80,
            rotation: 0,
            opacity: 0.85,
            zIndex: 2,
            content: 'Add your subtitle or presentation description here',
            fontFamily: 'Inter, sans-serif',
            fontSize: 32,
            fontWeight: '400',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'center',
            color: '#94a3b8',
            backgroundColor: 'transparent',
            lineHeight: 1.4
          }
        ];
      } else if (type === 'title-content') {
        base.title = 'Title & Content';
        base.elements = [
          {
            id: 'el_' + Math.random().toString(36).substring(2, 8),
            type: 'text',
            x: 160,
            y: 120,
            width: 1600,
            height: 90,
            rotation: 0,
            opacity: 1,
            zIndex: 1,
            content: 'Slide Topic Headline',
            fontFamily: "'Playfair Display', serif",
            fontSize: 64,
            fontWeight: '700',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'left',
            color: '#ffffff',
            backgroundColor: 'transparent',
            lineHeight: 1.2
          },
          {
            id: 'el_' + Math.random().toString(36).substring(2, 8),
            type: 'text',
            x: 160,
            y: 260,
            width: 1600,
            height: 600,
            rotation: 0,
            opacity: 1,
            zIndex: 2,
            content: '• First key takeaway or primary argument\n• Second supportive evidence or metric data\n• Third strategic observation and next steps\n• Double click this box anytime to customize your text',
            fontFamily: 'Inter, sans-serif',
            fontSize: 32,
            fontWeight: '400',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'left',
            color: '#cbd5e1',
            backgroundColor: 'transparent',
            lineHeight: 1.8
          }
        ];
      } else if (type === 'two-columns') {
        base.title = 'Two Columns';
        base.elements = [
          {
            id: 'el_' + Math.random().toString(36).substring(2, 8),
            type: 'text',
            x: 160,
            y: 120,
            width: 1600,
            height: 80,
            rotation: 0,
            opacity: 1,
            zIndex: 1,
            content: 'Comparison & Dual Perspectives',
            fontFamily: "'Playfair Display', serif",
            fontSize: 60,
            fontWeight: '700',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'left',
            color: '#ffffff',
            backgroundColor: 'transparent',
            lineHeight: 1.2
          },
          {
            id: 'el_' + Math.random().toString(36).substring(2, 8),
            type: 'shape',
            shapeType: 'rounded-rect',
            x: 160,
            y: 250,
            width: 760,
            height: 680,
            rotation: 0,
            opacity: 1,
            zIndex: 2,
            fill: 'rgba(30, 41, 59, 0.5)',
            stroke: '#334155',
            strokeWidth: 2,
            cornerRadius: 16
          },
          {
            id: 'el_' + Math.random().toString(36).substring(2, 8),
            type: 'text',
            x: 200,
            y: 290,
            width: 680,
            height: 600,
            rotation: 0,
            opacity: 1,
            zIndex: 3,
            content: 'Column A: Objectives\n\n• Point 1: Core purpose\n• Point 2: Audience target\n• Point 3: Expected outcome',
            fontFamily: 'Inter, sans-serif',
            fontSize: 28,
            fontWeight: '400',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'left',
            color: '#e2e8f0',
            backgroundColor: 'transparent',
            lineHeight: 1.7
          },
          {
            id: 'el_' + Math.random().toString(36).substring(2, 8),
            type: 'shape',
            shapeType: 'rounded-rect',
            x: 1000,
            y: 250,
            width: 760,
            height: 680,
            rotation: 0,
            opacity: 1,
            zIndex: 4,
            fill: 'rgba(30, 41, 59, 0.5)',
            stroke: '#334155',
            strokeWidth: 2,
            cornerRadius: 16
          },
          {
            id: 'el_' + Math.random().toString(36).substring(2, 8),
            type: 'text',
            x: 1040,
            y: 290,
            width: 680,
            height: 600,
            rotation: 0,
            opacity: 1,
            zIndex: 5,
            content: 'Column B: Key Results\n\n• Metric 1: 85% completion\n• Metric 2: 2.4x speed increase\n• Metric 3: Client satisfaction',
            fontFamily: 'Inter, sans-serif',
            fontSize: 28,
            fontWeight: '400',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'left',
            color: '#e2e8f0',
            backgroundColor: 'transparent',
            lineHeight: 1.7
          }
        ];
      } else if (type === 'image-focused') {
        base.title = 'Image Focused';
        base.elements = [
          {
            id: 'el_' + Math.random().toString(36).substring(2, 8),
            type: 'text',
            x: 160,
            y: 100,
            width: 1600,
            height: 70,
            rotation: 0,
            opacity: 1,
            zIndex: 1,
            content: 'Visual Showcase',
            fontFamily: "'Playfair Display', serif",
            fontSize: 56,
            fontWeight: '700',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'left',
            color: '#ffffff',
            backgroundColor: 'transparent',
            lineHeight: 1.2
          },
          {
            id: 'el_' + Math.random().toString(36).substring(2, 8),
            type: 'shape',
            shapeType: 'rounded-rect',
            x: 160,
            y: 200,
            width: 1600,
            height: 700,
            rotation: 0,
            opacity: 1,
            zIndex: 2,
            fill: 'rgba(15, 23, 42, 0.8)',
            stroke: '#475569',
            strokeWidth: 2,
            cornerRadius: 12
          },
          {
            id: 'el_' + Math.random().toString(36).substring(2, 8),
            type: 'text',
            x: 460,
            y: 500,
            width: 1000,
            height: 100,
            rotation: 0,
            opacity: 0.8,
            zIndex: 3,
            content: '🖼️ Click "Image" in ribbon above or drop an image file here',
            fontFamily: 'Inter, sans-serif',
            fontSize: 28,
            fontWeight: '500',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'center',
            color: '#94a3b8',
            backgroundColor: 'transparent',
            lineHeight: 1.4
          }
        ];
      } else if (type === 'section-divider') {
        base.title = 'Section Divider';
        base.background = {
          type: 'gradient-linear',
          color1: '#1e1b4b',
          color2: '#0f172a',
          angle: 135
        };
        base.elements = [
          {
            id: 'el_' + Math.random().toString(36).substring(2, 8),
            type: 'shape',
            shapeType: 'line',
            x: 860,
            y: 400,
            width: 200,
            height: 6,
            rotation: 0,
            opacity: 1,
            zIndex: 1,
            fill: '#6366f1',
            stroke: '#818cf8',
            strokeWidth: 6,
            cornerRadius: 3
          },
          {
            id: 'el_' + Math.random().toString(36).substring(2, 8),
            type: 'text',
            x: 260,
            y: 460,
            width: 1400,
            height: 120,
            rotation: 0,
            opacity: 1,
            zIndex: 2,
            content: 'Part II: Next Chapter',
            fontFamily: "'Playfair Display', serif",
            fontSize: 84,
            fontWeight: '700',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'center',
            color: '#ffffff',
            backgroundColor: 'transparent',
            lineHeight: 1.2
          }
        ];
      } else {
        base.title = 'Blank Slide';
      }

      return base;
    }

    duplicateCurrentSlide() {
      const current = this.getCurrentSlide();
      if (!current) return;

      const cloned = JSON.parse(JSON.stringify(current));
      cloned.id = 's_' + Math.random().toString(36).substring(2, 9);
      cloned.title = (cloned.title || 'Slide') + ' (Copy)';

      // Re-assign new unique IDs to all elements
      cloned.elements = (cloned.elements || []).map((el) => {
        el.id = 'el_' + Math.random().toString(36).substring(2, 8);
        return el;
      });

      this.project.slides.splice(this.currentSlideIndex + 1, 0, cloned);
      this.currentSlideIndex++;
      this.selectedElementIds = [];
      this.pushHistory('Duplicate slide');
      this.renderAll();
      this.showToast('Slide duplicated', 'success');
    }

    deleteCurrentSlide() {
      if (this.project.slides.length <= 1) {
        this.showToast('Cannot delete the only slide in the deck.', 'error');
        return;
      }

      this.project.slides.splice(this.currentSlideIndex, 1);
      if (this.currentSlideIndex >= this.project.slides.length) {
        this.currentSlideIndex = this.project.slides.length - 1;
      }
      this.selectedElementIds = [];
      this.pushHistory('Delete slide');
      this.renderAll();
      this.showToast('Slide deleted', 'info');
    }

    moveSlide(delta) {
      const targetIndex = this.currentSlideIndex + delta;
      if (targetIndex < 0 || targetIndex >= this.project.slides.length) return;

      const slide = this.project.slides.splice(this.currentSlideIndex, 1)[0];
      this.project.slides.splice(targetIndex, 0, slide);
      this.currentSlideIndex = targetIndex;
      this.pushHistory('Move slide');
      this.renderAll();
    }

    // -----------------------------------------------------------------------
    // ELEMENT CREATION & MANIPULATION
    // -----------------------------------------------------------------------
    insertTextBox() {
      const slide = this.getCurrentSlide();
      if (!slide) return;

      const newId = 'el_' + Math.random().toString(36).substring(2, 8);
      const z = (slide.elements || []).length + 1;
      const el = {
        id: newId,
        type: 'text',
        x: 660,
        y: 440,
        width: 600,
        height: 120,
        rotation: 0,
        opacity: 1,
        zIndex: z,
        content: 'Type your text here...',
        fontFamily: 'Inter, sans-serif',
        fontSize: 36,
        fontWeight: '500',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'center',
        color: '#ffffff',
        backgroundColor: 'transparent',
        lineHeight: 1.3
      };

      slide.elements.push(el);
      this.selectedElementIds = [newId];
      this.pushHistory('Insert text box');
      this.renderCanvas();
      this.renderInspector();
      this.renderThumbnails();
      this.showToast('Text box inserted', 'success');
    }

    insertShape(shapeType) {
      const slide = this.getCurrentSlide();
      if (!slide) return;

      const newId = 'el_' + Math.random().toString(36).substring(2, 8);
      const z = (slide.elements || []).length + 1;
      let w = 300;
      let h = 200;

      if (shapeType === 'circle') {
        w = 260;
        h = 260;
      } else if (shapeType === 'line') {
        w = 400;
        h = 4;
      }

      const el = {
        id: newId,
        type: 'shape',
        shapeType: shapeType,
        x: (CANVAS_WIDTH - w) / 2,
        y: (CANVAS_HEIGHT - h) / 2,
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
        zIndex: z,
        fill: '#4f46e5',
        stroke: '#818cf8',
        strokeWidth: 2,
        cornerRadius: shapeType === 'rounded-rect' ? 16 : 0
      };

      slide.elements.push(el);
      this.selectedElementIds = [newId];
      this.pushHistory(`Insert ${shapeType}`);
      this.renderCanvas();
      this.renderInspector();
      this.renderThumbnails();
      this.showToast(`Inserted ${shapeType}`, 'success');
    }

    async insertMediaElement(file) {
      const slide = this.getCurrentSlide();
      if (!slide || !file) return;

      const assetId = 'asset_' + Math.random().toString(36).substring(2, 8);
      const objectUrl = URL.createObjectURL(file);

      // Save in IndexedDB
      await this.storage.saveMediaAsset({
        id: assetId,
        name: file.name,
        type: file.type,
        blob: file,
        size: file.size,
        createdAt: Date.now()
      });

      const z = (slide.elements || []).length + 1;
      const elId = 'el_' + Math.random().toString(36).substring(2, 8);
      let elType = 'image';
      let w = 800;
      let h = 500;

      if (file.type.startsWith('video/')) {
        elType = 'video';
      } else if (file.type.startsWith('audio/')) {
        elType = 'audio';
        w = 420;
        h = 100;
      }

      const el = {
        id: elId,
        type: elType,
        mediaAssetId: assetId,
        src: objectUrl,
        name: file.name,
        x: (CANVAS_WIDTH - w) / 2,
        y: (CANVAS_HEIGHT - h) / 2,
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
        zIndex: z,
        fit: 'contain',
        autoplay: false,
        loop: false,
        muted: false,
        volume: 1,
        isBackground: false
      };

      slide.elements.push(el);
      this.selectedElementIds = [elId];
      this.pushHistory(`Insert ${elType}`);
      this.renderCanvas();
      this.renderInspector();
      this.renderThumbnails();
      this.showToast(`Inserted ${file.name}`, 'success');
    }

    deleteSelectedElements() {
      const slide = this.getCurrentSlide();
      if (!slide || this.selectedElementIds.length === 0) return;

      slide.elements = (slide.elements || []).filter(
        (el) => !this.selectedElementIds.includes(el.id)
      );
      this.selectedElementIds = [];
      this.pushHistory('Delete elements');
      this.renderCanvas();
      this.renderInspector();
      this.renderThumbnails();
      this.showToast('Deleted', 'info');
    }

    duplicateSelectedElements() {
      const slide = this.getCurrentSlide();
      if (!slide || this.selectedElementIds.length === 0) return;

      const newSelection = [];
      slide.elements.forEach((el) => {
        if (this.selectedElementIds.includes(el.id)) {
          const cloned = JSON.parse(JSON.stringify(el));
          cloned.id = 'el_' + Math.random().toString(36).substring(2, 8);
          cloned.x += 30;
          cloned.y += 30;
          cloned.zIndex = slide.elements.length + 1;
          slide.elements.push(cloned);
          newSelection.push(cloned.id);
        }
      });

      this.selectedElementIds = newSelection;
      this.pushHistory('Duplicate elements');
      this.renderCanvas();
      this.renderInspector();
      this.renderThumbnails();
      this.showToast('Duplicated', 'success');
    }

    changeZOrder(direction) {
      const slide = this.getCurrentSlide();
      if (!slide || this.selectedElementIds.length === 0) return;

      const el = slide.elements.find((e) => e.id === this.selectedElementIds[0]);
      if (!el) return;

      const index = slide.elements.indexOf(el);
      if (direction === 'forward' && index < slide.elements.length - 1) {
        slide.elements.splice(index, 1);
        slide.elements.splice(index + 1, 0, el);
      } else if (direction === 'backward' && index > 0) {
        slide.elements.splice(index, 1);
        slide.elements.splice(index - 1, 0, el);
      } else if (direction === 'front') {
        slide.elements.splice(index, 1);
        slide.elements.push(el);
      } else if (direction === 'back') {
        slide.elements.splice(index, 1);
        slide.elements.unshift(el);
      }

      // Re-index zIndices
      slide.elements.forEach((item, idx) => (item.zIndex = idx + 1));
      this.pushHistory('Reorder layer');
      this.renderCanvas();
      this.renderInspector();
      this.renderThumbnails();
    }

    alignSelectedElements(type) {
      const slide = this.getCurrentSlide();
      if (!slide || this.selectedElementIds.length === 0) return;

      this.selectedElementIds.forEach((id) => {
        const el = slide.elements.find((e) => e.id === id);
        if (!el) return;

        if (type === 'left') el.x = 0;
        else if (type === 'center') el.x = (CANVAS_WIDTH - el.width) / 2;
        else if (type === 'right') el.x = CANVAS_WIDTH - el.width;
        else if (type === 'top') el.y = 0;
        else if (type === 'middle') el.y = (CANVAS_HEIGHT - el.height) / 2;
        else if (type === 'bottom') el.y = CANVAS_HEIGHT - el.height;
      });

      this.pushHistory('Align elements');
      this.renderCanvas();
      this.renderInspector();
      this.renderThumbnails();
    }

    // -----------------------------------------------------------------------
    // RENDERING: CANVAS, THUMBNAILS & INSPECTOR
    // -----------------------------------------------------------------------
    renderAll() {
      this.updateDeckTheme();
      this.renderHeaderTitle();
      this.renderThumbnails();
      this.renderCanvas();
      this.renderSpeakerNotes();
      this.renderInspector();
      this.updateStatusBar();
    }

    renderHeaderTitle() {
      const input = document.getElementById('projectTitleInput');
      if (input && this.project) {
        input.value = this.project.title || 'Untitled Presentation';
      }
    }

    updateDeckTheme() {
      const theme = (this.project && this.project.theme) || 'modern-dark';
      document.body.className = `app-body theme-${theme}`;
      const sel = document.getElementById('themeSelect');
      if (sel) sel.value = theme;
    }

    renderThumbnails() {
      const listEl = document.getElementById('slidesList');
      const countLabel = document.getElementById('slideCountLabel');
      if (!listEl || !this.project) return;

      countLabel.textContent = this.project.slides.length;
      listEl.innerHTML = '';

      this.project.slides.forEach((slide, idx) => {
        const isActive = idx === this.currentSlideIndex;
        const card = document.createElement('div');
        card.className = `slide-card ${isActive ? 'active' : ''}`;
        card.dataset.index = idx;

        const thumbBox = document.createElement('div');
        thumbBox.className = 'slide-thumbnail-box';

        // Render accurate CSS/DOM preview
        const inner = document.createElement('div');
        inner.className = 'thumb-preview-inner';
        this.applySlideBackground(inner, slide.background);

        // Thumbnail mini elements
        (slide.elements || []).forEach((el) => {
          const mini = document.createElement('div');
          mini.style.position = 'absolute';
          mini.style.left = `${el.x}px`;
          mini.style.top = `${el.y}px`;
          mini.style.width = `${el.width}px`;
          mini.style.height = `${el.height}px`;
          mini.style.transform = `rotate(${el.rotation || 0}deg)`;
          mini.style.opacity = el.opacity || 1;

          if (el.type === 'text') {
            mini.style.color = el.color || '#fff';
            mini.style.fontSize = `${el.fontSize}px`;
            mini.style.fontFamily = el.fontFamily;
            mini.style.fontWeight = el.fontWeight;
            mini.style.textAlign = el.textAlign;
            mini.style.lineHeight = el.lineHeight || 1.2;
            mini.textContent = el.content;
            mini.style.overflow = 'hidden';
          } else if (el.type === 'shape') {
            mini.innerHTML = this.generateShapeSvg(el);
          } else if (el.type === 'image') {
            mini.style.backgroundImage = `url(${el.src})`;
            mini.style.backgroundSize = el.fit || 'contain';
            mini.style.backgroundRepeat = 'no-repeat';
          } else if (el.type === 'video' || el.type === 'audio') {
            mini.style.background = '#1e293b';
            mini.style.border = '2px solid #3b82f6';
          }
          inner.appendChild(mini);
        });

        // Compute thumb scale factor: box width / 1920
        const scaleFactor = 0.11; // ~210px thumb box
        inner.style.transform = `scale(${scaleFactor})`;

        thumbBox.appendChild(inner);

        // Slide card action buttons
        const actions = document.createElement('div');
        actions.className = 'slide-card-actions';
        actions.innerHTML = `
          <button class="slide-action-btn" data-action="dup" title="Duplicate">📑</button>
          <button class="slide-action-btn" data-action="up" title="Move Up">▲</button>
          <button class="slide-action-btn" data-action="down" title="Move Down">▼</button>
          <button class="slide-action-btn" data-action="del" title="Delete">🗑️</button>
        `;
        thumbBox.appendChild(actions);

        card.innerHTML = `<span class="slide-card-index">${idx + 1}</span>`;
        card.appendChild(thumbBox);

        card.addEventListener('click', (e) => {
          const actBtn = e.target.closest('.slide-action-btn');
          if (actBtn) {
            e.stopPropagation();
            const act = actBtn.dataset.action;
            if (act === 'dup') {
              this.currentSlideIndex = idx;
              this.duplicateCurrentSlide();
            } else if (act === 'up') {
              this.currentSlideIndex = idx;
              this.moveSlide(-1);
            } else if (act === 'down') {
              this.currentSlideIndex = idx;
              this.moveSlide(1);
            } else if (act === 'del') {
              this.currentSlideIndex = idx;
              this.deleteCurrentSlide();
            }
            return;
          }
          this.currentSlideIndex = idx;
          this.selectedElementIds = [];
          this.renderAll();
        });

        listEl.appendChild(card);
      });
    }

    renderCanvas() {
      const slide = this.getCurrentSlide();
      const canvasEl = document.getElementById('slideCanvas');
      const bgLayer = document.getElementById('canvasBackgroundLayer');
      const elementsLayer = document.getElementById('canvasElementsLayer');

      if (!slide || !canvasEl || !bgLayer || !elementsLayer) return;

      // 1. Background Layer
      this.applySlideBackground(bgLayer, slide.background);

      // 2. Elements Layer
      elementsLayer.innerHTML = '';
      const elements = slide.elements || [];

      // Sort elements by zIndex
      const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

      sorted.forEach((el) => {
        const elDiv = document.createElement('div');
        elDiv.className = `slide-element ${el.locked ? 'locked' : ''} ${
          this.selectedElementIds.includes(el.id) ? 'selected-subtle' : ''
        }`;
        elDiv.id = `canvas_el_${el.id}`;
        elDiv.dataset.id = el.id;

        elDiv.style.left = `${el.x}px`;
        elDiv.style.top = `${el.y}px`;
        elDiv.style.width = `${el.width}px`;
        elDiv.style.height = `${el.height}px`;
        elDiv.style.transform = `rotate(${el.rotation || 0}deg)`;
        elDiv.style.opacity = el.opacity ?? 1;
        elDiv.style.zIndex = el.zIndex || 1;

        // Content Rendering
        if (el.type === 'text') {
          const textDiv = document.createElement('div');
          textDiv.className = `element-inner-text ${
            this.isEditingText && this.editingElementId === el.id ? 'editing' : ''
          }`;
          textDiv.style.fontFamily = el.fontFamily || 'Inter, sans-serif';
          textDiv.style.fontSize = `${el.fontSize || 32}px`;
          textDiv.style.fontWeight = el.fontWeight || '400';
          textDiv.style.fontStyle = el.fontStyle || 'normal';
          textDiv.style.textDecoration = el.textDecoration || 'none';
          textDiv.style.textAlign = el.textAlign || 'left';
          textDiv.style.color = el.color || '#ffffff';
          textDiv.style.backgroundColor = el.backgroundColor || 'transparent';
          textDiv.style.lineHeight = el.lineHeight || 1.3;
          textDiv.style.padding = '4px 8px';
          textDiv.textContent = el.content || '';

          if (this.isEditingText && this.editingElementId === el.id) {
            textDiv.contentEditable = 'true';
            textDiv.spellcheck = false;
          }

          elDiv.appendChild(textDiv);
        } else if (el.type === 'shape') {
          const shapeContainer = document.createElement('div');
          shapeContainer.className = 'element-inner-shape';
          shapeContainer.innerHTML = this.generateShapeSvg(el);
          elDiv.appendChild(shapeContainer);
        } else if (el.type === 'image') {
          const img = document.createElement('img');
          img.className = 'element-inner-media';
          img.src = el.src;
          img.style.objectFit = el.fit || 'contain';
          elDiv.appendChild(img);
        } else if (el.type === 'video') {
          const vid = document.createElement('video');
          vid.className = 'element-inner-media';
          vid.src = el.src;
          vid.controls = true;
          vid.loop = el.loop;
          vid.muted = el.muted;
          vid.style.objectFit = el.fit || 'contain';
          elDiv.appendChild(vid);
        } else if (el.type === 'audio') {
          const audBox = document.createElement('div');
          audBox.className = 'audio-element-container';
          audBox.innerHTML = `
            <div class="audio-element-icon">🎵</div>
            <div class="audio-element-title">${el.name || 'Audio Track'}</div>
            <audio controls src="${el.src}" style="width: 100%; height: 32px;"></audio>
          `;
          elDiv.appendChild(audBox);
        }

        elementsLayer.appendChild(elDiv);
      });

      // 3. Selection Box Gizmo
      this.updateSelectionGizmo();
    }

    applySlideBackground(targetEl, bg) {
      if (!bg) {
        targetEl.style.background = '#0f172a';
        return;
      }
      if (bg.type === 'solid') {
        targetEl.style.background = bg.color1 || '#0f172a';
      } else if (bg.type === 'gradient-linear') {
        targetEl.style.background = `linear-gradient(${bg.angle || 135}deg, ${
          bg.color1 || '#0f172a'
        }, ${bg.color2 || '#1e293b'})`;
      } else if (bg.type === 'gradient-radial') {
        targetEl.style.background = `radial-gradient(circle, ${bg.color1 || '#1e293b'}, ${
          bg.color2 || '#0f172a'
        })`;
      } else if (bg.type === 'image' && bg.imageUrl) {
        targetEl.style.background = `url(${bg.imageUrl}) center/cover no-repeat`;
      }
    }

    generateShapeSvg(el) {
      const w = el.width || 100;
      const h = el.height || 100;
      const fill = el.fill || '#4f46e5';
      const stroke = el.stroke || '#818cf8';
      const strokeWidth = el.strokeWidth || 2;
      const rad = el.cornerRadius || 0;

      let shapePath = '';

      if (el.shapeType === 'rect') {
        shapePath = `<rect x="${strokeWidth / 2}" y="${strokeWidth / 2}" width="${
          w - strokeWidth
        }" height="${h - strokeWidth}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
      } else if (el.shapeType === 'rounded-rect') {
        shapePath = `<rect x="${strokeWidth / 2}" y="${strokeWidth / 2}" width="${
          w - strokeWidth
        }" height="${h - strokeWidth}" rx="${rad}" ry="${rad}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
      } else if (el.shapeType === 'circle') {
        shapePath = `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${(w - strokeWidth) / 2}" ry="${
          (h - strokeWidth) / 2
        }" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
      } else if (el.shapeType === 'triangle') {
        const points = `${w / 2},${strokeWidth} ${w - strokeWidth},${h - strokeWidth} ${strokeWidth},${
          h - strokeWidth
        }`;
        shapePath = `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round" />`;
      } else if (el.shapeType === 'arrow') {
        const bodyH = h * 0.4;
        const bodyY = (h - bodyH) / 2;
        const headW = w * 0.35;
        const points = `
          ${strokeWidth},${bodyY} 
          ${w - headW},${bodyY} 
          ${w - headW},${strokeWidth} 
          ${w - strokeWidth},${h / 2} 
          ${w - headW},${h - strokeWidth} 
          ${w - headW},${bodyY + bodyH} 
          ${strokeWidth},${bodyY + bodyH}
        `;
        shapePath = `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round" />`;
      } else if (el.shapeType === 'line') {
        shapePath = `<line x1="0" y1="${h / 2}" x2="${w}" y2="${
          h / 2
        }" stroke="${stroke}" stroke-width="${h}" stroke-linecap="round" />`;
      } else if (el.shapeType === 'callout') {
        const bodyH = h * 0.75;
        shapePath = `
          <path d="
            M ${rad} 0 
            H ${w - rad} 
            A ${rad} ${rad} 0 0 1 ${w} ${rad} 
            V ${bodyH - rad} 
            A ${rad} ${rad} 0 0 1 ${w - rad} ${bodyH} 
            H ${w * 0.4} 
            L ${w * 0.25} ${h} 
            L ${w * 0.25} ${bodyH} 
            H ${rad} 
            A ${rad} ${rad} 0 0 1 0 ${bodyH - rad} 
            V ${rad} 
            A ${rad} ${rad} 0 0 1 ${rad} 0 Z" 
            fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
        `;
      }

      return `<svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${shapePath}</svg>`;
    }

    updateSelectionGizmo() {
      const gizmo = document.getElementById('selectionBox');
      const badge = document.getElementById('selectionBadge');
      if (!gizmo || !badge) return;

      const slide = this.getCurrentSlide();
      if (!slide || this.selectedElementIds.length === 0) {
        gizmo.classList.remove('active');
        return;
      }

      // If single element selected, snap gizmo directly to it
      if (this.selectedElementIds.length === 1) {
        const el = slide.elements.find((e) => e.id === this.selectedElementIds[0]);
        if (!el) {
          gizmo.classList.remove('active');
          return;
        }

        gizmo.classList.add('active');
        gizmo.style.left = `${el.x}px`;
        gizmo.style.top = `${el.y}px`;
        gizmo.style.width = `${el.width}px`;
        gizmo.style.height = `${el.height}px`;
        gizmo.style.transform = `rotate(${el.rotation || 0}deg)`;

        badge.textContent = `${Math.round(el.width)} × ${Math.round(el.height)}`;
      } else {
        // Multi-selection: compute bounding box
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;

        slide.elements.forEach((el) => {
          if (this.selectedElementIds.includes(el.id)) {
            minX = Math.min(minX, el.x);
            minY = Math.min(minY, el.y);
            maxX = Math.max(maxX, el.x + el.width);
            maxY = Math.max(maxY, el.y + el.height);
          }
        });

        if (minX !== Infinity) {
          gizmo.classList.add('active');
          gizmo.style.left = `${minX}px`;
          gizmo.style.top = `${minY}px`;
          gizmo.style.width = `${maxX - minX}px`;
          gizmo.style.height = `${maxY - minY}px`;
          gizmo.style.transform = 'none';
          badge.textContent = `${this.selectedElementIds.length} items`;
        }
      }
    }

    renderSpeakerNotes() {
      const slide = this.getCurrentSlide();
      const numLabel = document.getElementById('notesSlideNumber');
      const countLabel = document.getElementById('notesCharCount');
      const textarea = document.getElementById('slideNotesInput');

      if (!slide || !textarea) return;

      if (numLabel) numLabel.textContent = this.currentSlideIndex + 1;
      textarea.value = slide.notes || '';
      if (countLabel) countLabel.textContent = `${(slide.notes || '').length} characters`;
    }

    renderInspector() {
      const slide = this.getCurrentSlide();
      const slideGroup = document.getElementById('groupSlideProperties');
      const elemGroup = document.getElementById('groupElementProperties');

      if (!slide || !slideGroup || !elemGroup) return;

      if (this.selectedElementIds.length === 0) {
        // Show Slide Background & Layout Properties
        slideGroup.style.display = 'block';
        elemGroup.style.display = 'none';
        this.populateSlideInspector(slide);
      } else {
        // Show Element Properties
        slideGroup.style.display = 'none';
        elemGroup.style.display = 'block';
        const el = slide.elements.find((e) => e.id === this.selectedElementIds[0]);
        if (el) this.populateElementInspector(el);
      }

      this.renderLayersTree();
      this.populateTransitionsInspector();
      this.populateAnimationsInspector();
    }

    populateSlideInspector(slide) {
      const bg = slide.background || { type: 'solid', color1: '#0f172a' };
      const typeSel = document.getElementById('slideBgTypeSelect');
      const c1 = document.getElementById('slideBgColor1');
      const c1Text = document.getElementById('slideBgColor1Text');
      const c2Row = document.getElementById('rowSlideBgColor2');
      const c2 = document.getElementById('slideBgColor2');
      const c2Text = document.getElementById('slideBgColor2Text');
      const angleRow = document.getElementById('rowSlideBgAngle');
      const angleSlider = document.getElementById('slideBgAngle');
      const angleVal = document.getElementById('slideBgAngleVal');

      if (typeSel) typeSel.value = bg.type || 'solid';
      if (c1) c1.value = bg.color1 || '#0f172a';
      if (c1Text) c1Text.value = bg.color1 || '#0f172a';

      if (c2Row) {
        c2Row.style.display =
          bg.type === 'gradient-linear' || bg.type === 'gradient-radial' ? 'flex' : 'none';
      }
      if (c2) c2.value = bg.color2 || '#1e293b';
      if (c2Text) c2Text.value = bg.color2 || '#1e293b';

      if (angleRow) {
        angleRow.style.display = bg.type === 'gradient-linear' ? 'flex' : 'none';
      }
      if (angleSlider) angleSlider.value = bg.angle || 135;
      if (angleVal) angleVal.textContent = `${bg.angle || 135}°`;
    }

    populateElementInspector(el) {
      const typeLabel = document.getElementById('elementTypeNameLabel');
      if (typeLabel) {
        typeLabel.textContent = `${el.type.toUpperCase()} Properties`;
      }

      // Transform
      document.getElementById('propX').value = Math.round(el.x);
      document.getElementById('propY').value = Math.round(el.y);
      document.getElementById('propWidth').value = Math.round(el.width);
      document.getElementById('propHeight').value = Math.round(el.height);
      document.getElementById('propRotation').value = Math.round(el.rotation || 0);
      document.getElementById('propOpacity').value = Math.round((el.opacity ?? 1) * 100);

      // Subgroup visibility
      const textSub = document.getElementById('subgroupTextProps');
      const shapeSub = document.getElementById('subgroupShapeProps');
      const mediaSub = document.getElementById('subgroupMediaProps');
      const vidSub = document.getElementById('subgroupVideoProps');
      const audSub = document.getElementById('subgroupAudioProps');

      if (textSub) textSub.style.display = el.type === 'text' ? 'block' : 'none';
      if (shapeSub) shapeSub.style.display = el.type === 'shape' ? 'block' : 'none';
      if (mediaSub) {
        mediaSub.style.display =
          el.type === 'image' || el.type === 'video' || el.type === 'audio' ? 'block' : 'none';
      }

      if (el.type === 'text') {
        document.getElementById('propFontFamily').value = el.fontFamily || 'Inter, sans-serif';
        document.getElementById('propFontSize').value = el.fontSize || 32;
        document.getElementById('propTextColor').value = el.color || '#ffffff';
        document.getElementById('propTextColorText').value = el.color || '#ffffff';
        document.getElementById('propTextBgColor').value =
          el.backgroundColor && el.backgroundColor !== 'transparent'
            ? el.backgroundColor
            : '#000000';
        document.getElementById('propTextBgColorText').value = el.backgroundColor || 'transparent';
        document.getElementById('propLineHeight').value = el.lineHeight || 1.3;

        document.getElementById('btnBold').classList.toggle('active', el.fontWeight === '700');
        document.getElementById('btnItalic').classList.toggle('active', el.fontStyle === 'italic');
        document
          .getElementById('btnUnderline')
          .classList.toggle('active', el.textDecoration === 'underline');
        document
          .getElementById('btnAlignLeft')
          .classList.toggle('active', el.textAlign === 'left');
        document
          .getElementById('btnAlignCenter')
          .classList.toggle('active', el.textAlign === 'center');
        document
          .getElementById('btnAlignRight')
          .classList.toggle('active', el.textAlign === 'right');
      } else if (el.type === 'shape') {
        document.getElementById('propShapeFill').value = el.fill || '#4f46e5';
        document.getElementById('propShapeFillText').value = el.fill || '#4f46e5';
        document.getElementById('propShapeStroke').value = el.stroke || '#818cf8';
        document.getElementById('propShapeStrokeText').value = el.stroke || '#818cf8';
        document.getElementById('propStrokeWidth').value = el.strokeWidth || 2;
        document.getElementById('propCornerRadius').value = el.cornerRadius || 0;
      } else if (el.type === 'video') {
        if (vidSub) vidSub.style.display = 'block';
        if (audSub) audSub.style.display = 'none';
        document.getElementById('propVideoAutoplay').checked = !!el.autoplay;
        document.getElementById('propVideoLoop').checked = !!el.loop;
        document.getElementById('propVideoMuted').checked = !!el.muted;
      } else if (el.type === 'audio') {
        if (vidSub) vidSub.style.display = 'none';
        if (audSub) audSub.style.display = 'block';
        document.getElementById('propAudioLoop').checked = !!el.loop;
        document.getElementById('propAudioBgTrack').checked = !!el.isBackground;
        document.getElementById('propAudioVolume').value = el.volume ?? 1;
      }
    }

    renderLayersTree() {
      const listEl = document.getElementById('layersList');
      const slide = this.getCurrentSlide();
      if (!listEl || !slide) return;

      listEl.innerHTML = '';
      const elements = slide.elements || [];
      // Stack list shows top layer first (reversed array)
      const reversed = [...elements].reverse();

      reversed.forEach((el) => {
        const isSelected = this.selectedElementIds.includes(el.id);
        const row = document.createElement('div');
        row.className = `layer-row ${isSelected ? 'active' : ''}`;

        let icon = '▭';
        let name = 'Shape';
        if (el.type === 'text') {
          icon = 'T';
          name = el.content ? el.content.substring(0, 20) : 'Text Box';
        } else if (el.type === 'image') {
          icon = '🖼️';
          name = 'Image';
        } else if (el.type === 'video') {
          icon = '🎬';
          name = 'Video';
        } else if (el.type === 'audio') {
          icon = '🎵';
          name = el.name || 'Audio Track';
        }

        row.innerHTML = `
          <span class="layer-icon">${icon}</span>
          <span class="layer-name">${name}</span>
          <div class="layer-actions">
            <button class="layer-btn" data-act="del" title="Delete">🗑️</button>
          </div>
        `;

        row.addEventListener('click', (e) => {
          if (e.target.closest('[data-act="del"]')) {
            e.stopPropagation();
            this.selectedElementIds = [el.id];
            this.deleteSelectedElements();
            return;
          }
          this.selectedElementIds = [el.id];
          this.renderCanvas();
          this.renderInspector();
        });

        listEl.appendChild(row);
      });
    }

    populateTransitionsInspector() {
      const slide = this.getCurrentSlide();
      if (!slide) return;

      const trans = slide.transition || { type: 'fade', duration: 0.5 };
      const sel = document.getElementById('transitionEffectSelect');
      const durSlider = document.getElementById('transitionDuration');
      const durVal = document.getElementById('transitionDurationVal');

      if (sel) sel.value = trans.type || 'none';
      if (durSlider) durSlider.value = trans.duration || 0.5;
      if (durVal) durVal.textContent = `${trans.duration || 0.5}s`;
    }

    populateAnimationsInspector() {
      const slide = this.getCurrentSlide();
      const notice = document.getElementById('animationTargetNotice');
      const controls = document.getElementById('animationControls');
      const animList = document.getElementById('animatedElementsList');

      if (!slide || !notice || !controls || !animList) return;

      if (this.selectedElementIds.length === 1) {
        const el = slide.elements.find((e) => e.id === this.selectedElementIds[0]);
        if (el) {
          notice.style.display = 'none';
          controls.style.display = 'block';

          const anim = el.animation || {
            type: 'none',
            trigger: 'on-click',
            duration: 0.6,
            delay: 0
          };
          document.getElementById('animEffectSelect').value = anim.type || 'none';
          document.getElementById('animTriggerSelect').value = anim.trigger || 'on-click';
          document.getElementById('animDuration').value = anim.duration || 0.6;
          document.getElementById('animDurationVal').textContent = `${anim.duration || 0.6}s`;
          document.getElementById('animDelay').value = anim.delay || 0;
          document.getElementById('animDelayVal').textContent = `${anim.delay || 0}s`;
        }
      } else {
        notice.style.display = 'block';
        controls.style.display = 'none';
      }

      // Render all animated elements on this slide
      animList.innerHTML = '';
      const animatedEls = (slide.elements || []).filter(
        (e) => e.animation && e.animation.type !== 'none'
      );

      if (animatedEls.length === 0) {
        animList.innerHTML =
          '<p class="pane-help-text" style="font-size:11px;">No entrance animations configured on this slide.</p>';
      } else {
        animatedEls.forEach((item, idx) => {
          const card = document.createElement('div');
          card.className = 'anim-item-card';
          card.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="anim-item-badge">${idx + 1}</span>
              <span>${item.type.toUpperCase()}: ${item.animation.type}</span>
            </div>
            <span style="font-size:10px; color:var(--text-muted);">${item.animation.trigger}</span>
          `;
          card.addEventListener('click', () => {
            this.selectedElementIds = [item.id];
            this.renderCanvas();
            this.renderInspector();
          });
          animList.appendChild(card);
        });
      }
    }

    updateStatusBar() {
      const slideStatus = document.getElementById('statusSlideIndex');
      const selStatus = document.getElementById('statusSelection');
      const zoomText = document.getElementById('zoomText');
      const zoomSlider = document.getElementById('zoomSlider');

      if (slideStatus && this.project) {
        slideStatus.textContent = `Slide ${this.currentSlideIndex + 1} of ${
          this.project.slides.length
        }`;
      }

      if (selStatus) {
        if (this.selectedElementIds.length === 0) {
          selStatus.textContent = 'Slide background selected';
        } else if (this.selectedElementIds.length === 1) {
          selStatus.textContent = '1 element selected';
        } else {
          selStatus.textContent = `${this.selectedElementIds.length} elements selected`;
        }
      }

      if (zoomText) zoomText.textContent = `${Math.round(this.zoom * 100)}%`;
      if (zoomSlider) zoomSlider.value = Math.round(this.zoom * 100);

      const mobileBadge = document.getElementById('mobileFormatBadge');
      if (mobileBadge) {
        mobileBadge.classList.toggle('show', this.selectedElementIds.length > 0);
      }
    }

    // -----------------------------------------------------------------------
    // CANVAS ZOOM & RESPONSIVENESS
    // -----------------------------------------------------------------------
    setupCanvasResizeObserver() {
      const container = document.getElementById('canvasScrollContainer');
      if (!container) return;

      const ro = new ResizeObserver(() => {
        if (this.autoFitZoom) {
          this.fitCanvasToViewport();
        }
      });
      ro.observe(container);
    }

    fitCanvasToViewport() {
      const container = document.getElementById('canvasScrollContainer');
      const canvasEl = document.getElementById('slideCanvas');
      if (!container || !canvasEl) return;

      const isMobile = window.innerWidth <= 768;
      const padX = isMobile ? 16 : 80;
      const padY = isMobile ? 16 : 80;

      const availW = container.clientWidth - padX;
      const availH = container.clientHeight - padY;

      if (availW <= 0 || availH <= 0) return;

      const scaleX = availW / CANVAS_WIDTH;
      const scaleY = availH / CANVAS_HEIGHT;
      const fitScale = Math.min(scaleX, scaleY, 1.2);

      this.zoom = Math.max(0.12, fitScale);
      canvasEl.style.transform = `scale(${this.zoom})`;
      this.updateStatusBar();
    }

    setCustomZoom(level) {
      this.autoFitZoom = false;
      this.zoom = Math.max(0.25, Math.min(2.5, level));
      const canvasEl = document.getElementById('slideCanvas');
      if (canvasEl) {
        canvasEl.style.transform = `scale(${this.zoom})`;
      }
      this.updateStatusBar();
    }

    // -----------------------------------------------------------------------
    // POINTER EVENTS & DIRECT MANIPULATION
    // -----------------------------------------------------------------------
    screenToSlide(clientX, clientY) {
      const canvasEl = document.getElementById('slideCanvas');
      const rect = canvasEl.getBoundingClientRect();
      const x = (clientX - rect.left) / this.zoom;
      const y = (clientY - rect.top) / this.zoom;
      return { x, y };
    }

    bindCanvasPointerEvents() {
      const canvasEl = document.getElementById('slideCanvas');
      const selectionOverlay = document.getElementById('selectionOverlay');
      if (!canvasEl) return;

      // Pointer Down
      canvasEl.addEventListener('pointerdown', (e) => {
        // Check handle click
        const handle = e.target.closest('.handle');
        if (handle) {
          e.stopPropagation();
          this.handleHandlePointerDown(e, handle);
          return;
        }

        // Check element click
        const elDom = e.target.closest('.slide-element');
        if (elDom) {
          const elId = elDom.dataset.id;
          const slide = this.getCurrentSlide();
          const targetEl = slide ? slide.elements.find((el) => el.id === elId) : null;

          if (targetEl && targetEl.locked) return;

          if (e.shiftKey || e.ctrlKey) {
            // Multi-select toggle
            if (this.selectedElementIds.includes(elId)) {
              this.selectedElementIds = this.selectedElementIds.filter((id) => id !== elId);
            } else {
              this.selectedElementIds.push(elId);
            }
          } else {
            if (!this.selectedElementIds.includes(elId)) {
              this.selectedElementIds = [elId];
            }
          }

          this.updateSelectionGizmo();
          this.renderInspector();
          this.updateStatusBar();

          // Start Drag
          const pt = this.screenToSlide(e.clientX, e.clientY);
          this.startElementDrag(pt.x, pt.y);
          return;
        }

        // Clicked empty canvas space
        if (!e.shiftKey && !e.ctrlKey) {
          this.selectedElementIds = [];
          this.updateSelectionGizmo();
          this.renderInspector();
          this.updateStatusBar();
        }

        // Start Marquee Selection
        const pt = this.screenToSlide(e.clientX, e.clientY);
        this.startMarquee(pt.x, pt.y);
      });

      // Global Pointer Move & Up
      window.addEventListener('pointermove', (e) => {
        const pt = this.screenToSlide(e.clientX, e.clientY);

        if (this.dragState) {
          this.updateElementDrag(pt.x, pt.y, e);
        } else if (this.resizeState) {
          this.updateElementResize(pt.x, pt.y, e);
        } else if (this.rotateState) {
          this.updateElementRotate(e);
        } else if (this.marqueeState) {
          this.updateMarquee(pt.x, pt.y);
        }
      });

      window.addEventListener('pointerup', () => {
        if (this.dragState || this.resizeState || this.rotateState) {
          this.hideGuides();
          this.pushHistory('Transform');
          this.renderThumbnails();
        }

        this.dragState = null;
        this.resizeState = null;
        this.rotateState = null;

        if (this.marqueeState) {
          const mRect = document.getElementById('marqueeRect');
          if (mRect) mRect.style.display = 'none';
          this.marqueeState = null;
          this.updateSelectionGizmo();
          this.renderInspector();
          this.updateStatusBar();
        }
      });

      // Double Click for Direct In-Place Text Editing
      canvasEl.addEventListener('dblclick', (e) => {
        const elDom = e.target.closest('.slide-element');
        if (!elDom) return;

        const elId = elDom.dataset.id;
        const slide = this.getCurrentSlide();
        const el = slide ? slide.elements.find((item) => item.id === elId) : null;

        if (el && el.type === 'text') {
          this.enableInPlaceTextEditing(elDom, el);
        }
      });
    }

    enableInPlaceTextEditing(elDom, el) {
      const textInner = elDom.querySelector('.element-inner-text');
      if (!textInner) return;

      this.isEditingText = true;
      this.editingElementId = el.id;
      textInner.contentEditable = 'true';
      textInner.classList.add('editing');
      textInner.focus();

      // Select all text
      const range = document.createRange();
      range.selectNodeContents(textInner);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);

      const finishEditing = () => {
        if (!this.isEditingText) return;
        this.isEditingText = false;
        this.editingElementId = null;
        textInner.contentEditable = 'false';
        textInner.classList.remove('editing');

        const newText = textInner.textContent;
        if (el.content !== newText) {
          el.content = newText;
          this.pushHistory('Edit text');
          this.renderThumbnails();
        }
      };

      textInner.onblur = finishEditing;
      textInner.onkeydown = (ev) => {
        if (ev.key === 'Escape') {
          finishEditing();
        }
      };
    }

    startElementDrag(startX, startY) {
      const slide = this.getCurrentSlide();
      if (!slide) return;

      const items = slide.elements
        .filter((e) => this.selectedElementIds.includes(e.id))
        .map((e) => ({ id: e.id, initialX: e.x, initialY: e.y, width: e.width, height: e.height }));

      this.dragState = { startX, startY, items };
    }

    updateElementDrag(currentX, currentY, e) {
      if (!this.dragState) return;

      let dx = currentX - this.dragState.startX;
      let dy = currentY - this.dragState.startY;

      const slide = this.getCurrentSlide();
      if (!slide) return;

      // Smart Snapping to Slide Center and Edges
      let snapX = null;
      let snapY = null;

      if (this.dragState.items.length === 1) {
        const item = this.dragState.items[0];
        let targetX = item.initialX + dx;
        let targetY = item.initialY + dy;

        // Snap X (Left, Center, Right)
        if (Math.abs(targetX) < SNAP_THRESHOLD) {
          targetX = 0;
          snapX = 0;
        } else if (Math.abs(targetX + item.width / 2 - CANVAS_WIDTH / 2) < SNAP_THRESHOLD) {
          targetX = CANVAS_WIDTH / 2 - item.width / 2;
          snapX = CANVAS_WIDTH / 2;
        } else if (Math.abs(targetX + item.width - CANVAS_WIDTH) < SNAP_THRESHOLD) {
          targetX = CANVAS_WIDTH - item.width;
          snapX = CANVAS_WIDTH;
        }

        // Snap Y (Top, Middle, Bottom)
        if (Math.abs(targetY) < SNAP_THRESHOLD) {
          targetY = 0;
          snapY = 0;
        } else if (Math.abs(targetY + item.height / 2 - CANVAS_HEIGHT / 2) < SNAP_THRESHOLD) {
          targetY = CANVAS_HEIGHT / 2 - item.height / 2;
          snapY = CANVAS_HEIGHT / 2;
        } else if (Math.abs(targetY + item.height - CANVAS_HEIGHT) < SNAP_THRESHOLD) {
          targetY = CANVAS_HEIGHT - item.height;
          snapY = CANVAS_HEIGHT;
        }

        dx = targetX - item.initialX;
        dy = targetY - item.initialY;
      }

      this.showGuides(snapX, snapY);

      this.dragState.items.forEach((item) => {
        const el = slide.elements.find((e) => e.id === item.id);
        if (el) {
          el.x = item.initialX + dx;
          el.y = item.initialY + dy;

          const elDom = document.getElementById(`canvas_el_${el.id}`);
          if (elDom) {
            elDom.style.left = `${el.x}px`;
            elDom.style.top = `${el.y}px`;
          }
        }
      });

      this.updateSelectionGizmo();
      this.populateElementInspectorLive();
    }

    handleHandlePointerDown(e, handle) {
      const handleType = handle.dataset.handle;
      const pt = this.screenToSlide(e.clientX, e.clientY);

      if (handle.id === 'handleRotate') {
        const slide = this.getCurrentSlide();
        const el = slide.elements.find((item) => item.id === this.selectedElementIds[0]);
        if (el) {
          const centerX = el.x + el.width / 2;
          const centerY = el.y + el.height / 2;
          this.rotateState = {
            elId: el.id,
            centerX,
            centerY,
            initialRotation: el.rotation || 0
          };
        }
      } else if (handleType) {
        const slide = this.getCurrentSlide();
        const el = slide.elements.find((item) => item.id === this.selectedElementIds[0]);
        if (el) {
          this.resizeState = {
            elId: el.id,
            handle: handleType,
            initialX: el.x,
            initialY: el.y,
            initialW: el.width,
            initialH: el.height,
            startX: pt.x,
            startY: pt.y,
            aspectRatio: el.width / el.height
          };
        }
      }
    }

    updateElementResize(currentX, currentY, e) {
      if (!this.resizeState) return;

      const slide = this.getCurrentSlide();
      const el = slide.elements.find((item) => item.id === this.resizeState.elId);
      if (!el) return;

      const dx = currentX - this.resizeState.startX;
      const dy = currentY - this.resizeState.startY;
      const h = this.resizeState.handle;

      let newX = this.resizeState.initialX;
      let newY = this.resizeState.initialY;
      let newW = this.resizeState.initialW;
      let newH = this.resizeState.initialH;

      if (h.includes('e')) newW = Math.max(20, this.resizeState.initialW + dx);
      if (h.includes('s')) newH = Math.max(20, this.resizeState.initialH + dy);
      if (h.includes('w')) {
        const wDelta = Math.min(dx, this.resizeState.initialW - 20);
        newX = this.resizeState.initialX + wDelta;
        newW = this.resizeState.initialW - wDelta;
      }
      if (h.includes('n')) {
        const hDelta = Math.min(dy, this.resizeState.initialH - 20);
        newY = this.resizeState.initialY + hDelta;
        newH = this.resizeState.initialH - hDelta;
      }

      // Preserve aspect ratio if Shift is held
      if (e.shiftKey) {
        newH = newW / this.resizeState.aspectRatio;
      }

      el.x = newX;
      el.y = newY;
      el.width = newW;
      el.height = newH;

      const elDom = document.getElementById(`canvas_el_${el.id}`);
      if (elDom) {
        elDom.style.left = `${el.x}px`;
        elDom.style.top = `${el.y}px`;
        elDom.style.width = `${el.width}px`;
        elDom.style.height = `${el.height}px`;

        if (el.type === 'shape') {
          const shapeCont = elDom.querySelector('.element-inner-shape');
          if (shapeCont) shapeCont.innerHTML = this.generateShapeSvg(el);
        }
      }

      this.updateSelectionGizmo();
      this.populateElementInspectorLive();
    }

    updateElementRotate(e) {
      if (!this.rotateState) return;

      const canvasEl = document.getElementById('slideCanvas');
      const rect = canvasEl.getBoundingClientRect();
      const slidePt = this.screenToSlide(e.clientX, e.clientY);

      const dx = slidePt.x - this.rotateState.centerX;
      const dy = slidePt.y - this.rotateState.centerY;

      let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

      // Snap to 15-degree steps if Shift key is held
      if (e.shiftKey) {
        deg = Math.round(deg / 15) * 15;
      }

      const slide = this.getCurrentSlide();
      const el = slide.elements.find((item) => item.id === this.rotateState.elId);
      if (el) {
        el.rotation = Math.round(deg);
        const elDom = document.getElementById(`canvas_el_${el.id}`);
        if (elDom) {
          elDom.style.transform = `rotate(${el.rotation}deg)`;
        }
        this.updateSelectionGizmo();
        this.populateElementInspectorLive();
      }
    }

    startMarquee(x, y) {
      this.marqueeState = { startX: x, startY: y };
      const mRect = document.getElementById('marqueeRect');
      if (mRect) {
        mRect.style.display = 'block';
        mRect.style.left = `${x}px`;
        mRect.style.top = `${y}px`;
        mRect.style.width = '0px';
        mRect.style.height = '0px';
      }
    }

    updateMarquee(currentX, currentY) {
      if (!this.marqueeState) return;

      const left = Math.min(this.marqueeState.startX, currentX);
      const top = Math.min(this.marqueeState.startY, currentY);
      const width = Math.abs(currentX - this.marqueeState.startX);
      const height = Math.abs(currentY - this.marqueeState.startY);

      const mRect = document.getElementById('marqueeRect');
      if (mRect) {
        mRect.style.left = `${left}px`;
        mRect.style.top = `${top}px`;
        mRect.style.width = `${width}px`;
        mRect.style.height = `${height}px`;
      }

      // Check intersections
      const slide = this.getCurrentSlide();
      if (!slide) return;

      const selected = [];
      slide.elements.forEach((el) => {
        const elRight = el.x + el.width;
        const elBottom = el.y + el.height;
        const intersects =
          el.x < left + width && elRight > left && el.y < top + height && elBottom > top;
        if (intersects) selected.push(el.id);
      });

      this.selectedElementIds = selected;
    }

    showGuides(x, y) {
      const gx = document.getElementById('guideLineX');
      const gy = document.getElementById('guideLineY');

      if (gy) {
        if (x !== null) {
          gy.style.display = 'block';
          gy.style.left = `${x}px`;
        } else {
          gy.style.display = 'none';
        }
      }

      if (gx) {
        if (y !== null) {
          gx.style.display = 'block';
          gx.style.top = `${y}px`;
        } else {
          gx.style.display = 'none';
        }
      }
    }

    hideGuides() {
      const gx = document.getElementById('guideLineX');
      const gy = document.getElementById('guideLineY');
      if (gx) gx.style.display = 'none';
      if (gy) gy.style.display = 'none';
    }

    populateElementInspectorLive() {
      const slide = this.getCurrentSlide();
      if (!slide || this.selectedElementIds.length !== 1) return;
      const el = slide.elements.find((e) => e.id === this.selectedElementIds[0]);
      if (!el) return;

      const propX = document.getElementById('propX');
      const propY = document.getElementById('propY');
      const propW = document.getElementById('propWidth');
      const propH = document.getElementById('propHeight');
      const propR = document.getElementById('propRotation');

      if (propX) propX.value = Math.round(el.x);
      if (propY) propY.value = Math.round(el.y);
      if (propW) propW.value = Math.round(el.width);
      if (propH) propH.value = Math.round(el.height);
      if (propR) propR.value = Math.round(el.rotation || 0);
    }

    // -----------------------------------------------------------------------
    // FULLSCREEN PRESENTATION MODE
    // -----------------------------------------------------------------------
    startPresentation(fromCurrent = false) {
      if (!this.project || this.project.slides.length === 0) return;

      this.isPresentationActive = true;
      this.presentationSlideIndex = fromCurrent ? this.currentSlideIndex : 0;
      this.presentationStep = 0;
      this.presentationLaserActive = false;

      const overlay = document.getElementById('presentationOverlay');
      if (overlay) {
        overlay.classList.add('active');
        overlay.focus();
      }

      // Try native fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }

      this.renderPresentationSlide();
      this.bindPresentationKeys();
    }

    exitPresentation() {
      this.isPresentationActive = false;
      const overlay = document.getElementById('presentationOverlay');
      if (overlay) overlay.classList.remove('active');

      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }

      // Stop any running media
      const container = document.getElementById('presentationSlideContainer');
      if (container) {
        container.querySelectorAll('video, audio').forEach((m) => {
          m.pause();
        });
      }
    }

    renderPresentationSlide() {
      const container = document.getElementById('presentationSlideContainer');
      const counter = document.getElementById('hudSlideCounter');
      const notesContent = document.getElementById('hudNotesContent');
      if (!container || !this.project) return;

      const slide = this.project.slides[this.presentationSlideIndex];
      if (!slide) return;

      if (counter) {
        counter.textContent = `${this.presentationSlideIndex + 1} / ${
          this.project.slides.length
        }`;
      }

      if (notesContent) {
        notesContent.textContent = slide.notes || 'No speaker notes for this slide.';
      }

      // Apply transition animation
      const transType = (slide.transition && slide.transition.type) || 'fade';
      container.style.opacity = '0';
      this.applySlideBackground(container, slide.background);

      // Compute display scale for full screen letterbox
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const scale = Math.min(winW / CANVAS_WIDTH, winH / CANVAS_HEIGHT);
      container.style.transform = `scale(${scale})`;

      container.innerHTML = '';

      // Elements
      const sorted = [...(slide.elements || [])].sort(
        (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
      );

      // Reset step index for slide
      this.presentationStep = 0;
      this.animatedElementsForCurrentSlide = [];

      sorted.forEach((el) => {
        const elDiv = document.createElement('div');
        elDiv.style.position = 'absolute';
        elDiv.style.left = `${el.x}px`;
        elDiv.style.top = `${el.y}px`;
        elDiv.style.width = `${el.width}px`;
        elDiv.style.height = `${el.height}px`;
        elDiv.style.transform = `rotate(${el.rotation || 0}deg)`;
        elDiv.style.opacity = el.opacity ?? 1;

        // Content
        if (el.type === 'text') {
          const t = document.createElement('div');
          t.style.width = '100%';
          t.style.height = '100%';
          t.style.fontFamily = el.fontFamily;
          t.style.fontSize = `${el.fontSize}px`;
          t.style.fontWeight = el.fontWeight;
          t.style.fontStyle = el.fontStyle;
          t.style.textDecoration = el.textDecoration;
          t.style.textAlign = el.textAlign;
          t.style.color = el.color;
          t.style.backgroundColor = el.backgroundColor || 'transparent';
          t.style.lineHeight = el.lineHeight || 1.3;
          t.style.whiteSpace = 'pre-wrap';
          t.style.padding = '4px 8px';
          t.textContent = el.content;
          elDiv.appendChild(t);
        } else if (el.type === 'shape') {
          elDiv.innerHTML = this.generateShapeSvg(el);
        } else if (el.type === 'image') {
          const img = document.createElement('img');
          img.src = el.src;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = el.fit || 'contain';
          elDiv.appendChild(img);
        } else if (el.type === 'video') {
          const vid = document.createElement('video');
          vid.src = el.src;
          vid.controls = true;
          vid.loop = el.loop;
          vid.muted = el.muted;
          vid.style.width = '100%';
          vid.style.height = '100%';
          vid.style.objectFit = el.fit || 'contain';
          if (el.autoplay) vid.play().catch(() => {});
          elDiv.appendChild(vid);
        } else if (el.type === 'audio') {
          const aud = document.createElement('audio');
          aud.src = el.src;
          aud.controls = true;
          aud.loop = el.loop;
          aud.volume = el.volume ?? 1;
          if (el.isBackground) aud.play().catch(() => {});
          elDiv.appendChild(aud);
        }

        // Element Animations
        if (el.animation && el.animation.type && el.animation.type !== 'none') {
          elDiv.dataset.anim = el.animation.type;
          elDiv.dataset.trigger = el.animation.trigger || 'on-click';
          elDiv.dataset.duration = el.animation.duration || 0.6;
          elDiv.dataset.delay = el.animation.delay || 0;

          if (el.animation.trigger === 'on-click') {
            // Initially hidden until stepped
            elDiv.style.opacity = '0';
            this.animatedElementsForCurrentSlide.push(elDiv);
          } else {
            // Animate automatically on entrance
            elDiv.classList.add(`anim-${el.animation.type}`);
            elDiv.style.setProperty('--anim-duration', `${el.animation.duration}s`);
            elDiv.style.animationDelay = `${el.animation.delay}s`;
          }
        }

        container.appendChild(elDiv);
      });

      // Fade-in container
      requestAnimationFrame(() => {
        container.style.opacity = '1';
      });
    }

    advancePresentation() {
      // If there are un-triggered click animations on current slide, trigger next
      if (
        this.animatedElementsForCurrentSlide &&
        this.presentationStep < this.animatedElementsForCurrentSlide.length
      ) {
        const target = this.animatedElementsForCurrentSlide[this.presentationStep];
        target.classList.add(`anim-${target.dataset.anim}`);
        target.style.setProperty('--anim-duration', `${target.dataset.duration}s`);
        target.style.opacity = '1';
        this.presentationStep++;
        return;
      }

      // Advance to next slide
      if (this.presentationSlideIndex < this.project.slides.length - 1) {
        this.presentationSlideIndex++;
        this.renderPresentationSlide();
      }
    }

    previousPresentation() {
      if (this.presentationSlideIndex > 0) {
        this.presentationSlideIndex--;
        this.renderPresentationSlide();
      }
    }

    bindPresentationKeys() {
      const overlay = document.getElementById('presentationOverlay');
      if (!overlay) return;

      overlay.onkeydown = (e) => {
        if (!this.isPresentationActive) return;

        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
          e.preventDefault();
          this.advancePresentation();
        } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
          e.preventDefault();
          this.previousPresentation();
        } else if (e.key === 'Home') {
          this.presentationSlideIndex = 0;
          this.renderPresentationSlide();
        } else if (e.key === 'End') {
          this.presentationSlideIndex = this.project.slides.length - 1;
          this.renderPresentationSlide();
        } else if (e.key === 'Escape') {
          this.exitPresentation();
        } else if (e.key === 'b' || e.key === 'B') {
          // Black screen toggle
          overlay.style.backgroundColor =
            overlay.style.backgroundColor === 'rgb(0, 0, 0)' ? '#111827' : '#000000';
        }
      };

      // Click on viewport advances
      const viewport = document.getElementById('presentationViewport');
      if (viewport) {
        viewport.onclick = (e) => {
          if (e.target.closest('#presentationHud') || e.target.closest('#hudNotesPopup')) return;
          this.advancePresentation();
        };
      }

      // Touch swipe gestures on mobile & tablet
      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartTime = 0;

      overlay.ontouchstart = (e) => {
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchStartTime = Date.now();
        }
      };

      overlay.ontouchend = (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          const deltaY = e.changedTouches[0].clientY - touchStartY;
          const elapsedTime = Date.now() - touchStartTime;

          // Horizontal swipe detection (> 45px, mostly horizontal)
          if (elapsedTime < 500 && Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
            if (deltaX < 0) {
              // Swipe left -> advance
              this.advancePresentation();
            } else {
              // Swipe right -> previous
              this.previousPresentation();
            }
          }
        }
      };

      // Laser pointer tracker
      const laser = document.getElementById('presentationLaser');
      viewport.onmousemove = (e) => {
        if (this.presentationLaserActive && laser) {
          laser.style.left = `${e.clientX}px`;
          laser.style.top = `${e.clientY}px`;
        }
      };
    }

    // -----------------------------------------------------------------------
    // MEDIA FOLDER INTEGRATION (BROWSER-NATIVE FILE SYSTEM ACCESS API)
    // -----------------------------------------------------------------------
    async connectMediaFolder() {
      if (!window.showDirectoryPicker) {
        this.showToast(
          'File System Access API is not supported in this browser. Please use the fallback folder selector.',
          'error'
        );
        document.getElementById('inputFolderFallback').click();
        return;
      }

      try {
        const dirHandle = await window.showDirectoryPicker({ id: 'slidecraft_media' });
        this.directoryHandle = dirHandle;
        this.mediaAssetsCache = [];

        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            if (
              file.type.startsWith('image/') ||
              file.type.startsWith('video/') ||
              file.type.startsWith('audio/')
            ) {
              const url = URL.createObjectURL(file);
              this.mediaAssetsCache.push({
                name: file.name,
                type: file.type,
                size: file.size,
                url: url,
                file: file
              });
            }
          }
        }

        this.renderMediaLibraryGrid();
        this.showToast(`Connected media folder: ${this.mediaAssetsCache.length} files loaded`, 'success');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Directory picker error:', err);
          this.showToast('Could not access folder: ' + err.message, 'error');
        }
      }
    }

    handleMediaFilesUpload(files) {
      if (!files || files.length === 0) return;

      Array.from(files).forEach((file) => {
        if (
          file.type.startsWith('image/') ||
          file.type.startsWith('video/') ||
          file.type.startsWith('audio/')
        ) {
          const url = URL.createObjectURL(file);
          this.mediaAssetsCache.push({
            name: file.name,
            type: file.type,
            size: file.size,
            url: url,
            file: file
          });
        }
      });

      this.renderMediaLibraryGrid();
      this.showToast(`Imported ${files.length} media items`, 'success');
    }

    renderMediaLibraryGrid() {
      const grid = document.getElementById('mediaLibraryGrid');
      if (!grid) return;

      grid.innerHTML = '';
      if (this.mediaAssetsCache.length === 0) {
        grid.innerHTML =
          '<div class="empty-media-notice">No media files currently selected. Connect your local "media/" folder or click "Upload Media Files".</div>';
        return;
      }

      this.mediaAssetsCache.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'media-item-card';

        let thumbHtml = '';
        if (item.type.startsWith('image/')) {
          thumbHtml = `<img src="${item.url}" alt="${item.name}">`;
        } else if (item.type.startsWith('video/')) {
          thumbHtml = `<video src="${item.url}"></video>`;
        } else if (item.type.startsWith('audio/')) {
          thumbHtml = '<span class="audio-icon-preview">🎵</span>';
        }

        const sizeKb = Math.round(item.size / 1024);

        card.innerHTML = `
          <div class="media-item-thumb">${thumbHtml}</div>
          <div class="media-item-details">
            <span class="media-item-name" title="${item.name}">${item.name}</span>
            <span class="media-item-meta">${item.type} • ${sizeKb} KB</span>
            <div class="media-item-actions">
              <button class="media-insert-btn">Insert Into Slide</button>
            </div>
          </div>
        `;

        card.querySelector('.media-insert-btn').addEventListener('click', () => {
          this.insertMediaElement(item.file);
          document.getElementById('modalMediaLibrary').style.display = 'none';
        });

        grid.appendChild(card);
      });
    }

    async renderProjectsManager() {
      const container = document.getElementById('projectsManagerList');
      if (!container) return;
      container.innerHTML = '<p class="pane-help-text">Loading saved presentations...</p>';

      const projects = await this.storage.getAllProjects();
      if (projects.length === 0) {
        container.innerHTML =
          '<p class="pane-help-text">No saved presentations in browser storage yet. Click "Create New Presentation" to start a new deck.</p>';
        return;
      }

      container.innerHTML = '';
      projects.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

      projects.forEach((proj) => {
        const card = document.createElement('div');
        card.className = 'project-item-card';

        const updatedDate = proj.updatedAt
          ? new Date(proj.updatedAt).toLocaleString()
          : 'Recently';
        const slideCount = (proj.slides || []).length;
        const isCurrent = this.project && this.project.id === proj.id;

        card.innerHTML = `
          <div>
            <div class="project-item-title">${proj.title || 'Untitled'} ${
              isCurrent ? '<span style="color:var(--primary-light); font-size:11px;">(Active)</span>' : ''
            }</div>
            <div class="project-item-meta">${slideCount} slides • Saved ${updatedDate}</div>
          </div>
          <div class="project-item-actions">
            ${
              !isCurrent
                ? '<button class="prop-btn" data-act="open" style="padding:4px 10px; width:auto;">Open</button>'
                : ''
            }
            <button class="prop-btn-secondary" data-act="dup" style="padding:4px 10px; width:auto;">Copy</button>
            <button class="prop-btn-danger" data-act="del" style="padding:4px 10px; width:auto;">Delete</button>
          </div>
        `;

        card.querySelectorAll('button').forEach((b) => {
          b.onclick = async () => {
            const act = b.dataset.act;
            if (act === 'open') {
              this.project = proj;
              this.currentSlideIndex = 0;
              this.selectedElementIds = [];
              this.cacheInitialHistory();
              this.renderAll();
              document.getElementById('modalProjectManager').style.display = 'none';
              this.showToast(`Opened "${proj.title}"`, 'success');
            } else if (act === 'dup') {
              const copy = JSON.parse(JSON.stringify(proj));
              copy.id = 'proj_' + Math.random().toString(36).substring(2, 9);
              copy.title = (copy.title || 'Presentation') + ' (Copy)';
              copy.updatedAt = Date.now();
              await this.storage.saveProject(copy);
              this.renderProjectsManager();
              this.showToast('Duplicated project', 'success');
            } else if (act === 'del') {
              if (confirm(`Delete presentation "${proj.title}"?`)) {
                await this.storage.deleteProject(proj.id);
                this.renderProjectsManager();
                this.showToast('Presentation deleted', 'info');
              }
            }
          };
        });

        container.appendChild(card);
      });
    }

    // -----------------------------------------------------------------------
    // PROJECT EXPORT & IMPORT (JSON & BUNDLE & PRINT PDF)
    // -----------------------------------------------------------------------
    exportProjectJson() {
      if (!this.project) return;
      const dataStr =
        'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.project, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `${(this.project.title || 'presentation')
        .toLowerCase()
        .replace(/\s+/g, '_')}.json`;
      a.click();
      this.showToast('Exported presentation JSON', 'success');
    }

    async exportProjectBundle() {
      if (!this.project) return;
      const clone = JSON.parse(JSON.stringify(this.project));

      // Embed media files as base64 so bundle is completely portable
      for (const slide of clone.slides) {
        for (const el of slide.elements) {
          if (el.mediaAssetId) {
            const asset = await this.storage.getMediaAsset(el.mediaAssetId);
            if (asset && asset.blob) {
              el.embeddedBase64 = await this.blobToBase64(asset.blob);
            }
          }
        }
      }

      const dataStr =
        'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(clone, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `${(this.project.title || 'presentation')
        .toLowerCase()
        .replace(/\s+/g, '_')}_bundle.slidecraft`;
      a.click();
      this.showToast('Exported self-contained bundle with embedded media', 'success');
    }

    blobToBase64(blob) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    }

    async importProjectJson(file) {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);

        // Validation
        if (!parsed || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
          throw new Error('Invalid SlideCraft presentation format.');
        }

        // Restore embedded media if package has base64 data
        for (const slide of parsed.slides) {
          for (const el of slide.elements || []) {
            if (el.embeddedBase64) {
              el.src = el.embeddedBase64;
            }
          }
        }

        this.project = parsed;
        this.currentSlideIndex = 0;
        this.selectedElementIds = [];
        this.cacheInitialHistory();
        await this.storage.saveProject(this.project);
        this.renderAll();
        this.showToast(`Imported: ${this.project.title || 'Presentation'}`, 'success');
      } catch (err) {
        console.error('Import error:', err);
        this.showToast('Failed to import project: ' + err.message, 'error');
      }
    }

    printToPdf() {
      // Build print container of all slides
      let printContainer = document.getElementById('slidecraftPrintPages');
      if (printContainer) printContainer.remove();

      printContainer = document.createElement('div');
      printContainer.id = 'slidecraftPrintPages';

      this.project.slides.forEach((slide) => {
        const page = document.createElement('div');
        page.className = 'print-slide-page';
        this.applySlideBackground(page, slide.background);

        (slide.elements || []).forEach((el) => {
          const elDiv = document.createElement('div');
          elDiv.style.position = 'absolute';
          elDiv.style.left = `${el.x}px`;
          elDiv.style.top = `${el.y}px`;
          elDiv.style.width = `${el.width}px`;
          elDiv.style.height = `${el.height}px`;
          elDiv.style.transform = `rotate(${el.rotation || 0}deg)`;
          elDiv.style.opacity = el.opacity ?? 1;

          if (el.type === 'text') {
            elDiv.style.fontFamily = el.fontFamily;
            elDiv.style.fontSize = `${el.fontSize}px`;
            elDiv.style.fontWeight = el.fontWeight;
            elDiv.style.textAlign = el.textAlign;
            elDiv.style.color = el.color;
            elDiv.style.backgroundColor = el.backgroundColor || 'transparent';
            elDiv.style.lineHeight = el.lineHeight || 1.3;
            elDiv.style.whiteSpace = 'pre-wrap';
            elDiv.textContent = el.content;
          } else if (el.type === 'shape') {
            elDiv.innerHTML = this.generateShapeSvg(el);
          } else if (el.type === 'image') {
            const img = document.createElement('img');
            img.src = el.src;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = el.fit || 'contain';
            elDiv.appendChild(img);
          }
          page.appendChild(elDiv);
        });

        printContainer.appendChild(page);
      });

      document.body.appendChild(printContainer);

      setTimeout(() => {
        window.print();
        setTimeout(() => printContainer.remove(), 1000);
      }, 300);
    }

    // -----------------------------------------------------------------------
    // UI BINDINGS & EVENT LISTENERS
    // -----------------------------------------------------------------------
    bindUI() {
      // Presentation Title
      const titleInput = document.getElementById('projectTitleInput');
      if (titleInput) {
        titleInput.addEventListener('change', () => {
          this.project.title = titleInput.value.trim() || 'Untitled Presentation';
          this.pushHistory('Rename presentation');
        });
      }

      // Menubar Dropdowns Toggle
      document.querySelectorAll('.menu-dropdown').forEach((item) => {
        const btn = item.querySelector('.menu-btn');
        const panel = item.querySelector('.dropdown-panel');

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelectorAll('.dropdown-panel').forEach((p) => {
            if (p !== panel) p.classList.remove('show');
          });
          panel.classList.toggle('show');
        });
      });

      window.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-panel').forEach((p) => p.classList.remove('show'));
        const shapePal = document.getElementById('shapesPalette');
        if (shapePal) shapePal.classList.remove('show');
      });

      // Menubar Actions
      document.getElementById('btnNewProject').onclick = () => {
        this.project = createSampleProject();
        this.currentSlideIndex = 0;
        this.selectedElementIds = [];
        this.cacheInitialHistory();
        this.renderAll();
        this.showToast('Created new presentation deck', 'success');
      };

      const btnOpenManager = document.getElementById('btnOpenProjectManager');
      if (btnOpenManager) {
        btnOpenManager.onclick = () => {
          this.renderProjectsManager();
          document.getElementById('modalProjectManager').style.display = 'flex';
        };
      }

      const btnCreateNewMgr = document.getElementById('btnCreateNewProjectFromManager');
      if (btnCreateNewMgr) {
        btnCreateNewMgr.onclick = () => {
          this.project = createSampleProject();
          this.currentSlideIndex = 0;
          this.selectedElementIds = [];
          this.cacheInitialHistory();
          this.renderAll();
          document.getElementById('modalProjectManager').style.display = 'none';
          this.showToast('Created new presentation deck', 'success');
        };
      }

      const btnImportMgr = document.getElementById('btnImportProjectFileFromManager');
      if (btnImportMgr) {
        btnImportMgr.onclick = () => {
          document.getElementById('hiddenProjectJsonInput').click();
          document.getElementById('modalProjectManager').style.display = 'none';
        };
      }

      document.getElementById('btnSave').onclick = async () => {
        await this.storage.saveProject(this.project);
        this.setSaveStatus('saved', 'Saved to browser');
        this.showToast('Presentation saved to browser storage', 'success');
      };

      const btnSaveAsCopy = document.getElementById('btnSaveAsCopy');
      if (btnSaveAsCopy) {
        btnSaveAsCopy.onclick = async () => {
          const copy = JSON.parse(JSON.stringify(this.project));
          copy.id = 'proj_' + Math.random().toString(36).substring(2, 9);
          copy.title = (this.project.title || 'Presentation') + ' (Copy)';
          await this.storage.saveProject(copy);
          this.showToast('Saved copy to browser storage', 'success');
        };
      }

      document.getElementById('btnExportJson').onclick = () => this.exportProjectJson();
      document.getElementById('btnExportBundle').onclick = () => this.exportProjectBundle();
      document.getElementById('btnPrintPdf').onclick = () => this.printToPdf();

      document.getElementById('btnImportJson').onclick = () => {
        document.getElementById('hiddenProjectJsonInput').click();
      };
      document.getElementById('hiddenProjectJsonInput').onchange = (e) => {
        if (e.target.files[0]) this.importProjectJson(e.target.files[0]);
      };

      document.getElementById('btnConnectMediaFolder').onclick = () => this.connectMediaFolder();

      // Mobile Drawer and Bottom Nav Elements
      const mobileNavDrawer = document.getElementById('mobileNavDrawer');
      const mobileBackdrop = document.getElementById('mobileDrawerBackdrop');
      const sidebarSlides = document.getElementById('sidebarSlides');
      const sidebarInspector = document.getElementById('sidebarInspector');

      const closeAllMobileDrawers = () => {
        if (mobileNavDrawer) mobileNavDrawer.classList.remove('open');
        if (sidebarSlides) sidebarSlides.classList.remove('mobile-open');
        if (sidebarInspector) sidebarInspector.classList.remove('mobile-open');
        if (mobileBackdrop) mobileBackdrop.classList.remove('active');
        document.querySelectorAll('.mobile-nav-btn').forEach((b) => b.classList.remove('active'));
      };

      if (mobileBackdrop) {
        mobileBackdrop.onclick = closeAllMobileDrawers;
      }

      // Mobile Menu Toggle Button (Hamburger)
      const btnMobileMenuToggle = document.getElementById('btnMobileMenuToggle');
      if (btnMobileMenuToggle) {
        btnMobileMenuToggle.onclick = () => {
          closeAllMobileDrawers();
          if (mobileNavDrawer && mobileBackdrop) {
            mobileNavDrawer.classList.add('open');
            mobileBackdrop.classList.add('active');
          }
        };
      }

      const btnCloseMobileNav = document.getElementById('btnCloseMobileNav');
      if (btnCloseMobileNav) btnCloseMobileNav.onclick = closeAllMobileDrawers;

      // Mobile Bottom Nav: Slides Drawer Toggle
      const btnMobileToggleSlides = document.getElementById('btnMobileToggleSlides');
      if (btnMobileToggleSlides) {
        btnMobileToggleSlides.onclick = () => {
          const isOpen = sidebarSlides && sidebarSlides.classList.contains('mobile-open');
          closeAllMobileDrawers();
          if (!isOpen && sidebarSlides && mobileBackdrop) {
            sidebarSlides.classList.add('mobile-open');
            mobileBackdrop.classList.add('active');
            btnMobileToggleSlides.classList.add('active');
          }
        };
      }

      const btnCloseMobileSlides = document.getElementById('btnCloseMobileSlides');
      if (btnCloseMobileSlides) btnCloseMobileSlides.onclick = closeAllMobileDrawers;

      // Mobile Bottom Nav: Format / Inspector Toggle
      const btnMobileFormat = document.getElementById('btnMobileFormat');
      if (btnMobileFormat) {
        btnMobileFormat.onclick = () => {
          const isOpen = sidebarInspector && sidebarInspector.classList.contains('mobile-open');
          closeAllMobileDrawers();
          if (!isOpen && sidebarInspector && mobileBackdrop) {
            sidebarInspector.classList.add('mobile-open');
            mobileBackdrop.classList.add('active');
            btnMobileFormat.classList.add('active');
          }
        };
      }

      const btnCloseMobileInspector = document.getElementById('btnCloseMobileInspector');
      if (btnCloseMobileInspector) btnCloseMobileInspector.onclick = closeAllMobileDrawers;

      // Mobile Bottom Nav: Insert
      const btnMobileInsert = document.getElementById('btnMobileInsert');
      if (btnMobileInsert) {
        btnMobileInsert.onclick = () => {
          closeAllMobileDrawers();
          document.getElementById('modalLayoutPicker').style.display = 'flex';
        };
      }

      // Mobile Bottom Nav: Notes
      const btnMobileNotes = document.getElementById('btnMobileNotes');
      if (btnMobileNotes) {
        btnMobileNotes.onclick = () => {
          closeAllMobileDrawers();
          const drawer = document.getElementById('speakerNotesDrawer');
          if (drawer) {
            drawer.classList.toggle('collapsed');
          }
        };
      }

      // Mobile Bottom Nav: Present
      const btnMobilePresent = document.getElementById('btnMobilePresent');
      if (btnMobilePresent) {
        btnMobilePresent.onclick = () => {
          closeAllMobileDrawers();
          this.startPresentation(false);
        };
      }

      // Mobile Nav Drawer action items
      const bindMobileItem = (id, fn) => {
        const item = document.getElementById(id);
        if (item) {
          item.onclick = () => {
            closeAllMobileDrawers();
            fn();
          };
        }
      };

      bindMobileItem('mBtnNew', () => {
        this.project = createSampleProject();
        this.currentSlideIndex = 0;
        this.selectedElementIds = [];
        this.cacheInitialHistory();
        this.renderAll();
        this.showToast('Created new presentation deck', 'success');
      });
      bindMobileItem('mBtnOpenManager', () => {
        this.renderProjectsManager();
        document.getElementById('modalProjectManager').style.display = 'flex';
      });
      bindMobileItem('mBtnSave', async () => {
        await this.storage.saveProject(this.project);
        this.setSaveStatus('saved', 'Saved to browser');
        this.showToast('Presentation saved to browser', 'success');
      });
      bindMobileItem('mBtnImport', () => document.getElementById('hiddenProjectJsonInput').click());
      bindMobileItem('mBtnExport', () => this.exportProjectJson());
      bindMobileItem('mBtnExportBundle', () => this.exportProjectBundle());
      bindMobileItem('mBtnPrint', () => this.printToPdf());
      bindMobileItem('mBtnMediaFolder', () => {
        this.renderMediaLibraryGrid();
        document.getElementById('modalMediaLibrary').style.display = 'flex';
      });
      bindMobileItem('mBtnUndo', () => this.undo());
      bindMobileItem('mBtnRedo', () => this.redo());
      bindMobileItem('mBtnDuplicate', () => this.duplicateSelectedElements());
      bindMobileItem('mBtnDelete', () => this.deleteSelectedElements());
      bindMobileItem('mBtnShortcuts', () => {
        document.getElementById('modalShortcuts').style.display = 'flex';
      });

      const mobileThemeSelect = document.getElementById('mobileThemeSelect');
      if (mobileThemeSelect) {
        mobileThemeSelect.value = (this.project && this.project.theme) || 'modern-dark';
        mobileThemeSelect.onchange = (e) => {
          this.project.theme = e.target.value;
          this.updateDeckTheme();
          this.pushHistory('Change deck theme');
          closeAllMobileDrawers();
        };
      }

      // Undo / Redo
      document.getElementById('btnUndo').onclick = () => this.undo();
      document.getElementById('btnRedo').onclick = () => this.redo();
      document.getElementById('ribbonUndo').onclick = () => this.undo();
      document.getElementById('ribbonRedo').onclick = () => this.redo();

      // Duplicate / Delete / Select All
      document.getElementById('btnDuplicate').onclick = () => this.duplicateSelectedElements();
      document.getElementById('btnDeleteSelected').onclick = () => this.deleteSelectedElements();
      document.getElementById('btnSelectAll').onclick = () => {
        const slide = this.getCurrentSlide();
        if (slide) {
          this.selectedElementIds = (slide.elements || []).map((e) => e.id);
          this.updateSelectionGizmo();
          this.renderInspector();
          this.updateStatusBar();
        }
      };

      // Slide insertion & layouts
      document.getElementById('ribbonNewSlideBtn').onclick = () => {
        document.getElementById('modalLayoutPicker').style.display = 'flex';
      };
      document.getElementById('btnAddSlideSidebar').onclick = () => {
        document.getElementById('modalLayoutPicker').style.display = 'flex';
      };
      document.getElementById('menuNewSlide').onclick = () => {
        document.getElementById('modalLayoutPicker').style.display = 'flex';
      };
      document.getElementById('btnChangeLayout').onclick = () => {
        document.getElementById('modalLayoutPicker').style.display = 'flex';
      };

      document.querySelectorAll('.layout-card').forEach((card) => {
        card.onclick = () => {
          const ltype = card.dataset.layout;
          this.addSlideWithPreset(ltype);
          document.getElementById('modalLayoutPicker').style.display = 'none';
        };
      });

      // Ribbon Insert Controls
      document.getElementById('ribbonAddText').onclick = () => this.insertTextBox();
      document.getElementById('menuInsertText').onclick = () => this.insertTextBox();

      // Shapes dropdown palette
      const shapesBtn = document.getElementById('ribbonShapesBtn');
      const shapesPalette = document.getElementById('shapesPalette');
      shapesBtn.onclick = (e) => {
        e.stopPropagation();
        shapesPalette.classList.toggle('show');
      };

      document.querySelectorAll('.shape-pick-btn').forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const sh = btn.dataset.shape;
          this.insertShape(sh);
          shapesPalette.classList.remove('show');
        };
      });

      // Direct Media Upload Pickers
      document.getElementById('ribbonAddImage').onclick = () =>
        document.getElementById('hiddenSingleImageInput').click();
      document.getElementById('hiddenSingleImageInput').onchange = (e) => {
        if (e.target.files[0]) this.insertMediaElement(e.target.files[0]);
      };

      document.getElementById('ribbonAddVideo').onclick = () =>
        document.getElementById('hiddenSingleVideoInput').click();
      document.getElementById('hiddenSingleVideoInput').onchange = (e) => {
        if (e.target.files[0]) this.insertMediaElement(e.target.files[0]);
      };

      document.getElementById('ribbonAddAudio').onclick = () =>
        document.getElementById('hiddenSingleAudioInput').click();
      document.getElementById('hiddenSingleAudioInput').onchange = (e) => {
        if (e.target.files[0]) this.insertMediaElement(e.target.files[0]);
      };

      // Media Library Modal
      document.getElementById('ribbonMediaLibrary').onclick = () => {
        this.renderMediaLibraryGrid();
        document.getElementById('modalMediaLibrary').style.display = 'flex';
      };
      document.getElementById('btnConnectFsFolder').onclick = () => this.connectMediaFolder();
      document.getElementById('inputFolderFallback').onchange = (e) =>
        this.handleMediaFilesUpload(e.target.files);
      document.getElementById('inputMediaFiles').onchange = (e) =>
        this.handleMediaFilesUpload(e.target.files);

      // Ribbon Ordering & Alignment
      document.getElementById('ribbonBringForward').onclick = () => this.changeZOrder('forward');
      document.getElementById('ribbonSendBackward').onclick = () => this.changeZOrder('backward');
      document.getElementById('ribbonAlignLeft').onclick = () => this.alignSelectedElements('left');
      document.getElementById('ribbonAlignCenter').onclick = () =>
        this.alignSelectedElements('center');
      document.getElementById('ribbonAlignRight').onclick = () =>
        this.alignSelectedElements('right');
      document.getElementById('ribbonAlignMiddle').onclick = () =>
        this.alignSelectedElements('middle');

      // Presentation Theme Switcher
      document.getElementById('themeSelect').onchange = (e) => {
        this.project.theme = e.target.value;
        this.updateDeckTheme();
        this.pushHistory('Change deck theme');
      };

      // Present Buttons
      document.getElementById('btnPresent').onclick = () => this.startPresentation(false);
      document.getElementById('menuPresentAll').onclick = () => this.startPresentation(false);
      document.getElementById('menuPresentCurrent').onclick = () => this.startPresentation(true);

      // Presentation HUD
      document.getElementById('btnHudNext').onclick = () => this.advancePresentation();
      document.getElementById('btnHudPrev').onclick = () => this.previousPresentation();
      document.getElementById('btnHudExit').onclick = () => this.exitPresentation();
      document.getElementById('btnHudLaser').onclick = () => {
        this.presentationLaserActive = !this.presentationLaserActive;
        const laser = document.getElementById('presentationLaser');
        if (laser) laser.classList.toggle('active', this.presentationLaserActive);
      };
      document.getElementById('btnHudNotes').onclick = () => {
        const p = document.getElementById('hudNotesPopup');
        p.style.display = p.style.display === 'none' ? 'flex' : 'none';
      };
      document.getElementById('btnCloseHudNotes').onclick = () => {
        document.getElementById('hudNotesPopup').style.display = 'none';
      };

      // Zoom Controls
      document.getElementById('btnZoomFit').onclick = () => {
        this.autoFitZoom = true;
        this.fitCanvasToViewport();
      };
      document.getElementById('menuZoomFit').onclick = () => {
        this.autoFitZoom = true;
        this.fitCanvasToViewport();
      };
      document.getElementById('btnZoomIn').onclick = () => this.setCustomZoom(this.zoom + 0.15);
      document.getElementById('btnZoomOut').onclick = () => this.setCustomZoom(this.zoom - 0.15);
      document.getElementById('zoomSlider').oninput = (e) => {
        this.setCustomZoom(parseInt(e.target.value, 10) / 100);
      };

      // Speaker Notes Drawer Toggle
      const toggleNotesDrawer = () => {
        const drawer = document.getElementById('speakerNotesDrawer');
        const btn = document.getElementById('btnToggleNotesDrawer');
        if (!drawer) return;
        drawer.classList.toggle('collapsed');
        if (btn) btn.textContent = drawer.classList.contains('collapsed') ? '▲ Expand' : '▼ Collapse';
      };

      document.getElementById('notesDrawerHeader').onclick = toggleNotesDrawer;
      document.getElementById('ribbonToggleNotes').onclick = toggleNotesDrawer;
      document.getElementById('menuToggleNotes').onclick = toggleNotesDrawer;

      document.getElementById('slideNotesInput').oninput = (e) => {
        const slide = this.getCurrentSlide();
        if (slide) {
          slide.notes = e.target.value;
          document.getElementById('notesCharCount').textContent = `${slide.notes.length} characters`;
          this.triggerAutosave();
        }
      };

      // Inspector Tabs Switching
      document.querySelectorAll('.inspector-tab').forEach((tab) => {
        tab.onclick = () => {
          document.querySelectorAll('.inspector-tab').forEach((t) => t.classList.remove('active'));
          document.querySelectorAll('.inspector-pane').forEach((p) => p.classList.remove('active'));

          tab.classList.add('active');
          const targetPane = document.getElementById(
            `pane${tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)}`
          );
          if (targetPane) targetPane.classList.add('active');
        };
      });

      // Inspector Property Controls
      this.bindInspectorPropertyInputs();

      // Modals Close handlers
      document.querySelectorAll('[data-close]').forEach((btn) => {
        btn.onclick = () => {
          const mId = btn.dataset.close;
          const m = document.getElementById(mId);
          if (m) m.style.display = 'none';
        };
      });

      document.querySelectorAll('.modal-backdrop').forEach((m) => {
        m.onclick = (e) => {
          if (e.target === m) m.style.display = 'none';
        };
      });

      // Keyboard Shortcuts Dialog
      document.getElementById('btnShortcutsHelp').onclick = () => {
        document.getElementById('modalShortcuts').style.display = 'flex';
      };
      document.getElementById('btnAboutApp').onclick = () => {
        alert(
          'SlideCraft Studio v1.0\nProfessional PowerPoint-Style Presentation Editor\n100% Client-Side HTML5 / CSS3 / Vanilla JavaScript.'
        );
      };

      // Global Keyboard Shortcuts
      window.addEventListener('keydown', (e) => {
        // If typing in an input or contentEditable, do not hijack normal typing
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
          if (e.key === 'Escape') e.target.blur();
          return;
        }

        if (e.ctrlKey || e.metaKey) {
          if (e.key === 'z') {
            e.preventDefault();
            this.undo();
          } else if (e.key === 'y' || (e.shiftKey && e.key === 'Z')) {
            e.preventDefault();
            this.redo();
          } else if (e.key === 's') {
            e.preventDefault();
            this.storage.saveProject(this.project);
            this.showToast('Saved to browser storage', 'success');
          } else if (e.key === 'd') {
            e.preventDefault();
            this.duplicateSelectedElements();
          } else if (e.key === 'a') {
            e.preventDefault();
            const slide = this.getCurrentSlide();
            if (slide) {
              this.selectedElementIds = (slide.elements || []).map((el) => el.id);
              this.updateSelectionGizmo();
              this.renderInspector();
              this.updateStatusBar();
            }
          }
        } else if (e.key === 'F5') {
          e.preventDefault();
          this.startPresentation(e.shiftKey);
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          if (this.selectedElementIds.length > 0) {
            e.preventDefault();
            this.deleteSelectedElements();
          }
        } else if (e.key.startsWith('Arrow')) {
          // Nudge selected elements
          if (this.selectedElementIds.length > 0) {
            e.preventDefault();
            const step = e.shiftKey ? 10 : 1;
            const slide = this.getCurrentSlide();
            if (!slide) return;

            slide.elements.forEach((el) => {
              if (this.selectedElementIds.includes(el.id)) {
                if (e.key === 'ArrowLeft') el.x -= step;
                if (e.key === 'ArrowRight') el.x += step;
                if (e.key === 'ArrowUp') el.y -= step;
                if (e.key === 'ArrowDown') el.y += step;
              }
            });

            this.renderCanvas();
            this.populateElementInspectorLive();
            this.pushHistory('Nudge');
          }
        }
      });

      this.bindCanvasPointerEvents();
    }

    bindInspectorPropertyInputs() {
      const slide = () => this.getCurrentSlide();

      // Slide Background Type
      document.getElementById('slideBgTypeSelect').onchange = (e) => {
        const s = slide();
        if (!s) return;
        s.background.type = e.target.value;
        this.renderCanvas();
        this.renderInspector();
        this.renderThumbnails();
        this.pushHistory('Change background fill');
      };

      // Slide Color 1
      const updateColor1 = (c) => {
        const s = slide();
        if (!s) return;
        s.background.color1 = c;
        this.renderCanvas();
        this.renderThumbnails();
        this.pushHistory('Change background color');
      };
      document.getElementById('slideBgColor1').oninput = (e) => updateColor1(e.target.value);
      document.getElementById('slideBgColor1Text').onchange = (e) => updateColor1(e.target.value);

      // Slide Color 2
      const updateColor2 = (c) => {
        const s = slide();
        if (!s) return;
        s.background.color2 = c;
        this.renderCanvas();
        this.renderThumbnails();
        this.pushHistory('Change background gradient color');
      };
      document.getElementById('slideBgColor2').oninput = (e) => updateColor2(e.target.value);
      document.getElementById('slideBgColor2Text').onchange = (e) => updateColor2(e.target.value);

      // Slide Angle
      document.getElementById('slideBgAngle').oninput = (e) => {
        const s = slide();
        if (!s) return;
        s.background.angle = parseInt(e.target.value, 10);
        document.getElementById('slideBgAngleVal').textContent = `${s.background.angle}°`;
        this.renderCanvas();
        this.renderThumbnails();
      };
      document.getElementById('slideBgAngle').onchange = () => {
        this.pushHistory('Change gradient angle');
      };

      // Background Swatches
      document.querySelectorAll('.color-swatch').forEach((sw) => {
        sw.onclick = () => {
          const s = slide();
          if (!s) return;
          s.background.type = sw.dataset.bg;
          s.background.color1 = sw.dataset.c1;
          if (sw.dataset.c2) s.background.color2 = sw.dataset.c2;
          if (sw.dataset.angle) s.background.angle = parseInt(sw.dataset.angle, 10);
          this.renderCanvas();
          this.renderInspector();
          this.renderThumbnails();
          this.pushHistory('Apply background preset');
        };
      });

      // Element Transform inputs
      const getActiveEl = () => {
        const s = slide();
        return s ? s.elements.find((e) => e.id === this.selectedElementIds[0]) : null;
      };

      const bindNumberProp = (id, prop) => {
        const input = document.getElementById(id);
        if (!input) return;
        input.onchange = (e) => {
          const el = getActiveEl();
          if (el) {
            el[prop] = parseFloat(e.target.value) || 0;
            this.renderCanvas();
            this.renderThumbnails();
            this.pushHistory(`Update ${prop}`);
          }
        };
      };

      bindNumberProp('propX', 'x');
      bindNumberProp('propY', 'y');
      bindNumberProp('propWidth', 'width');
      bindNumberProp('propHeight', 'height');
      bindNumberProp('propRotation', 'rotation');

      document.getElementById('propOpacity').onchange = (e) => {
        const el = getActiveEl();
        if (el) {
          el.opacity = Math.max(0, Math.min(1, parseInt(e.target.value, 10) / 100));
          this.renderCanvas();
          this.renderThumbnails();
          this.pushHistory('Update opacity');
        }
      };

      // Text Formatting
      document.getElementById('propFontFamily').onchange = (e) => {
        const el = getActiveEl();
        if (el) {
          el.fontFamily = e.target.value;
          this.renderCanvas();
          this.pushHistory('Update font family');
        }
      };

      document.getElementById('propFontSize').onchange = (e) => {
        const el = getActiveEl();
        if (el) {
          el.fontSize = parseInt(e.target.value, 10);
          this.renderCanvas();
          this.pushHistory('Update font size');
        }
      };

      document.getElementById('btnBold').onclick = () => {
        const el = getActiveEl();
        if (el) {
          el.fontWeight = el.fontWeight === '700' ? '400' : '700';
          this.renderCanvas();
          this.renderInspector();
          this.pushHistory('Toggle bold');
        }
      };

      document.getElementById('btnItalic').onclick = () => {
        const el = getActiveEl();
        if (el) {
          el.fontStyle = el.fontStyle === 'italic' ? 'normal' : 'italic';
          this.renderCanvas();
          this.renderInspector();
          this.pushHistory('Toggle italic');
        }
      };

      document.getElementById('btnUnderline').onclick = () => {
        const el = getActiveEl();
        if (el) {
          el.textDecoration = el.textDecoration === 'underline' ? 'none' : 'underline';
          this.renderCanvas();
          this.renderInspector();
          this.pushHistory('Toggle underline');
        }
      };

      const setTextAlign = (align) => {
        const el = getActiveEl();
        if (el) {
          el.textAlign = align;
          this.renderCanvas();
          this.renderInspector();
          this.pushHistory('Text align');
        }
      };
      document.getElementById('btnAlignLeft').onclick = () => setTextAlign('left');
      document.getElementById('btnAlignCenter').onclick = () => setTextAlign('center');
      document.getElementById('btnAlignRight').onclick = () => setTextAlign('right');

      document.getElementById('propTextColor').oninput = (e) => {
        const el = getActiveEl();
        if (el) {
          el.color = e.target.value;
          this.renderCanvas();
        }
      };
      document.getElementById('propTextColor').onchange = () => this.pushHistory('Text color');

      // Shape Styling
      document.getElementById('propShapeFill').oninput = (e) => {
        const el = getActiveEl();
        if (el) {
          el.fill = e.target.value;
          this.renderCanvas();
        }
      };
      document.getElementById('propShapeFill').onchange = () => this.pushHistory('Shape fill');

      document.getElementById('propShapeStroke').oninput = (e) => {
        const el = getActiveEl();
        if (el) {
          el.stroke = e.target.value;
          this.renderCanvas();
        }
      };
      document.getElementById('propShapeStroke').onchange = () => this.pushHistory('Shape stroke');

      document.getElementById('propStrokeWidth').onchange = (e) => {
        const el = getActiveEl();
        if (el) {
          el.strokeWidth = parseInt(e.target.value, 10);
          this.renderCanvas();
          this.pushHistory('Stroke width');
        }
      };

      document.getElementById('propCornerRadius').onchange = (e) => {
        const el = getActiveEl();
        if (el) {
          el.cornerRadius = parseInt(e.target.value, 10);
          this.renderCanvas();
          this.pushHistory('Corner radius');
        }
      };

      // Arrange in inspector
      document.getElementById('btnBringForwardProp').onclick = () => this.changeZOrder('forward');
      document.getElementById('btnSendBackwardProp').onclick = () => this.changeZOrder('backward');
      document.getElementById('btnBringToFrontProp').onclick = () => this.changeZOrder('front');
      document.getElementById('btnSendToBackProp').onclick = () => this.changeZOrder('back');
      document.getElementById('btnDuplicateProp').onclick = () => this.duplicateSelectedElements();
      document.getElementById('btnDeleteElementProp').onclick = () => this.deleteSelectedElements();

      // Slide Inspector action buttons
      document.getElementById('btnDuplicateCurrentSlide').onclick = () => this.duplicateCurrentSlide();
      document.getElementById('btnDeleteCurrentSlide').onclick = () => this.deleteCurrentSlide();

      // Transitions Inspector
      document.getElementById('transitionEffectSelect').onchange = (e) => {
        const s = slide();
        if (!s) return;
        if (!s.transition) s.transition = {};
        s.transition.type = e.target.value;
        this.pushHistory('Change slide transition');
      };

      document.getElementById('transitionDuration').oninput = (e) => {
        const s = slide();
        if (!s) return;
        if (!s.transition) s.transition = {};
        s.transition.duration = parseFloat(e.target.value);
        document.getElementById('transitionDurationVal').textContent = `${s.transition.duration}s`;
      };
      document.getElementById('transitionDuration').onchange = () => {
        this.pushHistory('Transition duration');
      };

      document.getElementById('btnApplyTransitionAll').onclick = () => {
        const s = slide();
        if (!s || !s.transition) return;
        this.project.slides.forEach((item) => {
          item.transition = JSON.parse(JSON.stringify(s.transition));
        });
        this.pushHistory('Apply transition to all slides');
        this.showToast('Transition applied to all slides', 'success');
      };

      document.getElementById('btnPreviewTransition').onclick = () => {
        const s = slide();
        if (!s || !s.transition || s.transition.type === 'none') {
          this.showToast('Select a transition effect first', 'info');
          return;
        }
        const canvasEl = document.getElementById('slideCanvas');
        canvasEl.classList.add(`trans-${s.transition.type}-out`);
        setTimeout(() => {
          canvasEl.classList.remove(`trans-${s.transition.type}-out`);
        }, (s.transition.duration || 0.5) * 1000);
      };

      // Animations Inspector
      document.getElementById('animEffectSelect').onchange = (e) => {
        const el = getActiveEl();
        if (el) {
          if (!el.animation) el.animation = {};
          el.animation.type = e.target.value;
          this.populateAnimationsInspector();
          this.pushHistory('Change animation effect');
        }
      };

      document.getElementById('animTriggerSelect').onchange = (e) => {
        const el = getActiveEl();
        if (el) {
          if (!el.animation) el.animation = {};
          el.animation.trigger = e.target.value;
          this.pushHistory('Change animation trigger');
        }
      };

      document.getElementById('animDuration').oninput = (e) => {
        const el = getActiveEl();
        if (el) {
          if (!el.animation) el.animation = {};
          el.animation.duration = parseFloat(e.target.value);
          document.getElementById('animDurationVal').textContent = `${el.animation.duration}s`;
        }
      };
      document.getElementById('animDuration').onchange = () => this.pushHistory('Animation duration');

      document.getElementById('btnPreviewAnim').onclick = () => {
        const el = getActiveEl();
        if (!el || !el.animation || el.animation.type === 'none') return;
        const dom = document.getElementById(`canvas_el_${el.id}`);
        if (dom) {
          dom.classList.remove(`anim-${el.animation.type}`);
          void dom.offsetWidth; // Reflow
          dom.classList.add(`anim-${el.animation.type}`);
          dom.style.setProperty('--anim-duration', `${el.animation.duration}s`);
        }
      };

      document.getElementById('btnRemoveAnim').onclick = () => {
        const el = getActiveEl();
        if (el) {
          el.animation = { type: 'none' };
          this.populateAnimationsInspector();
          this.pushHistory('Remove animation');
        }
      };
    }

    // -----------------------------------------------------------------------
    // NOTIFICATIONS & TOASTS
    // -----------------------------------------------------------------------
    showToast(message, type = 'info') {
      const container = document.getElementById('toastContainer');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.textContent = message;

      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  }

  // =========================================================================
  // INITIALIZE APP ON DOM READY
  // =========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    const app = new SlideCraftApp();
    app.init();
    window.SlideCraft = app; // Expose for testing & console interaction
  });
})();
