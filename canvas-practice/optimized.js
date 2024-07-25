class LineDrawer{
    constructor(cellWidth,cellHeight){
        // this.context = context;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.dataCanvas = document.getElementById('dataCanvas')
        this.cData = this.dataCanvas.getContext('2d');
        this.rowCanvas = document.getElementById('rowNumbersCanvas')
        this.cRow = this.rowCanvas.getContext('2d')
        this.headerCanvas = document.getElementById('headerCanvas')
        this.cHeader = this.headerCanvas.getContext('2d')
        this.childContainer = document.getElementById("childContainer");
        this.container = document.getElementById('canvasContainer');

        console.log(this.headers)
        this.headerss =  [
            {data:"#"},
            {data:"A"},
            {data:"B"},
            {data:"C"},
            {data:"D"},
            {data:"E"},
            {data:"F"},
            {data:"G"},
            {data:"H"},
            {data:"I"},
            {data:"J"},
            {data:"K"},
            {data:"L"},
            {data:"M"},
            {data:"N"},
            {data:"O"},
            {data:"P"},
            {data:"Q"},
            {data:"R"},
            {data:"S"},
            {data:"T"},
            {data:"U"},
            {data:"V"},
            {data:"W"},
            {data:"X"},
            {data:"Y"},
            {data:"Z"}
          ];

        this.headers = this.headerss.map(header => ({
            ...header,
            width: header.width || 100,
            minWidth: header.minWidth || 50,
            maxWidth: header.maxWidth || 500
        }));
        this.updateCanvasSizes();
    }

    updateCanvasSizes() {
        const totalWidth = this.headers.reduce((sum, header) => sum + header.width, 0);

        this.childContainer.style.width = `${totalWidth}px`;
        this.childContainer.style.height = `${this.container.clientHeight+this.headerHeight*5}px`;

        //  data canvas fixed now
        this.dataCanvas.width =  totalWidth;
        this.dataCanvas.height = this.container.clientHeight;

        // header
        this.headerCanvas.width = totalWidth;
        this.headerCanvas.height = 30;

        // row
        this.rowCanvas.width = 100;
        this.rowCanvas.height = this.container.clientHeight;
    }

    drawLine(x1,y1,x2,y2,c){
        c.beginPath();
        c.moveTo(x1,y1);
        c.lineTo(x2,y2);
        // this.context.lineWidth = 2;
        c.stroke();
    }


    drawHeaders(rows,cols){
        // this.cData.clearRect(0,0,this.dataCanvas.clientWidth,this.dataCanvas.clientHeight)
        for(let c=0;c<=cols;c++){
            let x = c*this.cellWidth;
            // console.log(x);
            this.drawLine(x,0,x,30,this.cHeader);
            for(let r=0;r<=rows;r++){
                let y = r*this.cellHeight;
                this.drawLine(0,y,this.headerCanvas.clientWidth,y,this.cHeader);
            }
        }
    }

    drawData(rows,cols){
        for(let c=0;c<=cols;c++){
            let x = c*this.cellWidth;
            // console.log(x);
            this.drawLine(x+100,30,x+100,this.dataCanvas.clientHeight,this.cData);
            for(let r=1;r<=rows;r++){
                let y = 30+r*this.cellHeight;
                this.drawLine(0+100,y,this.dataCanvas.clientWidth,y,this.cData);
            }
        }
    }
    
    drawRow(rows, cols) {
        // Draw vertical lines
        for (let c = 0; c <= cols; c++) {
            let x = c * this.cellWidth;
            // console.log(x);
            this.drawLine(x, 30, x, this.rowCanvas.clientHeight,this.cRow);
        }

        // Draw horizontal lines
        for (let r = 0; r <= rows; r++) {
            
            let y = 30 + r * this.cellHeight;
            this.drawLine(0, y,100, y,this.cRow);
        }
    }


    drawH(){
            this.drawHeaders(1,50);
        
    }
    drawR(){
            this.drawRow(50,1)
    }
    drawD(){
            this.drawData(50,50);
        
    }

    drawExcel(){
        // this.cHeader.clearRect(0,0,this.headerCanvas.clientWidth,this.headerCanvas.clientHeight);
        // this.cData.clearRect(0,0,this.dataCanvas.clientWidth,this.dataCanvas.clientHeight)
        // this.cRow.clearRect(0,0,this.rowCanvas.clientWidth,this.rowCanvas.clientHeight)
        window.requestAnimationFrame(()=>{
            this.drawH();
            this.drawD();
            this.drawR();
        })
        
    }
}


class TableCell {
    constructor(x, y, width, height, text, isHeader = false, color = "lightgray") {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.isHeader = isHeader;
        this.color = color;
    }

