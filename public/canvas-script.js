// Canvas initialization and drawing logic
class CanvasManager {
    constructor() {
        this.urlParams = new URLSearchParams(window.location.search);
        this.init();
    }

    init() {
        this.setupCanvases();
        this.setupDrawingState();
        this.setupUI();
        this.setupEventListeners();
        this.setupTabs();
        this.applyToolbarPosition();
        this.drawBackgroundColor();
        this.loadBackgroundImage();
        this.drawGrid();
    }

    setupCanvases() {
        this.drawingCanvas = document.getElementById('drawingCanvas');
        this.bgColorCanvas = document.getElementById('bgColorCanvas');
        this.bgImageCanvas = document.getElementById('bgImageCanvas');
        this.gridCanvas = document.getElementById('gridCanvas');

        this.drawingCtx = this.drawingCanvas.getContext('2d');
        this.bgColorCtx = this.bgColorCanvas.getContext('2d');
        this.bgImageCtx = this.bgImageCanvas.getContext('2d');
        this.gridCtx = this.gridCanvas.getContext('2d');

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    setupDrawingState() {
        this.isDrawing = false;
        this.currentColor = '#ffffff';
        this.currentSize = parseInt(this.urlParams.get('brushSize') || '5');
        this.currentTool = 'pencil';

        // Undo/Redo state
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoSteps = 50;

        // Bg Image state
        this.bgOpacity = parseInt(this.urlParams.get('bgOpacity') || '50') / 100;
        this.bgImageSize = parseInt(this.urlParams.get('bgImageSize') || '100');
        this.bgColor = this.urlParams.get('bgColor')?.replace("%23", "#") || '#ffffff';
        this.bgImagePosition = {
            x: parseInt(this.urlParams.get('bgImagePosX') || '50'),
            y: parseInt(this.urlParams.get('bgImagePosY') || '50')
        };
        this.isColoringBookImage = this.urlParams.get('isColoringBookImage') === 'true';

        // Grid state
        this.gridEnabled = this.urlParams.get('gridEnabled') === 'true';
        this.gridColor = this.urlParams.get('gridColor')?.replace("%23", "#") || '#cccccc';
        this.gridOpacity = parseInt(this.urlParams.get('gridOpacity') || '30') / 100;
        this.gridStyle = this.urlParams.get('gridStyle') || 'solid';
        this.gridCellSize = parseInt(this.urlParams.get('gridSize') || '20');

        // Toolbar position
        this.toolbarPosition = this.urlParams.get('toolbarPosition') || 'up';
        this.hideToolbar = this.urlParams.get('hideToolbar') === 'true';

        // Show inputs configuration
        this.setupShowInputs();

        // Available colors
        this.defaultColors = ['#000000', '#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
        this.setupAvailableColors();
    }

    setupShowInputs() {
        const showInputsParam = this.urlParams.get('showInputs');
        const defaultShowInputs = {
            eraserInput: true,
            cursorSizeInput: true,
            backgroundInputs: true,
            gridInputs: true,
            enableUndoRedoInput: true
        };

        if (showInputsParam) {
            try {
                const parsedInputs = JSON.parse(showInputsParam);
                this.showInputs = { ...defaultShowInputs, ...parsedInputs };
            } catch (e) {
                this.showInputs = defaultShowInputs;
            }
        } else {
            this.showInputs = defaultShowInputs;
        }
    }

    setupAvailableColors() {
        const colorsParam = this.urlParams.get('colors');

        if (colorsParam === '*') {
            this.availableColors = this.defaultColors;
        } else if (colorsParam) {
            this.availableColors = colorsParam.split(',').map(c => c.trim());
        } else {
            this.availableColors = this.defaultColors;
        }
    }

    setupUI() {
        this.setupColorButtons();
        this.setupToolButtons();
        this.setupSliders();
        this.setupGridControls();
        this.setupUndoRedo();

        // Apply hideToolbar setting
        if (this.hideToolbar) {
            this.hideToolbarUI();
        }
    }

    hideToolbarUI() {
        const toolbar = document.getElementById('toolbar');
        if (toolbar) {
            toolbar.style.display = 'none';
        }
    }

    setupTabs() {
        this.generalTab = document.getElementById('generalTab');
        this.backgroundTab = document.getElementById('backgroundTab');
        this.gridTab = document.getElementById('gridTab');

        this.generalContent = document.getElementById('generalContent');
        this.backgroundContent = document.getElementById('backgroundContent');
        this.gridContent = document.getElementById('gridContent');

        this.generalTab.onclick = () => this.switchTab('general');

        if (this.showInputs.backgroundInputs) {
            this.backgroundTab.onclick = () => this.switchTab('background');
        } else {
            this.backgroundTab.style.display = 'none';
        }

        if (this.showInputs.gridInputs) {
            this.gridTab.onclick = () => this.switchTab('grid');
        } else {
            this.gridTab.style.display = 'none';
        }

        this.switchTab('general');
    }

    switchTab(tabName) {
        [this.generalTab, this.backgroundTab, this.gridTab].forEach(tab => {
            if (tab.style.display !== 'none') {
                tab.classList.remove('text-primary', 'border-b-2', 'border-primary', 'border-r-2');
                tab.classList.add('text-muted-foreground');
            }
        });

        [this.generalContent, this.backgroundContent, this.gridContent].forEach(content => {
            content.classList.add('hidden');
        });

        const isVertical = this.toolbarPosition === 'left' || this.toolbarPosition === 'right';
        const borderClass = isVertical ? 'border-b-2' : 'border-b-2';

        switch(tabName) {
            case 'general':
                this.generalTab.classList.add('text-primary', borderClass, 'border-primary');
                this.generalTab.classList.remove('text-muted-foreground');
                this.generalContent.classList.remove('hidden');
                if (isVertical) {
                    this.generalContent.classList.add('flex', 'flex-col');
                }
                break;
            case 'background':
                if (this.showInputs.backgroundInputs) {
                    this.backgroundTab.classList.add('text-primary', borderClass, 'border-primary');
                    this.backgroundTab.classList.remove('text-muted-foreground');
                    this.backgroundContent.classList.remove('hidden');
                    if (isVertical) {
                        this.backgroundContent.classList.add('flex', 'flex-col');
                    }
                }
                break;
            case 'grid':
                if (this.showInputs.gridInputs) {
                    this.gridTab.classList.add('text-primary', borderClass, 'border-primary');
                    this.gridTab.classList.remove('text-muted-foreground');
                    this.gridContent.classList.remove('hidden');
                    if (isVertical) {
                        this.gridContent.classList.add('flex', 'flex-col');
                    }
                }
                break;
        }
    }

    applyToolbarPosition() {
        const toolbar = document.getElementById('toolbar');
        const tabContent = document.getElementById('tabContent');
        const tabNavigation = document.getElementById('tabNavigation');

        // Remove all position and orientation classes
        toolbar.classList.remove('top-4', 'bottom-4', 'left-4', 'right-4', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2', 'max-w-[95vw]', 'max-h-[95vh]', 'w-auto', 'h-auto');
        tabNavigation.classList.remove('flex-col', 'border-b', 'border-r');
        tabContent.classList.remove('px-4', 'py-3', 'px-3', 'py-4');

        switch(this.toolbarPosition) {
            case 'up':
                toolbar.classList.add('top-4', 'left-1/2', 'transform', '-translate-x-1/2', 'max-w-[95vw]', 'w-full');
                tabNavigation.classList.add('border-b');
                tabContent.classList.add('px-4', 'py-3');
                break;
            case 'down':
                toolbar.classList.add('bottom-4', 'left-1/2', 'transform', '-translate-x-1/2', 'max-w-[95vw]', 'w-full');
                tabNavigation.classList.add('border-b');
                tabContent.classList.add('px-4', 'py-3');
                break;
            case 'left':
                toolbar.classList.add('left-4', 'top-1/2', 'transform', '-translate-y-1/2', 'max-h-[95vh]', 'h-full');
                tabNavigation.classList.add('flex-row', 'border-b');
                tabContent.classList.add('px-3', 'py-4');
                break;
            case 'right':
                toolbar.classList.add('right-4', 'top-1/2', 'transform', '-translate-y-1/2', 'max-h-[95vh]', 'h-full');
                tabNavigation.classList.add('flex-row', 'border-b');
                tabContent.classList.add('px-3', 'py-4');
                break;
        }
    }

    setupColorButtons() {
        const colorPicker = document.getElementById('colorPicker');
        const toolDiv = document.getElementById('toolDiv');

        const colorButtons = document.getElementById('colorButtons');
        colorButtons.innerHTML = '';
        this.selectedColorButton = null;

        switch(this.toolbarPosition) {
            case 'up':
            case 'down':
                colorPicker.classList.add("flex-row")
                colorButtons.classList.add("grid", "grid-rows-2", "grid-flow-col");
                toolDiv.classList.add("grid", "grid-rows-2", "grid-flow-col");
                break;
            case 'left':
            case 'right':
                colorButtons.classList.add("grid", "grid-cols-2");
                toolDiv.classList.add("grid", "grid-cols-2");
                break;
        }

        this.availableColors.forEach((color, index) => {
            const btn = document.createElement('button');
            btn.className = 'w-8 h-8 rounded-lg border-2 border-border hover:scale-110 transition-transform';
            btn.style.backgroundColor = color;
            btn.onclick = () => this.selectColor(color, btn);

            // Set initial selection
            if (index === 0) {
                btn.classList.add('ring-2', 'ring-primary');
                this.selectedColorButton = btn;
                this.currentColor = color;
            }

            colorButtons.appendChild(btn);
        });
    }

    selectColor(color, button) {
        // Remove ring from previously selected button
        if (this.selectedColorButton) {
            this.selectedColorButton.classList.remove('ring-2', 'ring-primary');
        }

        // Add ring to newly selected button
        button.classList.add('ring-2', 'ring-primary');
        this.selectedColorButton = button;

        this.currentColor = color;
        this.currentTool = 'pencil';
        this.updateToolButtons();
    }

    setupToolButtons() {
        this.pencilBtn = document.getElementById('pencilBtn');
        this.eraserBtn = document.getElementById('eraserBtn');

        // Show/hide eraser based on showInputs
        if (this.showInputs.eraserInput) {
            this.eraserBtn.classList.remove('hidden');
        } else {
            this.eraserBtn.classList.add('hidden');
        }

        this.pencilBtn.onclick = () => {
            this.currentTool = 'pencil';
            this.updateToolButtons();
        };

        this.eraserBtn.onclick = () => {
            this.currentTool = 'eraser';
            this.updateToolButtons();
        };

        this.updateToolButtons();
    }

    updateToolButtons() {
        if (this.currentTool === 'pencil') {
            this.pencilBtn.classList.add('bg-primary', 'text-primary-foreground');
            this.pencilBtn.classList.remove('bg-secondary', 'text-secondary-foreground');
            this.eraserBtn.classList.remove('bg-primary', 'text-primary-foreground');
            this.eraserBtn.classList.add('bg-secondary', 'text-secondary-foreground');
        } else {
            this.eraserBtn.classList.add('bg-primary', 'text-primary-foreground');
            this.eraserBtn.classList.remove('bg-secondary', 'text-secondary-foreground');
            this.pencilBtn.classList.remove('bg-primary', 'text-primary-foreground');
            this.pencilBtn.classList.add('bg-secondary', 'text-secondary-foreground');
        }
    }

    setupUndoRedo() {
        this.undoBtn = document.getElementById('undoBtn');
        this.redoBtn = document.getElementById('redoBtn');
        this.undoRedoControls = document.getElementById('undoRedoControls');

        // Show/hide undo/redo based on showInputs
        if (this.showInputs.enableUndoRedoInput) {
            this.undoRedoControls.classList.remove('hidden');
        } else {
            this.undoRedoControls.classList.add('hidden');
        }

        this.undoBtn.onclick = () => this.undo();
        this.redoBtn.onclick = () => this.redo();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                if (e.key === 'z') {
                    this.undo();
                }
                if (e.key === 'y') {
                    this.redo();
                }
            }
        });

        this.updateUndoRedoButtons();
    }

