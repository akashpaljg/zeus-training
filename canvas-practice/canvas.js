// class TableCell {
//             constructor(x, y, width, height, text, isHeader = false, color = "lightgray") {
//                 this.x = x;
//                 this.y = y;
//                 this.width = width;
//                 this.height = height;
//                 this.text = text;
//                 this.isHeader = isHeader;
//                 this.color = color;
//             }

//             static getLines(ctx, text, maxWidth) {
//                 let lines = [];
//                 let currentLine = '';

//                 for (let char of text.toString()) {
//                     let testLine = currentLine + char;
//                     let width = ctx.measureText(testLine).width;

//                     if (width > maxWidth && currentLine !== '') {
//                         lines.push(currentLine);
//                         currentLine = char;
//                     } else {
//                         currentLine = testLine;
//                     }
//                 }

//                 if (currentLine !== '') {
//                     lines.push(currentLine);
//                 }

//                 return lines;
//             }

//             draw(c) {
//                 c.strokeStyle = 'black';
//                 c.lineWidth = 2;
//                 c.clearRect(this.x,this.y,this.width, this.height);
//                 c.strokeRect(this.x, this.y, this.width, this.height);

//                 if (this.isHeader) {
//                     c.fillStyle = this.color;
//                     c.fillRect(this.x, this.y, this.width, this.height);
//                 }

//                 c.fillStyle = this.isHeader ? 'green' : 'black';
//                 c.font = this.isHeader ? 'bold 14px Arial' : '12px Arial';

//                 const lines = TableCell.getLines(c, this.text, this.width - 10);
//                 lines.forEach((line, index) => {
//                     c.fillText(line, this.x + 5, this.y + 20 + (index * 15));
//                 });
//             }
//         }

//         class CanvasTable {
//             constructor(containerId, headers, sampleData) {
//                 this.container = document.getElementById(containerId);
//                 this.headerCanvas = document.getElementById('headerCanvas');
//                 this.rowNumbersCanvas = document.getElementById('rowNumbersCanvas');
//                 this.dataCanvas = document.getElementById('dataCanvas');

//                 this.cHeader = this.headerCanvas.getContext("2d");
//                 this.cRowNumbers = this.rowNumbersCanvas.getContext("2d");
//                 this.cData = this.dataCanvas.getContext("2d");

//                 this.container.addEventListener("scroll", this.handleScroll.bind(this));
//                 this.dataCanvas.addEventListener("click", this.handleClick.bind(this));

//                 this.cellHeight = 30;
//                 this.headerHeight = 30;
//                 this.headers = headers;
//                 this.sampleData = sampleData;
//                 this.cellWidth = 100; // Fixed width for cells

//                 // Adjust canvas sizes based on data
//                 this.headerCanvas.width = this.cellWidth * this.headers.length;
//                 this.headerCanvas.height = this.headerHeight;
//                 this.rowNumbersCanvas.width = this.cellWidth;
//                 this.rowNumbersCanvas.height = this.headerHeight + this.cellHeight * this.sampleData.length;
//                 this.dataCanvas.width = this.cellWidth * this.headers.length;
//                 this.dataCanvas.height = this.headerHeight + this.cellHeight * this.sampleData.length;

//                 // Draw table
//                 this.drawHeader();
//                 this.drawRowNumbers();
//                 this.drawData();
//             }

//             drawHeader() {
//                 this.headers.forEach((header, index) => {
//                     new TableCell(index * this.cellWidth, 0, this.cellWidth, this.headerHeight, header, true).draw(this.cHeader);
//                 });
//             }

//             drawRowNumbers() {
//                 this.sampleData.forEach((rowData, rowIndex) => {
//                     new TableCell(0, this.headerHeight + rowIndex * this.cellHeight, this.cellWidth, this.cellHeight, rowIndex + 1, true, "lightgray").draw(this.cRowNumbers);
//                 });
//             }

//             drawData(xcord = null, ycord = null, colorRowIndex = null, i = null, j = null) {
//                 this.sampleData.forEach((rowData, rowIndex) => {
//                     this.headers.forEach((header, colIndex) => {
//                         new TableCell(colIndex * this.cellWidth, this.headerHeight + rowIndex * this.cellHeight, this.cellWidth, this.cellHeight, rowData[header]).draw(this.cData);
//                     });
//                 });

//                 if (xcord !== null && ycord !== null && i !== null && j !== null) {
//                     const existingInput = document.querySelector('#canvasContainer input');
//                     if (existingInput) {
//                         existingInput.remove();
//                     }

//                     const input = document.createElement("input");
//                     input.placeholder = `${i}${j}`;

//                     input.style.position = "absolute";
//                     input.style.top = `${ycord}px`;
//                     input.style.left = `${xcord}px`;
//                     input.style.width = `${this.cellWidth - 7}px`;
//                     input.style.height = `${this.cellHeight - 5}px`;
//                     input.style.border = "3px solid blue"; // Set border color to blue
//                     input.style.borderRadius = "5px";
//                     input.style.fontSize = "14px";
//                     input.autofocus = true;

//                     document.getElementById('canvasContainer').appendChild(input);
//                 }
//             }

//             handleScroll() {
//                 const scrollLeft = this.container.scrollLeft;
//                 const scrollTop = this.container.scrollTop;

//                 this.headerCanvas.style.left = `${-scrollLeft}px`;
//                 this.rowNumbersCanvas.style.top = `${-scrollTop}px`;