    static getLines(ctx, text, maxWidth) {
        let lines = [];
        let currentLine = '';

        for (let char of text.toString()) {
            let testLine = currentLine + char;
            let width = ctx.measureText(testLine).width;

            if (width > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine !== '') {
            lines.push(currentLine);
        }

        return lines;
    }

    draw(c,color = null) {

        c.clearRect(this.x,this.y,this.width, this.height);

        if (color) {
            c.fillStyle = color;
            // c.fillText(line)
            c.fillRect(this.x, this.y, this.width, this.height);
        }
        
        c.font = this.isHeader ? 'bold 14px Arial' : '12px Arial';
        const lines = TableCell.getLines(c, this.text, this.width - 10);
            lines.forEach((line, index) => {
                c.fillStyle = 'black';
                c.fillText(line, this.x + 5, this.y + 20 + (index * 15));
            });
        
        // c.save();
        // c.globalCompositeOperation = 'destination-out';
       
        // c.restore();
    }
}

class CanvasTable {
    constructor(containerId, headers,dataHeaders, sampleData) {
        this.container = document.getElementById(containerId);
        this.submitFile = document.getElementById('uploadFileForm');
        
        this.headerCanvas = document.getElementById('headerCanvas');
        this.dataHeaders = dataHeaders;

        // Batches
        this.batchStart = 0;
        
    
        this.uid = this.generateUUID();
        this.rowNumberCanvas = document.getElementById('rowNumbersCanvas');
        this.dataCanvas = document.getElementById('dataCanvas');
        this.firstEle = document.getElementById('firstElem');
        this.progressBar = document.getElementById('progressBar');
        this.progressStatus = document.getElementById('progressStatus');
        this.cHeader = this.headerCanvas.getContext("2d");
        this.cRow = this.rowNumberCanvas.getContext("2d");
        this.cData = this.dataCanvas.getContext("2d");


        // handleSubmitting a file
        this.submitFile.addEventListener("submit",this.handleSubmitFile.bind(this));

        // data canvas handleClick
        // this.dataCanvas.addEventListener("dblclick", this.handleDbClick.bind(this));

        // data canvas multiselect
        this.dataCanvas.addEventListener("mousedown",this.handleDataDown.bind(this));
        this.dataCanvas.addEventListener("mousemove",this.handleDataMove.bind(this));
        this.dataCanvas.addEventListener("mouseup",this.handleDataUp.bind(this));

        // scroll
        this.container.addEventListener("scroll", this.handleScroll.bind(this));
      
        this.headerCanvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.headerCanvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.headerCanvas.addEventListener("mouseup", this.handleMouseUp.bind(this));

        // row resize
        this.rowNumberCanvas.addEventListener("mousedown",this.handleRowMouseDown.bind(this));
        this.rowNumberCanvas.addEventListener("mousemove",this.handleRowMouseMove.bind(this));
        this.rowNumberCanvas.addEventListener("mouseup",this.handleRowMouseUp.bind(this));

        // drag and drop
        this.headerCanvas.addEventListener("mousedown", this.handleDragStart.bind(this));
        document.addEventListener("mousemove", this.handleDragMove.bind(this));
        document.addEventListener("mouseup", this.handleDragEnd.bind(this));
        

        this.cellHeight = 30;
        this.headerHeight = 30;
        this.resizeThreshold = 5;

        

        this.headers = headers.map(header => ({
            ...header,
            width: header.width || 100,
            minWidth: header.minWidth || 50,
            maxWidth: header.maxWidth || 500
        }));
        
        // this.sampleData = new Array(50);

        this.sampleData = sampleData.map(sampleD => ({
            ...sampleD,
            height: sampleD.height || 30,
            minHeight: sampleD.minHeight || 10,
            maxHeight: sampleD.maxHeight || 60
        }));

        this.multiSelectState = {
            isSelecting: false,
            data: new Set(),
            startCell: null,
            endCell: null
        };

        this.dragState = {
            isDragging: false,
            columnIndex: -1,
            startX: 0,
            currentX: 0
        };

        this.colHeight = 30;
        
        this.resizeState = { isResizing: false, columnIndex: -1, startX: 0 };
        this.rowResizeState = {isResizing:false,rowIndex:-1,startY:0}

        this.firstEle.style.width = `6.2rem`;
        this.firstEle.style.height = `1.8rem`;
        this.firstEle.style.backgroundColor = 'lightgray';
        this.visibleRowsCount = this.getRowCount();
        this.visibleColumnsCount = this.getColumnCount();
        this.cachedData = new Map();
        this.lastScrollTop = 0;
        this.lastScrollLeft = 0;

        this.dataMap = new Map();
        this.lineDraw = new LineDrawer(100,30);


        this.initializeChildContainer();

        this.updateCanvasSizes();
        this.drawTable();   // fine

        // this.getData(batchStart);
    }

