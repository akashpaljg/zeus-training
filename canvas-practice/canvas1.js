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
        c.strokeStyle = 'black';
        c.lineWidth = 2;
        c.clearRect(this.x,this.y,this.width, this.height);
        c.strokeRect(this.x, this.y, this.width, this.height);

        if (this.isHeader) {
            c.fillStyle =  color ? color : this.color;
        
            c.fillRect(this.x, this.y, this.width, this.height);
        }
            c.fillStyle = this.isHeader ?'green' : color? color: 'black';

            if(color){
                c.fillRect(this.x,this.y, this.width, this.height);
            }
        

        
        c.font = this.isHeader ? 'bold 14px Arial' : '12px Arial';

        const lines = TableCell.getLines(c, this.text, this.width - 10);
        lines.forEach((line, index) => {
            c.fillStyle = 'black';
            c.fillText(line, this.x + 5, this.y + 20 + (index * 15));
        });
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

        // sentinel
        // this.sentinel = document.getElementById('sentinel');

        // handleSubmitting a file
        this.submitFile.addEventListener("submit",this.handleSubmitFile.bind(this));

        // data canvas handleClick
        this.dataCanvas.addEventListener("dblclick", this.handleDbClick.bind(this));

        // data canvas multiselect
        this.dataCanvas.addEventListener("mousedown",this.handleDataDown.bind(this));
        this.dataCanvas.addEventListener("mousemove",this.handleDataMove.bind(this));
        this.dataCanvas.addEventListener("mouseup",this.handleDataUp.bind(this));

        // scroll
        this.container.addEventListener("scroll", this.handleScroll.bind(this));
      
        
        // header resize
        // this.headerCanvas.addEventListener("click",this.handleHeaderClick.bind(this));
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

        // sentinel
        // this.initIntersectionObserver();
        // alert(this.getColumnCount());
        this.visibleRowsCount = this.getRowCount();
        this.visibleColumnsCount = this.getColumnCount();
        this.cachedData = new Map();
        this.lastScrollTop = 0;
        this.lastScrollLeft = 0;

        this.dataMap = new Map();


        this.initializeChildContainer();

        this.updateCanvasSizes();
        this.drawTable();

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
                    // setTimeout(async () => {
                    //     this.clearI();
                    // }, 1000);
                    clearInterval(id);
                }
            } catch (error) {
                console.error("Error while polling:", error);
            }
        }, 300);

        // clearI(){
        //     clearInterval(id);
        // }
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

        // console.log(formData);
        
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
        
        // console.log(formData);
    }

   
    handleDataDown(event) {
        const rect = this.dataCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const colIndex = this.getPositionX(x);
        const rowIndex = this.getPositionY(y);
                                         
        this.multiSelectState.data.clear();

        if (rowIndex >= 0 && rowIndex < this.sampleData.length && colIndex > 0 && colIndex < this.headers.length) {
            this.multiSelectState.isSelecting = true;
            this.multiSelectState.startCell = { row: rowIndex, col: colIndex };
            this.multiSelectState.endCell = { row: rowIndex, col: colIndex };
            const cellKey = `${rowIndex}|${colIndex}`;

            // this.multiSelectState.isAddingToSelection = !this.multiSelectState.data.has(cellKey);

            this.updateSelection();
            this.drawData();
        }
    }

    
    handleDataMove(event) {
        if (this.multiSelectState.isSelecting) {
            const rect = this.dataCanvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const colIndex = this.getPositionX(x);
            const rowIndex = this.getPositionY(y);

            if (rowIndex >= 0 && rowIndex < this.sampleData.length && colIndex > 0 && colIndex < this.headers.length) {
                // this.multiSelectState
                this.multiSelectState.endCell = { row: rowIndex, col: colIndex };
                const cellkey = `${rowIndex}|${colIndex}`;
                this.updateSelection();
                this.drawData();
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
                const cellKey = `${row}|${col}`;
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
            if(x < cumulativeWidth){
                return i;
            }
        }
        return -1;
    }

    getPositionY(y){
        let cumulativeHeight = this.sampleData[0].height;
        for(let i=1;i<this.sampleData.length;i++){
            cumulativeHeight += this.sampleData[i].height;
            if(y < cumulativeHeight){
                return i;
            }
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
        


        // this.headerCanvas.width = this.headers[0].width+ totalWidth;
        // this.headerCanvas.height = this.headerHeight;
        // this.rowNumberCanvas.width = this.headers[0].width;
        // this.rowNumberCanvas.height = this.headerHeight + this.cellHeight * this.sampleData.length;

        //  data canvas fixed now
        this.dataCanvas.width =  totalWidth;
        this.dataCanvas.height = this.container.clientHeight+this.headerHeight;
    }

    drawTable() {
        // this.drawHeader();
        // this.drawRowCanvas();
            this.drawData();
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

    drawRowCanvas() {
        this.cRow.clearRect(0, 0, this.rowNumberCanvas.width, this.rowNumberCanvas.height);
        let currentY = this.headerHeight;
        this.sampleData.forEach((data, rowIndex) => {
            const newHeight = data.height ? data.height:30;
            new TableCell(0, currentY, this.headers[0].width,newHeight , rowIndex + 1, true).draw(this.cRow);
            currentY += newHeight;
        });
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
       // Draw data
     
    
        // if (xcord !== null && ycord !== null && i !== null && j !== null && inputWidth !== null) {
        //     const existingInput = document.querySelector('#canvasContainer input');
        //     if (existingInput) {
        //         existingInput.remove();
        //     }
    
        //     const input = document.createElement("input");
        //     input.placeholder = `${i}${j}`;
        //     input.autofocus = true;
        //     input.style.top = `${ycord}px`
        //     input.style.left = `${xcord}px`
        //     input.style.position = "absolute";
        //     input.style.width = `${inputWidth - 7}px`;
        //     input.style.height = `${this.sampleData[i].height - 5}px`; // Use dynamic row height here
        //     input.style.border = "2px solid blue"; // Set border color to blue
        //     input.style.borderRadius = "3px";
        //     input.style.fontSize = "14px";
    
        //     document.getElementById('canvasContainer').appendChild(input);
        // }
    // }
    

    
    handleScroll() {

        // console.log(this.sampleData)
        const scrollLeft = this.container.scrollLeft;
        const scrollTop = this.container.scrollTop;

        this.headerCanvas.style.top = `${scrollTop}px`;
        this.rowNumberCanvas.style.left = `${scrollLeft}px`;
        this.dataCanvas.style.top = `${scrollTop}px`


        const scrollDirection = scrollTop > this.lastScrollTop ? 'down' : 'up';
        console.log(scrollDirection);

        // console.log(this.childContainer.clientHeight)
        // if(scrollTop <= this.headerHeight-){

        //     this.lastScrollTop = scrollTop;
        //     this.lastScrollLeft = scrollLeft;

            // this.updateVisibleArea(scrollLeft, scrollTop,scrollDirection);
        // }

        // if (scrollTop - this.lastScrollTop  >= this.headerHeight) {
            // alert(scrollTop + this.container.clientHeight,this.childContainer.clientHeight);
            // console.log("I'm here")
            // this.childContainer.style.height = `${scrollTop + this.container.clientHeight}px`;
            // this.childContainer.style.width = `${this.container.clientWidth + scrollLeft}px`;

            // console.log(this.childContainer.clientHeight)
            
               
            

            this.updateVisibleArea(scrollLeft, scrollTop,scrollDirection);
            // this.childupdate(scrollLeft,scrollTop)
        // }
    }

    getVisibleArea(scrollX, scrollY) {
        const startRow = Math.floor(scrollY / this.headerHeight);
        const endRow = Math.min(Math.ceil((scrollY + this.container.clientHeight+30) / this.headerHeight), this.sampleData.length);
        const startCol = Math.floor(scrollX / this.headers[0].width);
        const endCol = Math.min(Math.ceil((scrollX + this.container.clientWidth+100) / this.headers[0].width), this.headers.length);

        return { startRow, endRow, startCol, endCol };
    }

    // storeData() {
    //     for (let row = 0; row < this.sampleData.length; row++) {
    //             this.dataMap.set(`${row}`, this.sampleData[row]);
    //     }
    //     // alert("data stored")
    //     console.log(this.dataMap);
    // }

    async updateVisibleArea(scrollLeft, scrollTop,scrollDirection) {
        const visibleArea = this.getVisibleArea(scrollLeft,scrollTop);
        console.log(visibleArea);
        console.log("Update Area called");

        // console.log(scrollTop + this.container.clientHeight,(this.childContainer.style.height - this.headerHeight - 60));
        console.log(`Scroll Height: ${this.childContainer.scrollHeight}`)

        if(scrollDirection === "up"){
            // alert("scrolled u[")
            console.log(visibleArea)
            if(scrollTop <= this.headerHeight){
                    // alert("data called")
                    console.log("data called")
                    // this.batchStart = Math.max(0, this.batchStart - 30);
                    // let data = await this.getData(this.batchStart);
                    // if (data.length > 0) {
                    //     this.sampleData.unshift(...data);
                    //     // Adjust scroll position to keep the view stable
                    //     this.container.scrollTop += data.length * this.headerHeight;
                    // }
                    // this.drawData(visibleArea);
            }
            
        }else if(scrollDirection === "down"){
            if (scrollTop + this.container.clientHeight >= (this.sampleData.length * this.headerHeight)) {
                // alert('data called')
                this.batchStart += 30;
                const data = await this.getData(this.batchStart);
    
                if (data.length > 0) {
                    this.sampleData.push(...data);
                    // this.storeData();
                } else {
                    this.addRows();
                }
                this.updateCanvasSizes(scrollTop);
            }
    
            if (scrollLeft + this.container.clientWidth >= this.dataCanvas.width) {
                this.addColumns();
            }
            // 
            // this.drawData(visibleArea);
        }
        
        this.drawData(visibleArea);
        

        // this.drawTable();
        
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
    
        let colIndex = -1;
        let cumulativeWidth = this.headers[0].width;
        
        for (let i = 1; i < this.headers.length; i++) {
            cumulativeWidth += this.headers[i].width;
            if (x < cumulativeWidth) {
                colIndex = i;
                
                break;
            }
        }

    
        // If we haven't found a column, it means we've clicked beyond the last column
        // if (colIndex === -1) {
        //     colIndex = this.headers.length - 1;
        // }
    
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
   

}