    saveState() {
        // Save current canvas state to undo stack
        const imageData = this.drawingCtx.getImageData(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        this.undoStack.push(imageData);

        // Limit stack size
        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }

        // Clear redo stack when new action is performed
        this.redoStack = [];
        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.undoStack.length === 0) return;

        const currentState = this.drawingCtx.getImageData(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        this.redoStack.push(currentState);

        const previousState = this.undoStack.pop();
        this.drawingCtx.putImageData(previousState, 0, 0);

        this.updateUndoRedoButtons();
    }

    redo() {
        if (this.redoStack.length === 0) return;

        const currentState = this.drawingCtx.getImageData(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        this.undoStack.push(currentState);

        const nextState = this.redoStack.pop();
        this.drawingCtx.putImageData(nextState, 0, 0);

        this.updateUndoRedoButtons();
    }

    updateUndoRedoButtons() {
        this.undoBtn.disabled = this.undoStack.length === 0;
        this.redoBtn.disabled = this.redoStack.length === 0;
    }

    setupSliders() {
        // Size slider
        this.sizeSlider = document.getElementById('sizeSlider');
        this.sizeValue = document.getElementById('sizeValue');
        this.sizeSlider.value = this.currentSize;
        this.sizeValue.textContent = this.currentSize;

        // Show/hide size control based on showInputs
        const sizeControl = document.getElementById('sizeControl');
        if (!this.showInputs.cursorSizeInput) {
            sizeControl.classList.add('hidden');
        }

        this.sizeSlider.oninput = () => {
            this.currentSize = parseInt(this.sizeSlider.value);
            this.sizeValue.textContent = this.currentSize;
        };

        // Opacity slider
        this.opacitySlider = document.getElementById('opacitySlider');
        this.opacityValue = document.getElementById('opacityValue');
        this.opacityControl = document.getElementById('opacityControl');

        if (this.urlParams.get('bgImage') && this.showInputs.backgroundInputs) {
            this.opacityControl.classList.remove('hidden');
            this.opacitySlider.value = (this.bgOpacity * 100).toString();
            this.opacityValue.textContent = `${Math.round(this.bgOpacity * 100)}%`;
        }

        this.opacitySlider.oninput = () => {
            this.bgOpacity = parseInt(this.opacitySlider.value) / 100;
            this.opacityValue.textContent = `${this.opacitySlider.value}%`;
            this.loadBackgroundImage();
        };

        // Background size slider
        this.bgSizeSlider = document.getElementById('bgSizeSlider');
        this.bgSizeValue = document.getElementById('bgSizeValue');
        this.bgSizeControl = document.getElementById('bgSizeControl');

        if (this.urlParams.get('bgImage') && this.showInputs.backgroundInputs) {
            this.bgSizeControl.classList.remove('hidden');
            this.bgSizeSlider.value = this.bgImageSize.toString();
            this.bgSizeValue.textContent = `${this.bgImageSize}%`;
        }

        this.bgSizeSlider.oninput = () => {
            this.bgImageSize = parseInt(this.bgSizeSlider.value);
            this.bgSizeValue.textContent = `${this.bgImageSize}%`;
            this.loadBackgroundImage();
        };

        // Background color control
        this.bgColorControl = document.getElementById('bgColorControl');
        this.bgColorPicker = document.getElementById('bgColorPicker');
        if (this.showInputs.backgroundInputs) {
            this.bgColorControl.classList.remove('hidden');
        }
        this.bgColorPicker.value = this.bgColor;

        this.bgColorPicker.oninput = () => {
            this.bgColor = this.bgColorPicker.value;
            this.drawBackgroundColor();
            this.loadBackgroundImage();
        };

        // Background Position X
        this.bgPosXSlider = document.getElementById('bgPosXSlider');
        this.bgPosXValue = document.getElementById('bgPosXValue');
        this.bgPosXControl = document.getElementById('bgPosXControl');

        if (this.urlParams.get('bgImage') && this.showInputs.backgroundInputs) {
            this.bgPosXControl.classList.remove('hidden');
            this.bgPosXSlider.value = this.bgImagePosition.x.toString();
            this.bgPosXValue.textContent = `${this.bgImagePosition.x}%`;
        }

        this.bgPosXSlider.oninput = () => {
            this.bgImagePosition.x = parseInt(this.bgPosXSlider.value);
            this.bgPosXValue.textContent = `${this.bgImagePosition.x}%`;
            this.loadBackgroundImage();
        };

        // Background Position Y
        this.bgPosYSlider = document.getElementById('bgPosYSlider');
        this.bgPosYValue = document.getElementById('bgPosYValue');
        this.bgPosYControl = document.getElementById('bgPosYControl');

        if (this.urlParams.get('bgImage') && this.showInputs.backgroundInputs) {
            this.bgPosYControl.classList.remove('hidden');
            this.bgPosYSlider.value = this.bgImagePosition.y.toString();
            this.bgPosYValue.textContent = `${this.bgImagePosition.y}%`;
        }

        this.bgPosYSlider.oninput = () => {
            this.bgImagePosition.y = parseInt(this.bgPosYSlider.value);
            this.bgPosYValue.textContent = `${this.bgImagePosition.y}%`;
            this.loadBackgroundImage();
        };

        // Clear button
        /*
        const clearBtn = document.getElementById('clearBtn');
        if (this.toolbarPosition === 'left' || this.toolbarPosition === 'right') {
            clearBtn.classList.remove("ml-auto");
            clearBtn.classList.add("mt-auto");
        }
        clearBtn.onclick = () => {
            this.saveState();
            this.drawingCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        };

         */
    }

    setupGridControls() {
        this.gridToggle = document.getElementById('gridToggle');
        this.gridSizeSlider = document.getElementById('gridSize');
        this.gridSizeValue = document.getElementById('gridSizeValue');
        this.gridColorPicker = document.getElementById('gridColor');
        this.gridOpacitySlider = document.getElementById('gridOpacity');
        this.gridOpacityValue = document.getElementById('gridOpacityValue');
        this.gridStyleSelect = document.getElementById('gridStyle');

        // Initialize grid controls
        this.gridToggle.checked = this.gridEnabled;
        this.gridSizeSlider.value = this.gridCellSize.toString();
        this.gridSizeValue.textContent = this.gridCellSize.toString();
        this.gridColorPicker.value = this.gridColor;
        this.gridOpacitySlider.value = (this.gridOpacity * 100).toString();
        this.gridOpacityValue.textContent = `${Math.round(this.gridOpacity * 100)}%`;
        this.gridStyleSelect.value = this.gridStyle;

        // Grid event listeners
        this.gridToggle.onchange = () => {
            this.gridEnabled = this.gridToggle.checked;
            this.drawGrid();
        };

        this.gridSizeSlider.oninput = () => {
            this.gridCellSize = parseInt(this.gridSizeSlider.value);
            this.gridSizeValue.textContent = this.gridCellSize.toString();
            this.drawGrid();
        };

        this.gridColorPicker.oninput = () => {
            this.gridColor = this.gridColorPicker.value;
            this.drawGrid();
        };

        this.gridOpacitySlider.oninput = () => {
            this.gridOpacity = parseInt(this.gridOpacitySlider.value) / 100;
            this.gridOpacityValue.textContent = `${this.gridOpacitySlider.value}%`;
            this.drawGrid();
        };

        this.gridStyleSelect.onchange = () => {
            this.gridStyle = this.gridStyleSelect.value;
            this.drawGrid();
        };

        this.gridToggleDiv = document.getElementById('gridToggleDiv');
        this.gridSizeDiv = document.getElementById('gridSizeDiv');
        this.gridColorDiv = document.getElementById('gridColorDiv');
        this.gridOpacityDiv = document.getElementById('gridOpacityDiv');
        this.gridStyleDiv = document.getElementById('gridStyleDiv');
        if (this.showInputs.gridInputs) {
            this.gridToggleDiv.classList.remove('hidden');
            this.gridSizeDiv.classList.remove('hidden');
            this.gridColorDiv.classList.remove('hidden');
            this.gridOpacityDiv.classList.remove('hidden');
            this.gridStyleDiv.classList.remove('hidden');
        }
    }

    setupEventListeners() {
        // Mouse events
        this.drawingCanvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.drawingCanvas.addEventListener('mousemove', (e) => this.draw(e));
        this.drawingCanvas.addEventListener('mouseup', () => this.stopDrawing());
        this.drawingCanvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events
        this.drawingCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });

        this.drawingCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });

        this.drawingCanvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });
    }

    resizeCanvas() {
        const container = this.drawingCanvas.parentElement;
        this.drawingCanvas.width = container.clientWidth;
        this.drawingCanvas.height = container.clientHeight;
        this.bgColorCanvas.width = container.clientWidth;
        this.bgColorCanvas.height = container.clientHeight;
        this.bgImageCanvas.width = container.clientWidth;
        this.bgImageCanvas.height = container.clientHeight;
        this.gridCanvas.width = container.clientWidth;
        this.gridCanvas.height = container.clientHeight;

        // Draw background color
        this.drawBackgroundColor();

        // Redraw background if exists
        if (this.urlParams.get('bgImage')) {
            this.loadBackgroundImage();
        }

        // Redraw grid if enabled
        if (this.gridEnabled) {
            this.drawGrid();
        }
    }

    drawBackgroundColor() {
        this.bgColorCtx.fillStyle = this.bgColor;
        this.bgColorCtx.fillRect(0, 0, this.bgColorCanvas.width, this.bgColorCanvas.height);
    }

    loadBackgroundImage() {
        const bgImageParam = this.urlParams.get('bgImage');
        if (!bgImageParam) {
            this.bgImageCtx.clearRect(0, 0, this.bgImageCanvas.width, this.bgImageCanvas.height);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            this.bgImageCtx.clearRect(0, 0, this.bgImageCanvas.width, this.bgImageCanvas.height);
            this.bgImageCtx.globalAlpha = this.bgOpacity;

            if (this.isColoringBookImage) {
                this.processColoringBookImage(img);
            } else {
                this.drawRegularBackgroundImage(img);
            }

            this.bgImageCtx.globalAlpha = 1;
        };
        img.src = bgImageParam;
    }

    processColoringBookImage(img) {
        // Create a temporary canvas to process the image
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        tempCanvas.width = img.width;
        tempCanvas.height = img.height;

        // Draw the original image
        tempCtx.drawImage(img, 0, 0);

        // Get image data for processing
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;

        // Process pixels: convert white to transparent, keep other colors as black
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // Check if pixel is "white" (adjust threshold as needed)
            const isWhite = r > 200 && g > 200 && b > 200 && a > 50;

            if (isWhite) {
                // Make white pixels transparent
                data[i + 3] = 0;
            } else {
                // Convert non-white pixels to black
                data[i] = 0;     // R
                data[i + 1] = 0; // G
                data[i + 2] = 0; // B
                // Keep original alpha for non-white pixels
            }
        }

        // Put processed image data back
        tempCtx.putImageData(imageData, 0, 0);

        // Calculate scaling and position
        const scale = Math.max(
            this.bgImageCanvas.width / tempCanvas.width,
            this.bgImageCanvas.height / tempCanvas.height
        ) * (this.bgImageSize / 100);

        const x = (this.bgImageCanvas.width - tempCanvas.width * scale) * (this.bgImagePosition.x / 100);
        const y = (this.bgImageCanvas.height - tempCanvas.height * scale) * (this.bgImagePosition.y / 100);

        // Draw processed image to background canvas
        this.bgImageCtx.drawImage(tempCanvas, x, y, tempCanvas.width * scale, tempCanvas.height * scale);
    }

    drawRegularBackgroundImage(img) {
        // Original background image drawing logic
        const scale = Math.max(
            this.bgImageCanvas.width / img.width,
            this.bgImageCanvas.height / img.height
        ) * (this.bgImageSize / 100);

        const x = (this.bgImageCanvas.width - img.width * scale) * (this.bgImagePosition.x / 100);
        const y = (this.bgImageCanvas.height - img.height * scale) * (this.bgImagePosition.y / 100);

        this.bgImageCtx.drawImage(img, x, y, img.width * scale, img.height * scale);
    }

    drawGrid() {
        this.gridCtx.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);

        if (!this.gridEnabled) return;

        this.gridCtx.strokeStyle = this.gridColor;
        this.gridCtx.globalAlpha = this.gridOpacity;
        this.gridCtx.lineWidth = 1;

        const width = this.gridCanvas.width;
        const height = this.gridCanvas.height;

        switch (this.gridStyle) {
            case 'solid':
                this.drawSolidGrid(width, height);
                break;
            case 'dotted':
                this.drawDottedGrid(width, height);
                break;
            case 'dashed':
                this.drawDashedGrid(width, height);
                break;
            case 'sparse':
                this.drawSparseGrid(width, height);
                break;
        }

        this.gridCtx.globalAlpha = 1;
    }

    drawSolidGrid(width, height) {
        this.gridCtx.beginPath();
        for (let x = 0; x <= width; x += this.gridCellSize) {
            this.gridCtx.moveTo(x, 0);
            this.gridCtx.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += this.gridCellSize) {
            this.gridCtx.moveTo(0, y);
            this.gridCtx.lineTo(width, y);
        }
        this.gridCtx.stroke();
    }

    drawDottedGrid(width, height) {
        this.gridCtx.fillStyle = this.gridColor;
        for (let x = 0; x <= width; x += this.gridCellSize) {
            for (let y = 0; y <= height; y += this.gridCellSize) {
                this.gridCtx.beginPath();
                this.gridCtx.arc(x, y, 1, 0, Math.PI * 2);
                this.gridCtx.fill();
            }
        }
    }

    drawDashedGrid(width, height) {
        const dashLength = 4;
        const gapLength = 4;

        this.gridCtx.setLineDash([dashLength, gapLength]);

        this.gridCtx.beginPath();
        for (let x = 0; x <= width; x += this.gridCellSize) {
            this.gridCtx.moveTo(x, 0);
            this.gridCtx.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += this.gridCellSize) {
            this.gridCtx.moveTo(0, y);
            this.gridCtx.lineTo(width, y);
        }
        this.gridCtx.stroke();

        this.gridCtx.setLineDash([]);
    }

    drawSparseGrid(width, height) {
        const sparseFactor = 4; // Draw every 4th line

        this.gridCtx.beginPath();
        for (let x = 0; x <= width; x += this.gridCellSize * sparseFactor) {
            this.gridCtx.moveTo(x, 0);
            this.gridCtx.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += this.gridCellSize * sparseFactor) {
            this.gridCtx.moveTo(0, y);
            this.gridCtx.lineTo(width, y);
        }
        this.gridCtx.stroke();
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.drawingCanvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;

        // Save state when starting to draw
        this.saveState();
    }

    draw(e) {
        if (!this.isDrawing) return;

        const rect = this.drawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.drawingCtx.beginPath();
        this.drawingCtx.moveTo(this.lastX, this.lastY);
        this.drawingCtx.lineTo(x, y);

        if (this.currentTool === 'eraser') {
            this.drawingCtx.globalCompositeOperation = 'destination-out';
            this.drawingCtx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            this.drawingCtx.globalCompositeOperation = 'source-over';
            this.drawingCtx.strokeStyle = this.currentColor;
        }

        this.drawingCtx.lineWidth = this.currentSize;
        this.drawingCtx.lineCap = 'round';
        this.drawingCtx.lineJoin = 'round';
        this.drawingCtx.stroke();

        this.lastX = x;
        this.lastY = y;
    }

    stopDrawing() {
        this.isDrawing = false;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CanvasManager();
});