    initializeChildContainer(){
        this.childContainer = document.getElementById('childContainer');
    }
    getRowCount(index){
        let x = this.headerHeight;
        for(let i=1;i<this.sampleData.length;i++){
            x += this.sampleData[i].height;
            if(x >= this.container.clientHeight){
                return i;
            }
        }
        return -1;
    }

    getColumnCount(index){
        let x = this.headers[0].width;
        for(let i=1;i<this.headers.length;i++){
            x += this.headers[i].width;
            if(x >= this.container.clientWidth){
                return i;
            }
        }
        return -1;
    }


    generateUUID() { // Public Domain/MIT
        var d = new Date().getTime();//Timestamp
        var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16;//random number between 0 and 16
            if(d > 0){//Use timestamp until depleted
                r = (d + r)%16 | 0;
                d = Math.floor(d/16);
            } else {//Use microseconds since page-load if supported
                r = (d2 + r)%16 | 0;
                d2 = Math.floor(d2/16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    Polling(fid,event) {
        const formData = new FormData();
        formData.append("uid", this.uid);
        formData.append("fid", fid);

        const id = setInterval(async () => {
            try {
                const response = await fetch(`http://localhost:5103/api/check/status/${this.uid}/${fid}`);
                const status = await response.json();
                console.log(status.status);
                console.log(status.progress);
                this.progressBar.style.color = 'white';
                if(status.progress < 0){
                    this.progressBar.style.width = `0%`;
                    this.progressBar.textContent = `0%`;
                }else{
                    this.progressBar.style.width = `${status.progress}%`;
                    this.progressBar.textContent = `${status.progress}%`;
                }

                this.progressStatus.textContent = `${status.status}`;

                if (status.status === "Completed") {
                    clearInterval(id);
                }
            } catch (error) {
                console.error("Error while polling:", error);
            }
        }, 300);

    }
    
    
    async handleSubmitFile(event){
       
        event.preventDefault();
        if(!event.target[0].files.length > 0){
            alert("Please uplaod file");
            return;
        }
        console.log(event.target[0].files[0].name);
        const fid = this.generateUUID();
        const file = event.target[0].files[0];
        console.log(`${file} ${this.uid} ${fid}`);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("id1", this.uid);
        formData.append("id2",fid);

        console.log("FormData entries:");
        for (let entry of formData.entries()) {
            console.log(entry[0], entry[1]);
        }

        try{
            console.log("Sending");
            await axios.post(`http://localhost:5103/api/check`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        console.log("Sent");
        //  Apply Polling
        this.Polling(fid,event);
    }catch(error){
        console.error(error);
    }
    }

   
    handleDataDown(event) {
        // 
        // Get the position relative to the canvas
        const rect = this.dataCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top + this.container.scrollTop - this.headerHeight;
        // const x = rect.offsetX();
        // const y = rect.offsetY();
    
        // Calculate the column and row indices
        const colIndex = this.getPositionX(x);
        const rowIndex = this.getPositionY(y);
    
        // Calculate the visible row range
        const startRow = Math.floor(this.container.scrollTop / this.headerHeight);
        const endRow = Math.floor((this.container.scrollTop + this.container.clientHeight) / this.headerHeight);


    
        // Log for debugging
        console.log(`Click at col: ${colIndex}, row: ${rowIndex}`);
        console.log(`Visible rows: ${startRow} to ${endRow}`);
    
        // Clear previous selection
        this.multiSelectState.data.clear();
    
        // Check if the click is within valid bounds
        if (rowIndex >= startRow && rowIndex < Math.min(endRow, this.sampleData.length) && 
            colIndex > 0 && colIndex < this.headers.length) {
            
            // Set selection state
            this.multiSelectState.isSelecting = true;
            this.multiSelectState.startCell = { row: rowIndex, col: colIndex };
            this.multiSelectState.endCell = { row: rowIndex, col: colIndex };
    
            // Add the selected cell to the multiSelectState.data set if you're using it
            const cellKey = `${rowIndex+1}|${colIndex}`;
            this.multiSelectState.data.add(cellKey);
    
            // Redraw only the visible area
           
            // this.lineDraw.drawTable();
            window.requestAnimationFrame(()=>{
                // alert("drawn")
                this.drawData({startRow: startRow, endRow: endRow}); 
                this.lineDraw.drawD();
            })
    
            // Log the selected cell data for debugging
            if (this.sampleData[rowIndex] && this.dataHeaders[colIndex-1]) {
                console.log('Selected cell data:', this.sampleData[rowIndex][this.dataHeaders[colIndex-1]]);
            }
        } else {
            console.log('Click outside valid data range');
        }
    }

    
    handleDataMove(event) {
        if (this.multiSelectState.isSelecting) {

            const rect = this.dataCanvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top + this.container.scrollTop - this.headerHeight;
        
            // Calculate the column and row indices
            const colIndex = this.getPositionX(x);
            const rowIndex = this.getPositionY(y);

            const startRow = Math.floor(this.container.scrollTop / this.headerHeight);
            const endRow = Math.ceil((this.container.scrollTop + this.container.clientHeight) / this.headerHeight);

            if (rowIndex >= startRow && rowIndex < Math.min(endRow, this.sampleData.length) && 
            colIndex > 0 && colIndex < this.headers.length) {
                // this.multiSelectState
                this.multiSelectState.endCell = { row: rowIndex, col: colIndex };
                const cellkey = `${rowIndex+1}|${colIndex}`;
                // window.requestAnimationFrame(()=>{
                    this.updateSelection();
                // })

                // this.updateSelection();
                window.requestAnimationFrame(()=>{
                    this.drawData({startRow: startRow, endRow: endRow});
                        // alert("drawn")
                        this.lineDraw.drawD();
                    // this.lineDraw.drawTable();
                })
            }
        }
    }

    handleDataUp() {
        this.multiSelectState.isSelecting = false;
    }

    toggleCellSelection(row, col) {
        const key = `${row}|${col}`;
        if (this.multiSelectState.data.has(key)) {
            this.multiSelectState.data.delete(key);
        } else {
            this.multiSelectState.data.add(key);
        }
    }

     updateSelection() {
        this.multiSelectState.data.clear();
        const { startCell, endCell, isAddingToSelection } = this.multiSelectState;
        const minRow = Math.min(startCell.row, endCell.row);
        const maxRow = Math.max(startCell.row, endCell.row);
        const minCol = Math.min(startCell.col, endCell.col);
        const maxCol = Math.max(startCell.col, endCell.col);

        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                const cellKey = `${row+1}|${col}`;
                if(!this.multiSelectState.data.has(cellKey)){
                    this.multiSelectState.data.add(cellKey);
                }
                
            }
        }
    }

    getPositionX(x){
        let cumulativeWidth = this.headers[0].width;
        for(let i=1;i<this.headers.length;i++){
            cumulativeWidth += this.headers[i].width;
            if(x <= cumulativeWidth){
                return i;
            }
        }
        return -1;
    }

    getPositionY(y){
        let cumulativeHeight = this.headerHeight;
        for(let i=0;i<this.sampleData.length;i++){
            
            if(y <= cumulativeHeight){
                return i;
            }
            cumulativeHeight += this.headerHeight;
        }
        return -1;
    }

    handleDragStart(event) {
        // alert("handle drag start");
        const rect = this.headerCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        
        const columnIndex = this.getPositionX(x);

        if (columnIndex >= 0) {
            this.dragState = {
                isDragging: true,
                columnIndex: columnIndex,
                startX: event.clientX,
                currentX: event.clientX
            };
        
            
            if(!this.resizeState.isResizing){
                this.headerCanvas.style.cursor = "grabbing";
                this.createDraggedColumnImage(columnIndex);
            }
                   
        }
    }

    handleDragMove(event) {
        if (!this.resizeState.isResizing &&this.dragState.isDragging) {
            this.dragState.currentX = event.clientX;
            this.updateDraggedColumnPosition();
            this.drawHeader();
        }
    }

    handleDragEnd(event) {
        if (!this.resizeState.isResizing && this.dragState.isDragging) {
            const targetColumnIndex = this.getTargetColumnIndex(event.clientX);
            if (targetColumnIndex !== -1 && targetColumnIndex !== this.dragState.columnIndex) {
                this.swapColumns(this.dragState.columnIndex, targetColumnIndex);
            }
            this.removeDraggedColumnImage();
            this.dragState.isDragging = false;
            this.headerCanvas.style.cursor = "default";
            this.drawTable();
            // this.drawData();
        }
    }

    createDraggedColumnImage(columnIndex) {
        const draggedColumn = document.createElement('canvas');
        draggedColumn.id = 'draggedColumn';
        draggedColumn.width = this.headers[columnIndex].width;
        draggedColumn.height = this.headerCanvas.height + this.dataCanvas.height;
        draggedColumn.style.position = 'absolute';
        draggedColumn.style.top='0';
        draggedColumn.style.left=`${this.headers[0].width}`
        draggedColumn.style.zIndex = '4';
        draggedColumn.style.pointerEvents = 'none';
        draggedColumn.style.opacity = '0.5';

        const ctx = draggedColumn.getContext('2d');

        // Draw header
        new TableCell(0, 0, this.headers[columnIndex].width, this.headerHeight, this.headers[columnIndex].data, true).draw(ctx);

        // Draw data
        this.sampleData.forEach((rowData, rowIndex) => {
            new TableCell(0, this.headerHeight + rowIndex * this.cellHeight, this.headers[columnIndex].width, this.cellHeight, rowData[this.headers[columnIndex].data]).draw(ctx);
        });

        document.body.appendChild(draggedColumn);
    }

    updateDraggedColumnPosition() {
        const draggedColumn = document.getElementById('draggedColumn');
        if (draggedColumn) {
            const dx = this.dragState.currentX - this.dragState.startX;
            if(dx<0){
                dx = 0
            }
            draggedColumn.style.transform = `translate(${dx}px, 0)`;
        }
    }

    removeDraggedColumnImage() {
        const draggedColumn = document.getElementById('draggedColumn');
        if (draggedColumn) {
            draggedColumn.remove();
        }
    }

    getTargetColumnIndex(x) {
        const rect = this.headerCanvas.getBoundingClientRect();
        const relativeX = x - rect.left;
        let cumulativeWidth = this.headers[0].width;

        for (let i = 1; i < this.headers.length; i++) {
            if (relativeX < cumulativeWidth + this.headers[i].width) {
                return i;
            }
            cumulativeWidth += this.headers[i].width;
        }

        return this.headers.length - 1;
    }

    swapColumns(fromIndex, toIndex) {
        // alert(`${fromIndex} ${toIndex}`)
         // Swap headers
    const tempHeader = this.headers[fromIndex];
    this.headers.splice(fromIndex, 1);
    this.headers.splice(toIndex, 0, tempHeader);

    // Swap dataHeaders
    const tempDataHeader = this.dataHeaders[fromIndex - 1]; // -1 because dataHeaders doesn't include the '#' column
    this.dataHeaders.splice(fromIndex - 1, 1);
    this.dataHeaders.splice(toIndex - 1, 0, tempDataHeader);

    // Swap data
    this.sampleData = this.sampleData.map(row => {
        const entries = Object.entries(row);
        const temp = entries[fromIndex];
        entries.splice(fromIndex, 1);
        entries.splice(toIndex, 0, temp);
        return Object.fromEntries(entries);
    });
    }

    getCumulativeWidth(index) {
        return this.headers.slice(0, index).reduce((sum, header) => sum + header.width, 0);
    }

    getCumulativeHeight(index){
        return this.sampleData.slice(0, index).reduce((sum, header) => sum + header.height, 0);
    }

    updateCanvasSizes(scrollTop = null) {
        const totalWidth = this.headers.reduce((sum, header) => sum + header.width, 0);

        this.childContainer.style.width = `${totalWidth}px`;
        this.childContainer.style.height = `${this.headerHeight + this.cellHeight * this.sampleData.length}px`
    
        this.headerCanvas.width = this.headers[0].width + totalWidth;
        this.headerCanvas.height = this.headerHeight;

        this.rowNumberCanvas.width = this.headers[0].width;
        this.rowNumberCanvas.height = this.container.clientHeight+this.headerHeight;

        //  data canvas fixed now
        this.dataCanvas.width =  totalWidth;
        this.dataCanvas.height = this.container.clientHeight+this.headerHeight;
    }

    drawTable() {
        window.requestAnimationFrame(() => {
            this.drawHeader();
            this.drawRowCanvas();
            this.drawData();
            this.lineDraw.drawExcel();
            
        });
    }

    handleMouseDown(event) {
        const rect = this.headerCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
       
        const columnIndex = this.getColumnIndexAtX(x);
        if (columnIndex !== -1) {
            this.resizeState = {
                isResizing: true,
                columnIndex: columnIndex,
                startX: event.clientX
            };
        }
    }

    handleRowMouseDown(event){
        const rect = this.rowNumberCanvas.getBoundingClientRect();
        const y = event.clientY - rect.top;
        const rowIndex = this.getColumnIndexAtY(y);
        console.log(`RowIndex: ${rowIndex}`);
        if (rowIndex !== -1) {
            this.rowResizeState = {
                isResizing: true,
                rowIndex: rowIndex-1,
                startY: event.clientY
            };
        }
    }

    handleMouseMove(event) {
        if (this.resizeState.isResizing) {
            const diff = event.clientX - this.resizeState.startX;
            const header = this.headers[this.resizeState.columnIndex];
            const newWidth = Math.max(
                header.minWidth,
                Math.min(header.maxWidth, header.width + diff)
            );
            header.width = newWidth;
            this.resizeState.startX = event.clientX;
            this.updateCanvasSizes();
            this.drawTable();
        } else {
            const rect = this.headerCanvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const columnIndex = this.getColumnIndexAtX(x);
            this.headerCanvas.style.cursor = columnIndex !== -1 ? 'col-resize' : 'default';
        }
    }

    handleRowMouseMove(event){
        if (this.rowResizeState.isResizing) {
            const diff = event.clientY - this.rowResizeState.startY;
            console.log(`Row diff: ${diff}`);
            // console.log(header);
            const header = this.sampleData[this.rowResizeState.rowIndex];
            console.log(`Header ${header}`);
            console.log(header);
            const newHeight = Math.max(
                header.minHeight,
                Math.min(header.maxHeight, header.height + diff)
            );

            console.log(`New Height: ${newHeight}`);
            header.height = newHeight;
            this.rowResizeState.startY = event.clientY;
            this.updateCanvasSizes();
            this.drawTable();
        } else {
            const rect = this.rowNumberCanvas.getBoundingClientRect();
            const y = event.clientY - rect.top;
            const rowIndex = this.getColumnIndexAtY(y);
            this.rowNumberCanvas.style.cursor = rowIndex !== -1 ? 'row-resize' : 'default';
        }
    }


    handleMouseUp() {
        this.resizeState.isResizing = false;
    }

    handleRowMouseUp(){
        this.rowResizeState.isResizing = false;
    }


    getColumnIndexAtX(x) {
        let currentX = 0;
        for (let i = 0; i < this.headers.length; i++) {
            currentX += this.headers[i].width;
            if (Math.abs(currentX - x) <= this.resizeThreshold) {
                return i;
            }
        }
        return -1;
    }

    getColumnIndexAtY(y){
        let currentY = 0;
        for (let i = 0; i < this.sampleData.length; i++) {
            currentY += this.sampleData[i].height;
            if (Math.abs(currentY - y) <= this.resizeThreshold) {
                return i;
            }
        }
        return -1;
    }

    calculateCumulativeWidths(){
            let sum = 0;
            return this.headers.map(header => sum += header.width);
    }

    drawHeader(colIndex = null) {
        this.cHeader.clearRect(0, 0, this.headerCanvas.width, this.headerCanvas.height);
        let x = 0;
        this.headers.forEach((header, index) => {
            if(colIndex && index === colIndex){
                new TableCell(x, 0, header.width, this.headerHeight, header.data, true).draw(this.cHeader,"lightblue");
            }else{
            new TableCell(x, 0, header.width, this.headerHeight, header.data, true).draw(this.cHeader);
            }
            x += header.width;
        });
    }

    drawRowCanvas(visibleArea=null) {
        // this.cRow.clearRect(0, 0, this.rowNumberCanvas.width, this.rowNumberCanvas.height);
        console.log(`Row Canvas ${visibleArea?.startRow} ${visibleArea?.endRow}`)
        
        if(visibleArea){
            let currentY = this.headerHeight;
            for(let i=visibleArea.startRow;i<=visibleArea.endRow;i++){
                const newHeight = this.sampleData[i].height ? this.sampleData[i].height:30;
                new TableCell(0, currentY, this.headers[0].width,newHeight , i+1, true).draw(this.cRow);
                currentY += newHeight;
            }
        }else{
            let currentY = this.headerHeight;
            this.sampleData.forEach((data, rowIndex) => {
                const newHeight = data.height ? data.height:30;
                new TableCell(0, currentY, this.headers[0].width,newHeight , rowIndex + 1, true).draw(this.cRow);
                currentY += newHeight;
            });
        }
        
    }
    

    drawData(visibleArea=null) {
        // alert("Draw Data")
        let x = 0;
        // this.cData.clearRect(0, 0, this.dataCanvas.width, this.dataCanvas.height);

        if(visibleArea){
            console.log(visibleArea);
            
            console.log("visible")
            const startRow = visibleArea.startRow;
            const endRow = visibleArea.endRow;
            const startCol = visibleArea.startCol;
            const endCol = visibleArea.endCol;
            console.log(this.sampleData[startRow])
            console.log(this.sampleData[endRow])
          
            let currentY = this.headerHeight;
            for(let i=startRow;i<=endRow;i++){
                x = 0;
                const newHeight = this.headerHeight;
                // console.log(newHeight)
                this.headers.forEach((header, colIndex) => {
                           const dataHeaderIndex = colIndex - 1; 
                           const dataKey = this.dataHeaders[dataHeaderIndex];
                           const cellValue = this.sampleData[i][dataKey] || "" ; 
                           
                           const color = this.multiSelectState.data.has(`${i+1}|${colIndex}`) ? "rgba(3, 194, 252,0.5)" : null;
                           
                           new TableCell(x, currentY, header.width, newHeight, cellValue).draw(this.cData,color);
                           x += header.width;
                   });
                   currentY += newHeight;
            }
        }else{
            let currentY = this.headerHeight;
            this.sampleData.forEach((rowData, rowIndex) => {
                x = 0; // Start from the beginning for data
                const newHeight = rowData.height || 30;
        
                this.headers.forEach((header, colIndex) => {
                 //    if (colIndex > 0) {  // Skip the first column (row numbers)
                        const dataHeaderIndex = colIndex - 1; // Adjust for the offset
                        const dataKey = this.dataHeaders[dataHeaderIndex];
                        const cellValue = rowData[dataKey] || "";
                     //    console.log(Cell Value: ${cellValue})
                        
                        const color = this.multiSelectState.data.has(`${rowIndex+1}|${colIndex}`) ? "rgba(3, 194, 252,0.5)" : null;
                        
                        new TableCell(x, currentY, header.width, newHeight, cellValue).draw(this.cData, color);
                        x += header.width;
                 //    }
                });
                currentY += newHeight;
            });
        }
    }
    

    
    handleScroll() {
        const scrollLeft = this.container.scrollLeft;
        const scrollTop = this.container.scrollTop;

        this.headerCanvas.style.top = `${scrollTop}px`;
        this.rowNumberCanvas.style.left = `${scrollLeft}px`;
        this.dataCanvas.style.top = `${scrollTop}px`
        this.rowNumberCanvas.style.top = `${scrollTop}px`


        const scrollDirection = scrollTop > this.lastScrollTop ? 'down' : 'up';
        console.log(scrollDirection);
       
        this.updateVisibleArea(scrollLeft, scrollTop,scrollDirection);
    }

    getVisibleArea(scrollX, scrollY) {
        const startRow = Math.floor(scrollY / this.headerHeight);
        const endRow = Math.min(Math.ceil((scrollY + this.container.clientHeight+30) / this.headerHeight), this.sampleData.length);
        const startCol = Math.floor(scrollX / this.headers[0].width);
        const endCol = Math.min(Math.ceil((scrollX + this.container.clientWidth+100) / this.headers[0].width), this.headers.length);

        return { startRow, endRow, startCol, endCol };
    }


    async updateVisibleArea(scrollLeft, scrollTop,scrollDirection) {
        const visibleArea = this.getVisibleArea(scrollLeft,scrollTop);
        console.log(visibleArea);
        // console.log("Update Area called");

        console.log(`Scroll Height: ${this.childContainer.scrollHeight}`)

        if(scrollDirection === "up"){
            console.log(visibleArea)
            if(scrollTop <= this.headerHeight){
                  
                    // console.log("data called")
                   
            }
        }else if(scrollDirection === "down"){
            if (scrollTop + this.container.clientHeight >= (this.sampleData.length * this.headerHeight)) {
                // alert('data called')
                this.batchStart += 30;
                const data = await this.getData(this.batchStart);
    
                if (data.length > 0) {
                    this.sampleData.push(...data);
                    
                    // this.lineDraw.drawExcel();
                    // this.storeData();
                    // alert('pushed')
                } else {
                    this.addRows();
                }
                this.updateCanvasSizes(scrollTop);
               
            }
    
            if (scrollLeft + this.container.clientWidth >= this.dataCanvas.width) {
                this.addColumns();
            }
        }
        
        window.requestAnimationFrame(() => {
            this.drawHeader();
            this.drawData(visibleArea);
            this.drawRowCanvas(visibleArea);
        });
        this.lineDraw.drawExcel();
    }

    getRowIndexAtY(y) {
        let cumulativeHeight = 0;
        for (let i = 0; i < this.rowHeights.length; i++) {
            cumulativeHeight += this.rowHeights[i];
            if (cumulativeHeight > y) {
                return i;
            }
        }
        return this.rowHeights.length - 1;
    }

    getColIndexAtX(x) {
        let cumulativeWidth = 0;
        for (let i = 0; i < this.colWidths.length; i++) {
            cumulativeWidth += this.colWidths[i];
            if (cumulativeWidth > x) {
                return i;
            }
        }
        return this.colWidths.length - 1;
    }

    getVisibleRowCount(scrollTop) {
        let visibleHeight = this.getVisibleHeight();
        let cumulativeHeight = 0;
        let count = 0;
        for (let i = this.getRowIndexAtY(scrollTop); i < this.rowHeights.length; i++) {
            cumulativeHeight += this.rowHeights[i];
            if (cumulativeHeight > visibleHeight) {
                break;
            }
            count++;
        }
        return count;
    }

    getVisibleColCount(scrollLeft) {
        let visibleWidth = this.getVisibleWidth();
        let cumulativeWidth = 0;
        let count = 0;
        for (let i = this.getColIndexAtX(scrollLeft); i < this.colWidths.length; i++) {
            cumulativeWidth += this.colWidths[i];
            if (cumulativeWidth > visibleWidth) {
                break;
            }
            count++;
        }
        return count;
    }

    async addRows() {
        for (let i = 0; i < 30; i++) {
            let row = {};
            this.headers.forEach((header, index) => {
                row[header.data] = "";
            });
            this.sampleData.push(row);
        }
        this.updateCanvasSizes();
    }

    getNextColumnLabel(lastLabel) {
        let result = '';
        let carry = true;

        for (let i = lastLabel.length - 1; i >= 0; i--) {
            if (carry) {
                if (lastLabel[i] === 'Z') {
                    result = 'A' + result;
                } else {
                    result = String.fromCharCode(lastLabel.charCodeAt(i) + 1) + result;
                    carry = false;
                }
            } else {
                result = lastLabel[i] + result;
            }
        }

        if (carry) {
            result = 'A' + result;
        }

        return result;
    }

      addColumns() {
        // alert(this.headers.length);
        const lastColumn = this.headers[this.headers.length - 1].data;
        console.log(`lastColumn ${lastColumn}`)
        const newColumnName = this.getNextColumnLabel(lastColumn);

        console.log(`${newColumnName}`);
        const newColumn = {
            data: newColumnName,
            width: this.headers[0].width,
            maxWidth:500,
            minWidth:30
        };
    
        this.headers.push(newColumn);
    
        // Resize the canvas to accommodate the new column
        this.dataCanvas.width += this.defaultColumnWidth;
        this.headerCanvas.width += this.defaultColumnWidth;
    
        // Redraw the table with the new column
        this.updateCanvasSizes();
    }
    
    handleDbClick(event) {
        const rect = this.dataCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top ;
        alert(x);
        alert(y);
    
        let colIndex = -1;
        let cumulativeWidth = this.headers[0].width;
        
        for (let i = 1; i < this.headers.length; i++) {
            cumulativeWidth += this.headers[i].width;
            if (x < cumulativeWidth) {
                colIndex = i;
                break;
            }
        }
        console.log(colIndex);
        const rowIndex = Math.floor((y - this.headerHeight) / this.cellHeight);
    
        if (rowIndex >= 0 && rowIndex < this.sampleData.length && colIndex > 0 && colIndex < this.headers.length) {
            const xcord = cumulativeWidth - this.headers[colIndex].width;
            const ycord = rowIndex * this.cellHeight + this.headerHeight ;
    
            const cellValue = this.sampleData[rowIndex][this.headers[colIndex].data];
            this.drawData(xcord, ycord, this.headers[colIndex].data, rowIndex + 1, this.headers[colIndex].width);
        }
    }
    async getData(batchStart){
        const res = await fetch(`http://localhost:5103/api/check/data/${batchStart}`);
            const response = await res.json();
            // console.log(response.data);
            return response.data;
    }
   
}


window.onload = async function () {
    const headers = [
        {data:"#"},
        {data:"A"},
        {data:"B"},
        {data:"C"},
        {data:"D"},
        {data:"E"},
        {data:"F"},
        {data:"G"},
        {data:"H"},
        {data:"I"},
        {data:"J"},
        {data:"K"},
        {data:"L"},
        {data:"M"},
        {data:"N"},
        {data:"O"},
        {data:"P"},
        {data:"Q"},
        {data:"R"},
        {data:"S"},
        {data:"T"},
        {data:"U"},
        {data:"V"},
        {data:"W"},
        {data:"X"},
        {data:"Y"},
        {data:"Z"}
      ];

    async function getData(){
        const res = await fetch(`http://localhost:5103/api/check/data`);
            const response = await res.json();
            // console.log(response.data);
            return response.data;
    }

    
    const dataHeaders = [
        "id",
          "emailId",
        "name",
          "country",
            "state",
        "city",
          "telephoneNumber",
         "addressLine1",
         "addressLine2",
          "dateOfBirth",
            "fY2019_20",
            "fY2020_21",
            "fY2021_22",
            "fY2022_23",
        "fY2023_24",
    ];
    
    
    let sampleData = [];
    // sampleData.push(dataHeaders);
    // console.log(sampleData)
   

    const data = await getData();
    // console.log(dataHeaders);
    console.log(data);
    if(data.length > 0){
        sampleData = [{
            id:"Id",
            emailId:"EmailId",
            name:"Name",
            country:"Country",
            state:"State",
            city:"City",
            telephoneNumber:"TelephoneNumber",
            addressLine1:"AddressLine1",
            addressLine2:"AddressLine2",
            dateOfBirth:"DateOfBirth",
            fY2019_20:"FY2019_20",
            fY2020_21:"FY2020_21",
            fY2021_22:"FY2021_22",
            fY2022_23:"FY2022_23",
            fY2023_24:"FY2023_24",
        },...data];
    }else{
        for (let i = 0; i < 30; i++) {
            let row = {};
            headers.forEach((header, index) => {
                row[header.data] = "";
            });
            sampleData.push(row);
        }
    }

    
    console.log(sampleData);
    new CanvasTable('canvasContainer', headers,dataHeaders,sampleData)
    const lineDraw = new LineDrawer(100,30);
    lineDraw.drawH();
    lineDraw.drawD();
    lineDraw.drawR();
   

}