//                 this.drawHeader();
//                 this.drawRowNumbers();
//             }

//             handleClick(event) {
//                 const rect = this.dataCanvas.getBoundingClientRect();
//                 const x = event.clientX - rect.left;
//                 const y = event.clientY - rect.top;

//                 const colIndex = Math.floor(x / this.cellWidth);
//                 const rowIndex = Math.floor((y - this.headerHeight) / this.cellHeight);

//                 const xcord = colIndex * this.cellWidth + rect.left + window.pageXOffset;
//                 const ycord = rowIndex * this.cellHeight + rect.top + this.headerHeight + window.pageYOffset;

//                 if (rowIndex >= 0 && rowIndex < this.sampleData.length && colIndex >= 0 && colIndex < this.headers.length) {
//                     const cellValue = this.sampleData[rowIndex][this.headers[colIndex]];
//                     this.drawData(xcord, ycord, rowIndex, rowIndex + 1, this.headers[colIndex]);
//                 }
//             }
//         }

//         window.onload = function () {
//             const headers = ["#", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

//             let sampleData = [];
//             for (let i = 0; i < 200; i++) {
//                 let row = {};
//                 headers.forEach((header, index) => {
//                     if (header !== "#") {
//                         row[header] = ""; // Fill with empty data
//                     } else {
//                         row[header] = i + 1;
//                     }
//                 });
//                 sampleData.push(row);
//             }

//             new CanvasTable('canvasContainer', headers, sampleData);
//         }

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

    draw(c) {
        c.strokeStyle = 'black';
        c.lineWidth = 2;
        c.clearRect(this.x,this.y,this.width, this.height);
        c.strokeRect(this.x, this.y, this.width, this.height);

        if (this.isHeader) {
            c.fillStyle = this.color;
            c.fillRect(this.x, this.y, this.width, this.height);
        }

        c.fillStyle = this.isHeader ? 'green' : 'black';
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

        this.container.addEventListener("scroll", this.handleScroll.bind(this));
        this.dataCanvas.addEventListener("click", this.handleClick.bind(this));
        this.headerCanvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.headerCanvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.headerCanvas.addEventListener("mouseup", this.handleMouseUp.bind(this));

        this.cellHeight = 30;
        this.headerHeight = 30;
        this.resizeThreshold = 5;

        this.headers = headers.map(header => ({
            ...header,
            width: header.width || 100,
            minWidth: header.minWidth || 50,
            maxWidth: header.maxWidth || 500
        }));

        this.sampleData = sampleData;
        this.resizeState = { isResizing: false, columnIndex: -1, startX: 0 };

        this.firstEle.style.width = `6.2rem`;
        this.firstEle.style.height = `1.8rem`;
        this.firstEle.style.backgroundColor = 'lightgray';

        this.updateCanvasSizes();
        this.drawTable();
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

    drawHeader() {
        this.cHeader.clearRect(0, 0, this.headerCanvas.width, this.headerCanvas.height);
        let x = 0;
        this.headers.forEach((header, index) => {
            new TableCell(x, 0, header.width, this.headerHeight, header.data, true).draw(this.cHeader);
            x += header.width;
        });
    }


    drawRowCanvas() {
        this.cRow.clearRect(0, 0, this.rowNumberCanvas.width, this.rowNumberCanvas.height);
        this.sampleData.forEach((data, rowIndex) => {
            new TableCell(0, this.headerHeight + rowIndex * this.cellHeight, this.headers[0].width, this.cellHeight, rowIndex + 1, true).draw(this.cRow);
        });
    }

    drawData(xcord = null, ycord = null, i = null, j = null,inputWidth = null) {
        let x = 0;
        this.cData.clearRect(0, 0, this.dataCanvas.width, this.dataCanvas.height);
        
        this.sampleData.forEach((rowData, rowIndex) => {
            x = this.headers[0].width;
            this.headers.forEach((header, colIndex) => {
                if (colIndex > 0) {  // Skip the first column (row numbers)
                    new TableCell(x, this.headerHeight + rowIndex * this.cellHeight, header.width, this.cellHeight, "").draw(this.cData);
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

            input.style.position = "absolute";
            input.style.top = `${ycord}px`;
            input.style.left = `${xcord}px`;
            input.style.width = `${inputWidth-7}px`;
            input.style.height = `${this.cellHeight-5}px`;
            input.style.border = "3px solid blue"; // Set border color to blue
            input.style.borderRadius = "5px";
            input.style.fontSize = "14px";
            input.autofocus = true;

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

    handleClick(event) {
        const rect = this.dataCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
    
        let colIndex = -1;
        let cumulativeWidth = this.headers[0].width; // Start with the width of the first column (row numbers)
    
        for (let i = 1; i < this.headers.length; i++) { // Start from the second column
            cumulativeWidth += this.headers[i].width;
            if (x < cumulativeWidth) {
                colIndex = i;
                break;
            }
        }
    
        const rowIndex = Math.floor((y - this.headerHeight) / this.cellHeight);
    
        if (rowIndex >= 0 && rowIndex < this.sampleData.length) { // colIndex > 0 to skip the first column
            const xcord = cumulativeWidth - this.headers[colIndex].width + window.pageXOffset;
            const ycord = rowIndex * this.cellHeight + this.headerHeight + window.pageYOffset;
    
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