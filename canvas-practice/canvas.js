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
            constructor(id, headers, sampleData) {
                this.canvas = document.getElementById(id);
                this.container = this.canvas.parentElement;
                this.container.addEventListener("scroll", this.drawHeader.bind(this));
                this.canvas.addEventListener("click", this.handleClick.bind(this));
                this.c = this.canvas.getContext("2d");

                this.cellHeight = 30;
                this.headerHeight = 30;
                this.headers = headers;
                this.sampleData = sampleData;
                this.cellWidth = 100; // Fixed width for cells

                // Adjust canvas size based on data
                this.canvas.width = this.cellWidth * this.headers.length;
                this.canvas.height = this.headerHeight + this.cellHeight * this.sampleData.length;

                // Draw table
                this.drawHeader();
                this.drawData();
            }

            drawHeader() {
                // alert("Draw Header ran");
                this.headers.forEach((header, index) => {
                    new TableCell(index * this.cellWidth, 0, this.cellWidth, this.headerHeight, header, true).draw(this.c);
                });
            }

            coloredHeader(colIndex, color) {
                this.headers.forEach((header, index) => {
                    if (index === colIndex) {
                        new TableCell(index * this.cellWidth, 0, this.cellWidth, this.headerHeight, header, true, color).draw(this.c);
                    } else {
                        new TableCell(index * this.cellWidth, 0, this.cellWidth, this.headerHeight, header, true).draw(this.c);
                    }
                });
            }

            drawData(xcord = null, ycord = null,colorRowIndex = null,i=null,j=null) {
                const colors = "lightblue";
                this.sampleData.forEach((rowData, rowIndex) => {
                    this.headers.forEach((header, colIndex) => {
                        if (colIndex === 0) {
                            if(colorRowIndex && rowIndex === colorRowIndex){
                                new TableCell(colIndex * this.cellWidth, this.headerHeight + rowIndex * this.cellHeight, this.cellWidth, this.cellHeight, rowIndex + 1,true,colors).draw(this.c);
                            }else{
                                new TableCell(colIndex * this.cellWidth, this.headerHeight + rowIndex * this.cellHeight, this.cellWidth, this.cellHeight, rowIndex + 1,true).draw(this.c);
                            }
                            
                        } else {
                            new TableCell(colIndex * this.cellWidth, this.headerHeight + rowIndex * this.cellHeight, this.cellWidth, this.cellHeight, rowData[header]).draw(this.c);
                        }
                        // make changes here only, if wanted to change the border color of edited field
                    });
                });

                if (xcord !== null && ycord !== null && i!== null && j!== null) {
                    const existingInput = document.querySelector('#canvasContainer input');
                    if (existingInput) {
                        existingInput.remove();
                    }

                    console.log("Cell Height", this.cellHeight);
                    console.log("Cell Width", this.cellWidth);

               
                    const input = document.createElement("input");
                    input.placeholder = `${i}${j}`;
                    
                    input.style.position = "absolute";
                    input.style.top = `${ycord}px`;
                    input.style.left = `${xcord}px`;
                    input.style.width = `${this.cellWidth-7}px`;
                    input.style.height = `${this.cellHeight-5}px`;
                    input.style.border = "3px solid blue"; // Set border color to blue
                    input.style.borderRadius = "5px";
                    input.style.fontSize = "14px";
                    input.autofocus = true;

                    document.getElementById('canvasContainer').appendChild(input);
                }
            }

            handleClick(event) {
                const rect = this.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                const colIndex = Math.floor(x / this.cellWidth);
                const rowIndex = Math.floor((y - this.headerHeight) / this.cellHeight);

                const xcord = colIndex * this.cellWidth + rect.left + window.pageXOffset;
                const ycord = rowIndex * this.cellHeight + rect.top + this.headerHeight + window.pageYOffset;

                if (rowIndex >= 0 && rowIndex < this.sampleData.length && colIndex >= 0 && colIndex < this.headers.length) {
                    const cellValue = this.sampleData[rowIndex][this.headers[colIndex]];
                    this.coloredHeader(colIndex, "lightblue");
                    console.log(this.sampleData[rowIndex]);

                    console.log(this.headers[colIndex]);
                    console.log(rowIndex+1);
                    
                    this.drawData(xcord, ycord,rowIndex,this.headers[colIndex],rowIndex+1);
                    
                    console.log(this.sampleData[rowIndex][this.headers[colIndex]]);
                    // alert(`Cell value: ${cellValue}`);
                }
            }
        }

        window.onload = function () {
            const headers = ["#", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

            let sampleData = [];
            for (let i = 0; i < 200; i++) {
                let row = {};
                headers.forEach((header, index) => {
                    if (header !== "#") {
                        row[header] = ""; // Fill with empty data
                    }else{
                        row[header] = i+1;
                    }
                });
                sampleData.push(row);
            }

            new CanvasTable('tableCanvas', headers, sampleData);
        }