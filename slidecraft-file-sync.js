/**
 * SlideCraft Studio - Custom File Synchronizer & PowerPoint Integration Module
 *
 * Provides:
 * 1. .slidecraft custom file format validation and serialization
 * 2. HTML5 File System Access API real-time local file auto-save (showSaveFilePicker, showOpenFilePicker)
 * 3. Fallback mechanisms (Blob download / localStorage / hidden input) for unsupported browsers
 * 4. PowerPoint (.pptx) conversion and export using PptxGenJS
 */

import pptxgen from 'pptxgenjs';

export const SLIDECRAFT_SCHEMA_VERSION = '1.0.0';
export const SLIDECRAFT_FILE_EXTENSION = '.slidecraft';
export const SLIDECRAFT_MIME_TYPE = 'application/x-slidecraft+json';

/**
 * Validates and serializes a presentation into the official .slidecraft schema
 * @param {Object} projectData - The presentation data object
 * @returns {string} Formatted JSON string conforming to .slidecraft schema
 */
export function serializeSlideCraft(projectData) {
  if (!projectData) {
    throw new Error('Invalid presentation data provided for serialization.');
  }

  const documentSchema = {
    $schema: 'https://slidecraft.studio/schemas/v1/slidecraft.json',
    format: 'slidecraft',
    version: SLIDECRAFT_SCHEMA_VERSION,
    generator: 'SlideCraft Studio v1.0',
    id: projectData.id || `proj_${Date.now()}`,
    title: projectData.title || 'Untitled Presentation',
    theme: projectData.theme || 'modern-dark',
    createdAt: projectData.createdAt || Date.now(),
    updatedAt: Date.now(),
    canvas: {
      width: 1920,
      height: 1080,
      aspectRatio: '16:9'
    },
    slides: Array.isArray(projectData.slides) ? projectData.slides : [],
    customGuides: projectData.customGuides || { x: [], y: [] }
  };

  return JSON.stringify(documentSchema, null, 2);
}

/**
 * Parses and verifies a .slidecraft or .json file payload
 * @param {string} fileContent - Raw JSON string content
 * @returns {Object} Validated presentation object
 */
export function parseSlideCraft(fileContent) {
  try {
    const parsed = JSON.parse(fileContent);

    // Standardize object structure regardless of whether it's legacy JSON or .slidecraft
    const project = {
      id: parsed.id || `proj_${Date.now()}`,
      title: parsed.title || 'Imported Presentation',
      theme: parsed.theme || 'modern-dark',
      createdAt: parsed.createdAt || Date.now(),
      updatedAt: parsed.updatedAt || Date.now(),
      slides: Array.isArray(parsed.slides) ? parsed.slides : [],
      customGuides: parsed.customGuides || { x: [], y: [] }
    };

    if (project.slides.length === 0) {
      throw new Error('The loaded .slidecraft file does not contain any slides.');
    }

    return project;
  } catch (err) {
    throw new Error(`Failed to parse .slidecraft file: ${err.message}`);
  }
}

/**
 * SlideCraftFileSynchronizer
 * Manages native File System Access handles, real-time debounced auto-saves,
 * file opening, fallbacks, and PPTX generation.
 */
export class SlideCraftFileSynchronizer {
  constructor(options = {}) {
    this.fileHandle = null;
    this.fileName = null;
    this.debounceTimeout = null;
    this.isSaving = false;
    this.onStatusChange = options.onStatusChange || (() => {});
    this.onToast = options.onToast || (() => {});
  }

  /**
   * Checks whether the current browser supports HTML5 File System Access API
   * @returns {boolean}
   */
  isFileSystemAccessSupported() {
    return (
      typeof window !== 'undefined' &&
      'showSaveFilePicker' in window &&
      'showOpenFilePicker' in window
    );
  }

  /**
   * Verifies or requests readwrite permission for an existing file handle
   * @param {FileSystemFileHandle} fileHandle
   * @returns {Promise<boolean>}
   */
  async verifyPermission(fileHandle) {
    if (!fileHandle) return false;
    const opts = { mode: 'readwrite' };
    if ((await fileHandle.queryPermission(opts)) === 'granted') {
      return true;
    }
    if ((await fileHandle.requestPermission(opts)) === 'granted') {
      return true;
    }
    return false;
  }

