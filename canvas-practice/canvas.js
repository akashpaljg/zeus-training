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
            c.fillText(line, this.x + 5, this.y + 20 + (index * 15));
        });
    }
}

class CanvasTable {
    constructor(containerId, headers, sampleData) {
        this.container = document.getElementById(containerId);
        this.headerCanvas = document.getElementById('headerCanvas');
        this.rowNumberCanvas = document.getElementById('rowNumbersCanvas');
        this.dataCanvas = document.getElementById('dataCanvas');
        this.firstEle = document.getElementById('firstElem');
        this.cHeader = this.headerCanvas.getContext("2d");
        this.cRow = this.rowNumberCanvas.getContext("2d");
        this.cData = this.dataCanvas.getContext("2d");

        this.dataCanvas.addEventListener("dblclick", this.handleDbClick.bind(this));
        this.dataCanvas.addEventListener("mousedown",this.handleDataDown.bind(this));
        this.dataCanvas.addEventListener("mousemove",this.handleDataDown.bind(this));
        // this.dataCanvas.addEventListener("mouseup",this.handleDataUp.bind(this));
        this.container.addEventListener("scroll", this.handleScroll.bind(this));
      
        
        // drag and drop
        // this.headerCanvas.addEventListener("click",this.handleHeaderClick.bind(this));
        this.headerCanvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.headerCanvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.headerCanvas.addEventListener("mouseup", this.handleMouseUp.bind(this));

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

        this.dragState = {
            isDragging: false,
            columnIndex: -1,
            startX: 0,
            currentX: 0
        };

        this.sampleData = sampleData;
        this.resizeState = { isResizing: false, columnIndex: -1, startX: 0 };

        this.firstEle.style.width = `6.2rem`;
        this.firstEle.style.height = `1.8rem`;
        this.firstEle.style.backgroundColor = 'lightgray';

        this.updateCanvasSizes();
        this.drawTable();
    }