  /**
   * Prompts user to pick a location and save a new .slidecraft file
   * @param {string} title - Suggested file name title
   * @param {Object} projectData - Presentation data to write
   * @returns {Promise<{success: boolean, name: string, handle: FileSystemFileHandle|null}>}
   */
  async createNewSlideCraftFile(title, projectData) {
    const sanitizedTitle = (title || 'presentation')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');
    const suggestedName = `${sanitizedTitle}${SLIDECRAFT_FILE_EXTENSION}`;

    if (this.isFileSystemAccessSupported()) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName,
          types: [
            {
              description: 'SlideCraft Presentation (*.slidecraft)',
              accept: {
                [SLIDECRAFT_MIME_TYPE]: [SLIDECRAFT_FILE_EXTENSION],
                'application/json': ['.json']
              }
            }
          ]
        });

        this.fileHandle = handle;
        this.fileName = handle.name;

        // Perform initial write
        await this.saveToLocalFile(projectData);
        this.onToast(`Linked to local file "${this.fileName}"`, 'success');
        return { success: true, name: this.fileName, handle };
      } catch (err) {
        if (err.name === 'AbortError') {
          return { success: false, aborted: true };
        }
        console.warn('File System Access API failed, falling back to download:', err);
      }
    }

    // Fallback: Trigger standard browser file download
    this.downloadFallback(suggestedName, projectData);
    this.fileName = suggestedName;
    this.fileHandle = null;
    this.onToast(`Downloaded "${suggestedName}" (Browser fallback)`, 'info');
    return { success: true, name: suggestedName, handle: null, fallback: true };
  }

  /**
   * Saves presentation data to the currently linked file handle
   * @param {Object} projectData
   * @returns {Promise<boolean>}
   */
  async saveToLocalFile(projectData) {
    if (!projectData) return false;

    if (this.fileHandle && this.isFileSystemAccessSupported()) {
      try {
        this.isSaving = true;
        this.onStatusChange({
          status: 'syncing',
          text: `Syncing to ${this.fileName}...`,
          fileName: this.fileName
        });

        const hasPerm = await this.verifyPermission(this.fileHandle);
        if (!hasPerm) {
          throw new Error('Permission denied to write to local file.');
        }

        const writable = await this.fileHandle.createWritable();
        const content = serializeSlideCraft(projectData);
        await writable.write(content);
        await writable.close();

        this.isSaving = false;
        const timeStr = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
        this.onStatusChange({
          status: 'synced',
          text: `Synced to ${this.fileName} (${timeStr})`,
          fileName: this.fileName
        });
        return true;
      } catch (err) {
        this.isSaving = false;
        console.error('saveToLocalFile error:', err);
        this.onStatusChange({
          status: 'error',
          text: `Sync failed (${err.message})`,
          fileName: this.fileName
        });
        return false;
      }
    }

    // Fallback: Store snapshot in localStorage if handle is not linked
    try {
      localStorage.setItem('slidecraft_last_autosave', serializeSlideCraft(projectData));
      this.onStatusChange({
        status: 'saved',
        text: 'Saved locally in browser storage',
        fileName: null
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Debounced auto-save listener that triggers after user input stops
   * @param {Object} projectData - Presentation state
   * @param {number} delayMs - Debounce interval in ms (default 500ms)
   */
  scheduleDebouncedSave(projectData, delayMs = 500) {
    clearTimeout(this.debounceTimeout);
    this.onStatusChange({
      status: 'unsaved',
      text: this.fileName ? `Unsaved changes (${this.fileName})` : 'Unsaved changes',
      fileName: this.fileName
    });

    this.debounceTimeout = setTimeout(async () => {
      await this.saveToLocalFile(projectData);
    }, delayMs);
  }

  /**
   * Opens an existing .slidecraft or .json presentation file from local disk
   * @returns {Promise<{success: boolean, project: Object, name: string}>}
   */
  async openSlideCraftFile() {
    if (this.isFileSystemAccessSupported()) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [
            {
              description: 'SlideCraft Presentation (*.slidecraft, *.json)',
              accept: {
                [SLIDECRAFT_MIME_TYPE]: [SLIDECRAFT_FILE_EXTENSION],
                'application/json': ['.json', SLIDECRAFT_FILE_EXTENSION]
              }
            }
          ],
          multiple: false
        });

        const file = await handle.getFile();
        const text = await file.text();
        const project = parseSlideCraft(text);

        this.fileHandle = handle;
        this.fileName = handle.name;

        this.onToast(`Opened "${this.fileName}"`, 'success');
        this.onStatusChange({
          status: 'synced',
          text: `Linked to ${this.fileName}`,
          fileName: this.fileName
        });

        return { success: true, project, name: this.fileName, handle };
      } catch (err) {
        if (err.name === 'AbortError') {
          return { success: false, aborted: true };
        }
        console.warn('showOpenFilePicker error, attempting fallback:', err);
      }
    }

    // Fallback: Trigger hidden input file picker
    return this.openFileFallback();
  }

  /**
   * Fallback file picker using standard hidden input
   * @returns {Promise<{success: boolean, project: Object, name: string}>}
   */
  openFileFallback() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = `${SLIDECRAFT_FILE_EXTENSION},.json,application/json`;
      input.style.display = 'none';
      document.body.appendChild(input);

      input.onchange = async () => {
        const file = input.files && input.files[0];
        input.remove();
        if (!file) {
          resolve({ success: false, aborted: true });
          return;
        }

        try {
          const text = await file.text();
          const project = parseSlideCraft(text);
          this.fileHandle = null;
          this.fileName = file.name;
          this.onToast(`Loaded "${file.name}" (Browser fallback)`, 'success');
          resolve({ success: true, project, name: file.name, handle: null });
        } catch (err) {
          reject(err);
        }
      };

      input.oncancel = () => {
        input.remove();
        resolve({ success: false, aborted: true });
      };

      input.click();
    });
  }

  /**
   * Fallback download trigger using Blob & anchor tag
   * @param {string} fileName
   * @param {Object} projectData
   */
  downloadFallback(fileName, projectData) {
    const serialized = serializeSlideCraft(projectData);
    const blob = new Blob([serialized], { type: SLIDECRAFT_MIME_TYPE });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith(SLIDECRAFT_FILE_EXTENSION)
      ? fileName
      : `${fileName}${SLIDECRAFT_FILE_EXTENSION}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Detaches the currently linked file handle (unlinks local file)
   */
  unlinkLocalFile() {
    this.fileHandle = null;
    this.fileName = null;
    this.onStatusChange({
      status: 'saved',
      text: 'Saved in browser storage (Not linked to file)',
      fileName: null
    });
  }

  /**
   * Converts and exports the current SlideCraft presentation as a PowerPoint (.pptx) file
   * @param {Object} projectData
   * @returns {Promise<boolean>}
   */
  async exportToPowerPoint(projectData) {
    if (!projectData || !Array.isArray(projectData.slides) || projectData.slides.length === 0) {
      throw new Error('No slides available to export.');
    }

    this.onToast('Generating PowerPoint (.pptx) presentation...', 'info');

    // Initialize PptxGenJS instance
    const pres = new pptxgen();
    pres.layout = 'LAYOUT_16x9';
    pres.title = projectData.title || 'SlideCraft Presentation';
    pres.author = 'SlideCraft Studio';

    // 16:9 Widescreen dimensions in inches for PptxGenJS
    const PPTX_WIDTH_INCHES = 10.0;
    const PPTX_HEIGHT_INCHES = 5.625;

    // Helper functions for logical pixel (1920x1080) to inch conversions
    const pxToXInch = (px) => Math.max(0, (px / 1920) * PPTX_WIDTH_INCHES);
    const pxToYInch = (py) => Math.max(0, (py / 1080) * PPTX_HEIGHT_INCHES);
    const pxToWInch = (pw) => Math.max(0.1, (pw / 1920) * PPTX_WIDTH_INCHES);
    const pxToHInch = (ph) => Math.max(0.1, (ph / 1080) * PPTX_HEIGHT_INCHES);
    const cleanHex = (hex, fallback = '0F172A') => {
      if (!hex || typeof hex !== 'string') return fallback;
      const clean = hex.replace('#', '').trim();
      return clean.length === 6 ? clean.toUpperCase() : fallback;
    };

    for (const slideData of projectData.slides) {
      const pptxSlide = pres.addSlide();

      // 1. Background
      if (slideData.background) {
        const bg = slideData.background;
        if (bg.type === 'solid' && bg.color1) {
          pptxSlide.background = { color: cleanHex(bg.color1) };
        } else if (bg.type === 'gradient-linear' || bg.type === 'gradient-radial') {
          // PPTX fallback to primary gradient color
          pptxSlide.background = { color: cleanHex(bg.color1 || '#0F172A') };
        } else if (bg.type === 'image' && bg.imageUrl) {
          pptxSlide.background = { data: bg.imageUrl };
        } else {
          pptxSlide.background = { color: '0F172A' };
        }
      } else {
        pptxSlide.background = { color: '0F172A' };
      }

      // 2. Speaker Notes
      if (slideData.notes) {
        pptxSlide.addNotes(slideData.notes);
      }

      // 3. Slide Elements
      const elements = Array.isArray(slideData.elements) ? slideData.elements : [];
      // Sort elements by zIndex
      const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

      for (const el of sortedElements) {
        const x = pxToXInch(el.x);
        const y = pxToYInch(el.y);
        const w = pxToWInch(el.width);
        const h = pxToHInch(el.height);
        const rotate = el.rotation || 0;

        if (el.type === 'text') {
          const fontSizePt = Math.max(8, Math.round((el.fontSize || 32) * 0.55));
          const align = el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'right' : 'left';
          const isBold = Boolean(el.fontWeight === 'bold' || el.fontWeight >= 600);
          const isItalic = el.fontStyle === 'italic';
          const isUnderline = el.textDecoration === 'underline';

          pptxSlide.addText(el.content || '', {
            x,
            y,
            w,
            h,
            fontSize: fontSizePt,
            fontFace: el.fontFamily ? el.fontFamily.split(',')[0].replace(/['"]/g, '').trim() : 'Arial',
            color: cleanHex(el.color, 'FFFFFF'),
            bold: isBold,
            italic: isItalic,
            underline: isUnderline,
            align,
            valign: 'top',
            rotate,
            margin: 0
          });
        } else if (el.type === 'shape') {
          let shapeType = pres.ShapeType.rect;
          if (el.shapeType === 'circle') shapeType = pres.ShapeType.ellipse;
          else if (el.shapeType === 'rounded-rect') shapeType = pres.ShapeType.roundRect;
          else if (el.shapeType === 'triangle') shapeType = pres.ShapeType.triangle;
          else if (el.shapeType === 'arrow') shapeType = pres.ShapeType.rightArrow;
          else if (el.shapeType === 'line') shapeType = pres.ShapeType.line;
          else if (el.shapeType === 'callout') shapeType = pres.ShapeType.wedgeRectCallout;

          const shapeOptions = {
            x,
            y,
            w,
            h,
            rotate
          };

          if (el.fill && el.fill !== 'transparent') {
            shapeOptions.fill = { color: cleanHex(el.fill, '4F46E5') };
          }
          if (el.stroke && el.strokeWidth) {
            shapeOptions.line = {
              color: cleanHex(el.stroke, '6366F1'),
              width: Math.max(1, Math.round((el.strokeWidth || 2) * 0.75))
            };
          }

          pptxSlide.addShape(shapeType, shapeOptions);
        } else if (el.type === 'image' && el.src) {
          try {
            pptxSlide.addImage({
              data: el.src,
              x,
              y,
              w,
              h,
              rotate
            });
          } catch (imgErr) {
            console.warn('Failed to embed image into PPTX:', imgErr);
          }
        }
      }
    }

    const pptxFileName = `${(projectData.title || 'presentation')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')}.pptx`;

    await pres.writeFile({ fileName: pptxFileName });
    this.onToast(`Exported "${pptxFileName}" for PowerPoint!`, 'success');
    return true;
  }
}