    handleDataDown(event){
        const rect = this.dataCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // console.log(x, y);
        const colIndex = this.getPositionX(x);
        const rowIndex = Math.floor((y-this.headerHeight) / this.cellHeight);

        if (rowIndex >= 0 && rowIndex < this.sampleData.length && colIndex > 0 && colIndex < this.headers.length) {
            const xcord = this.getCumulativeWidth - this.headers[colIndex].width;
            const ycord = rowIndex * this.cellHeight + this.headerHeight ;
    
            const cellValue = this.sampleData[rowIndex][this.headers[colIndex].data];
            this.drawData(xcord, ycord, this.headers[colIndex].data, rowIndex + 1, this.headers[colIndex].width,colIndex-1);
        }


        console.log(`colIndex: ${colIndex} rowIndex: ${rowIndex}`)
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
        }
    }

    createDraggedColumnImage(columnIndex) {
        const draggedColumn = document.createElement('canvas');
        draggedColumn.id = 'draggedColumn';
        draggedColumn.width = this.headers[columnIndex].width;
        draggedColumn.height = this.headerCanvas.height + this.dataCanvas.height;
        draggedColumn.style.position = 'absolute';
        draggedColumn.style.top='0';
        // draggedColumn.style.left=`${this.headers[0].width}`
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
        // Swap headers
        const tempHeader = this.headers[fromIndex];
     
        this.headers.splice(fromIndex, 1);
        this.headers.splice(toIndex, 0, tempHeader);

        // Swap data
        this.sampleData = this.sampleData.map(row => {
            // console.log(row);
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

    updateCanvasSizes() {
        const totalWidth = this.headers.reduce((sum, header) => sum + header.width, 0);
        this.headerCanvas.width = this.headers[0].width+ totalWidth;
        this.headerCanvas.height = this.headerHeight;
        this.rowNumberCanvas.width = this.headers[0].width;
        this.rowNumberCanvas.height = this.headerHeight + this.cellHeight * this.sampleData.length;
        this.dataCanvas.width =  totalWidth;
        this.dataCanvas.height = this.headerHeight+ this.cellHeight * this.sampleData.length;
    }

    drawTable() {
        this.drawHeader();
        this.drawRowCanvas();
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
            // this.dragState.isDragging = false;
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

    handleMouseUp() {
        this.resizeState.isResizing = false;
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
        this.sampleData.forEach((data, rowIndex) => {
            new TableCell(0, this.headerHeight + rowIndex * this.cellHeight, this.headers[0].width, this.cellHeight, rowIndex + 1, true).draw(this.cRow);
        });
    }

    drawData(xcord = null, ycord = null, i = null, j = null,inputWidth = null,columnIndex=null) {
        let x = 0;
        this.cData.clearRect(0, 0, this.dataCanvas.width, this.dataCanvas.height);
        
        this.sampleData.forEach((rowData, rowIndex) => {
            x = this.headers[0].width;
            this.headers.forEach((header, colIndex) => {
                if (colIndex > 0) {  // Skip the first column (row numbers)
                    new TableCell(x, this.headerHeight + rowIndex * this.cellHeight, header.width, this.cellHeight, "").draw(this.cData);
                    x += header.width;
                }
                if(j !== null && colIndex === columnIndex && (j-1) === rowIndex){
                    new TableCell(x, this.headerHeight + rowIndex * this.cellHeight, header.width, this.cellHeight, "").draw(this.cData,"lightblue");
                    x += header.width;
                }
            });
        });


        if (xcord !== null && ycord !== null && i !== null && j !== null && inputWidth !== null) {
            const existingInput = document.querySelector('#canvasContainer input');
            if (existingInput) {
                existingInput.remove();
            }

            // console.log("Cell Height", this.cellHeight);
            // console.log("Cell Width", this.headers[j].width);

            const input = document.createElement("input");
            input.placeholder = `${i}${j}`;
            input.autofocus = true;
            input.style.top = `${ycord}px`
            input.style.left = `${xcord}px`
            input.style.position = "absolute";
            input.style.width = `${inputWidth-7}px`;
            input.style.height = `${this.cellHeight-5}px`;
            input.style.border = "2px solid blue"; // Set border color to blue
            input.style.borderRadius = "3px";
            input.style.fontSize = "14px";
            

            document.getElementById('canvasContainer').appendChild(input);
        }
    }

    handleScroll() {
        const scrollLeft = this.container.scrollLeft;
        const scrollTop = this.container.scrollTop;

        // how much pixels have been covered
        console.log(`Scroll Left: ${scrollLeft} Scroll Top: ${scrollTop} Container Height: ${this.container.clientHeight} Canvas Height: ${this.dataCanvas.height}`);

        this.headerCanvas.style.top = `${scrollTop}px`;

        this.rowNumberCanvas.style.left =`${scrollLeft}px`;

        const headerOffset = scrollTop % this.headerHeight;
        const rowNumberOffset = scrollLeft % this.headers[0].width;

        console.log(`HeaderOffest : ${headerOffset} RowNumber Offset : ${rowNumberOffset}`);
        // tells that how much part of a cell is covered

                this.headerCanvas.style.top = `${scrollTop}px`;
                this.rowNumberCanvas.style.left = `${scrollLeft}px`;

                if (scrollTop + this.container.clientHeight >= this.dataCanvas.height) {
                    this.addRows();
                }

                if (scrollLeft + this.container.clientWidth >= this.dataCanvas.width) {
                    this.addColumns();
                }
        
                this.drawTable();
        // this.drawFirstColumn(scrollTop);
    }

    addRows(){
        for (let i = 0; i < 10; i++) {
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
    


    // handleClick(event) {
    //     const rect = this.dataCanvas.getBoundingClientRect();
    //     const x = event.clientX - rect.left;
    //     const y = event.clientY - rect.top;

    //     // console.log(x, y);

    //     const colIndex = Math.floor(x / this.headers[0].width);
    //     const rowIndex = Math.floor((y - this.headerHeight) / this.cellHeight);

    //     // console.log(colIndex);
    //     // console.log(rowIndex);

    //     const xcord = colIndex * this.headers[0].width + window.pageXOffset;
    //     const ycord = rowIndex * this.cellHeight + this.headerHeight + window.pageYOffset;

    //     // console.log(xcord);
    //     // console.log(ycord);

    //     if (rowIndex >= 0 && rowIndex < this.sampleData.length && colIndex >= 0 && colIndex < this.headers.length-1) {
    //         const cellValue = this.sampleData[rowIndex][this.headers[colIndex]];

    //         // console.log(this.sampleData[rowIndex]);

    //         // console.log(this.headers[colIndex]);
    //         // console.log(rowIndex + 1);

    //         this.drawData(xcord, ycord,this.headers[colIndex].data, rowIndex + 1,this.headers[colIndex].width);

    //         // console.log(this.sampleData[rowIndex][this.headers[colIndex]]);
    //         // alert(`Cell value: ${cellValue}`);
    //     }
    // }

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
    
}

window.onload = function () {
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
      

    let sampleData = [];
    for (let i = 0; i < 200; i++) {
        let row = {};
        headers.forEach((header, index) => {
            row[header.data] = "";
        });
        sampleData.push(row);
    }

    new CanvasTable('canvasContainer', headers, sampleData);
}