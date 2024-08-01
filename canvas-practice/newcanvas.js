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

     drawLine(x1, y1, x2, y2, c) {
        c.beginPath();
        c.lineWidth = 1;
    
        // Apply 0.5 pixel offset to coordinates
        c.moveTo(x1 , y1 );
        c.lineTo(x2 , y2 );
    
        // Stroke the line
        c.stroke();
    }
    


    drawHeaders(rows,cols,headerss,visibleArea){
        console.log(`Headers : ${headerss[0]?.width}`);
        // this.cData.clearRect(0,0,this.dataCanvas.clientWidth,this.dataCanvas.clientHeight)
        let x = 100;
        for(let c=visibleArea.startCol+1;c<visibleArea.endCol;c++){
            // console.log(x);
            this.drawLine(x+0.5,0,x+0.5,30,this.cHeader);
            x += headerss[c]?.width ? headerss[c]?.width : 100;
        }
            for(let r=0;r<=rows;r++){
                let y = r*this.cellHeight;
                this.drawLine(0,y+0.5,this.headerCanvas.clientWidth,y+0.5,this.cHeader);
            }
           
        }
    

    drawData(rows, cols, headerss,sampleDatas,visibleArea) {
        console.log(`Data : ${sampleDatas.length}`);
        this.cData.lineWidth = 0.5;  // Set line width to 1
        this.cData.strokeStyle = '#000000';  // Ensure a solid color
        this.cData.lineCap = 'butt';  // Use 'butt' for crisp edges
    
        let x = 100;  // Start at 100 to account for the initial offset
        for (let c = visibleArea.startCol; c <= visibleArea.endCol; c++) {
            x = Math.round(x);  // Round to nearest pixel
            this.cData.beginPath();
            this.cData.moveTo(x+0.5, 30+0.5);
            this.cData.lineTo(x+0.5, this.dataCanvas.clientHeight+0.5);
            this.cData.stroke();
    
            x += headerss[c+1]?.width ? headerss[c+1].width : 100;
        }
        console.log("drawing data")
        let y = 30;
        for (let r = visibleArea.startRow; r <= visibleArea.endRow; r++) {
            
            this.cData.beginPath();
            this.cData.moveTo(100.5, y+0.5);
            this.cData.lineTo(this.dataCanvas.clientWidth+0.5, y+0.5);
            this.cData.stroke();
            // y += sampleDatas[r]?.height ? sampleDatas[r].height : 30;
            console.log(`SampleData ${r} ${sampleDatas[r].height}`)
            y+= sampleDatas[r].height ? sampleDatas[r].height : 30;
        }
    }

    drawRow(rows, cols,headerss,sampleDatas,visibleArea) {
       
        console.log(`Row : ${headerss[0]?.width}`);
        
        // Draw vertical lines
        let x = 0;
        for (let c = 0; c <= cols; c++) {
            
            // console.log(x);
            this.drawLine(x+0.5, 30, x+0.5, this.rowCanvas.clientHeight,this.cRow);
            x += headerss[c]?.width ? headerss[c]?.width : 100;
        }

        // Draw horizontal lines
        let y = 30;
        for (let r = visibleArea.startRow; r <= visibleArea.endRow; r++) {
            
            
            this.drawLine(0, y+0.5,100, y+0.5,this.cRow);
            console.log(`SampleData ${r} ${sampleDatas[r].height}`)
            y+= sampleDatas[r].height ? sampleDatas[r].height : 30;

        }
    }


    drawH(headerss,visibleArea){
        
            this.drawHeaders(1,50,headerss,visibleArea);
        
    }
    drawR(headerss,sampleDatas,visibleArea){
            this.drawRow(50,1,headerss,sampleDatas,visibleArea)
    }
    drawD(headerss,sampleDatas,visibleArea){
        
            this.drawData(50,50,headerss,sampleDatas,visibleArea);
        
    }

    drawExcel(headerss,sampleDatas,visibleArea){
        console.log('Excel')
        // this.cHeader.clearRect(0,0,this.headerCanvas.clientWidth,this.headerCanvas.clientHeight);
        // this.cData.clearRect(0,0,this.dataCanvas.clientWidth,this.dataCanvas.clientHeight)
        // this.cRow.clearRect(0,0,this.rowCanvas.clientWidth,this.rowCanvas.clientHeight)
        window.requestAnimationFrame(()=>{
            // console.log('header')
            this.drawH(headerss,visibleArea);
            console.log('data')
            this.drawD(headerss,sampleDatas,visibleArea);
            console.log('row')
            this.drawR(headerss,sampleDatas,visibleArea);
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

    draw(c, color = null) {
        c.clearRect(this.x, this.y, this.width, this.height);
    
        if (color) {
            c.fillStyle = "rgba(211, 211, 211, 0.5)";
            c.fillRect(this.x, this.y, this.width, this.height);
        }
    
        c.strokeStyle = "black";
        c.lineWidth = 1;
    
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
        this.searchQuery = document.getElementById('search--email');
        this.sort = document.getElementById("pet-select");
        
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

        this.status = document.getElementById("status");


        // handleSubmitting a file
        this.submitFile.addEventListener("submit",this.handleSubmitFile.bind(this));
        this.searchQuery.addEventListener("submit",this.handleSearch.bind(this));


        // data canvas handleClick
        this.dataCanvas.addEventListener("dblclick", this.handleDbClick.bind(this));

        // data canvas multiselect
        this.dataCanvas.addEventListener("mousedown",this.handleDataDown.bind(this));
        this.dataCanvas.addEventListener("mousemove",this.handleDataMove.bind(this));
        this.dataCanvas.addEventListener("mouseup",this.handleDataUp.bind(this));
        // scroll
        this.container.addEventListener("scroll", this.handleScroll.bind(this));

        // header resize
        this.headerCanvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.headerCanvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.headerCanvas.addEventListener("mouseup", this.handleMouseUp.bind(this));

        // row resize
        this.rowNumberCanvas.addEventListener("mousedown",this.handleRowMouseDown.bind(this));
        this.rowNumberCanvas.addEventListener("mousemove",this.handleRowMouseMove.bind(this));
        this.rowNumberCanvas.addEventListener("mouseup",this.handleRowMouseUp.bind(this));
        this.sort.addEventListener("change",this.handleSorting.bind(this));

        // drag and drop
        // this.headerCanvas.addEventListener("mousedown", this.handleDragStart.bind(this));
        // document.addEventListener("mousemove", this.handleDragMove.bind(this));
        // document.addEventListener("mouseup", this.handleDragEnd.bind(this));
        

        this.cellHeight = 30;
        this.headerHeight = 30;
        this.resizeThreshold = 5;

        this.isLoading = false;

        

        this.headers = headers;
        
        // this.sampleData = new Array(50);

        this.sampleData = sampleData.map(sampleD => ({
            ...sampleD,
            height: sampleD.height !== undefined ? sampleD.height : 30,
            minHeight: sampleD.minHeight !== undefined ? sampleD.minHeight : 10,
            maxHeight: sampleD.maxHeight !== undefined ? sampleD.maxHeight : 60
        }));
        
        console.log(this.sampleData);
        



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

        this.sortingState = {
            isSorting:true,
            columnName:"Id",
            sortOrder:"asc"
        }

        this.colHeight = 30;
        
        this.resizeState = { isResizing: false, columnIndex: -1, startX: 0,startScrollLeft:0 };
        this.rowResizeState = {isResizing:false,rowIndex:-1,startY:0,startScrollTop:0}


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

        this.visibleArea = {
            startRow : 0,
            endRow:Math.ceil(this.container.clientHeight/this.headerHeight),
            startCol:0,
            endCol:Math.ceil(this.container.clientWidth/this.headers[0].width)
        }


        this.initializeChildContainer();

        this.updateCanvasSizes();
        this.drawTable(headers,this.visibleArea); 
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
        this.Polling(fid,event);
    }catch(error){
        console.error(error);
    }
    }

    async handleSearch(event){
       
        event.preventDefault();
        console.log(event.target.query.value);
        const query = event.target.query.value;
        // return;
     
        try{
            console.log("Searching");
            let res = await fetch(`http://localhost:5103/api/check/search/${query}`);
            const response = await res.json();
            console.log(response);

            let searchedData = [{
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
                height:30,minHeight:10,maxHeight:60
            }];

            if (response.data.length > 0) {
                response.data.map((d)=>{
                    searchedData.push(
                        {
                            ...d,
                            height:30,minHeight:10,maxHeight:60
                        }
                    )
                })
            } else {
                this.addRows();
                return;
            }

            this.sampleData = searchedData;
            console.log(this.sampleData)
            this.addRows();
            console.log("I'm above updating canvas size")
            this.updateCanvasSizes(0);
            console.log("I'm drawing table")
            this.visibleArea = {
                startRow : 0,
                endRow:Math.ceil(this.container.clientHeight/this.headerHeight),
                startCol:0,
                endCol:Math.ceil(this.container.clientWidth/this.headers[0].width)
            }
            this.drawTable(this.headers,this.visibleArea);
            console.log("Huu Done")

        }catch(error){
            console.error(error);
        }finally{
            console.log("searched")
        }
    }

    async handleSorting(event) {
        try {
            console.log(event.target.value);
    
            // Update sorting state
            this.sortingState = {
                isSorting: true,
                columnName: event.target.value || "Id",
                sortOrder: "asc"
            };
    
            // Reset batch start
            this.batchStart = 0;
            this.container.scrollTop = 0;
            this.container.scrollLeft = 0;
    
            // Reset visible area
            this.visibleArea = {
                startRow: 0,
                endRow: Math.ceil(this.container.clientHeight / this.headerHeight),
                startCol: 0,
                endCol: Math.ceil(this.container.clientWidth / this.headers[0].width)
            };
    
            // Fetch sorted data
            const data = await this.getData(this.batchStart);
    
            // Prepare sorted data with additional properties
            let sortedData = [{
                id: "Id",
                emailId: "EmailId",
                name: "Name",
                country: "Country",
                state: "State",
                city: "City",
                telephoneNumber: "TelephoneNumber",
                addressLine1: "AddressLine1",
                addressLine2: "AddressLine2",
                dateOfBirth: "DateOfBirth",
                fY2019_20: "FY2019_20",
                fY2020_21: "FY2020_21",
                fY2021_22: "FY2021_22",
                fY2022_23: "FY2022_23",
                fY2023_24: "FY2023_24",
                height: 30,
                minHeight: 10,
                maxHeight: 60
            }];
    
            if (data.length > 0) {
                data.forEach(d => {
                    sortedData.push({
                        ...d,
                        height: 30,
                        minHeight: 10,
                        maxHeight: 60
                    });
                });
            } else {
                this.addRows();
                return;
            }
    
            // Update sample data
            this.sampleData = sortedData;
    
            // Clear canvas
            // this.clearCanvas();
    
            // Update canvas sizes
            this.updateCanvasSizes();
    
            // Draw table with new data
            this.drawTable(this.headers, this.visibleArea);
    
            console.log(this.sampleData);
            console.log(this.sortingState);
        } catch (error) {
            console.log(error);
        }
    }
    
    // Add a method to clear the canvas
    // clearCanvas() {
    //     const ctx = this.canvas.getContext('2d');
    //     ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // }
    

    // async handleSorting(event){
    //     event.preventDefault();
    //     console.log(event.target.query.value);
    //     const query = event.target.query.value;
    //     // return;
     
    //     try{
    //         console.log("Searching");
    //         let res = await fetch(`http://localhost:5103/api/check/sort/${query}`);
    //         const response = await res.json();
    //         console.log(response);

    //         let searchedData = [{
    //             id:"Id",
    //             emailId:"EmailId",
    //             name:"Name",
    //             country:"Country",
    //             state:"State",
    //             city:"City",
    //             telephoneNumber:"TelephoneNumber",
    //             addressLine1:"AddressLine1",
    //             addressLine2:"AddressLine2",
    //             dateOfBirth:"DateOfBirth",
    //             fY2019_20:"FY2019_20",
    //             fY2020_21:"FY2020_21",
    //             fY2021_22:"FY2021_22",
    //             fY2022_23:"FY2022_23",
    //             fY2023_24:"FY2023_24",
    //             height:30,minHeight:10,maxHeight:60
    //         }];

    //         if (response.data.length > 0) {
    //             response.data.map((d)=>{
    //                 searchedData.push(
    //                     {
    //                         ...d,
    //                         height:30,minHeight:10,maxHeight:60
    //                     }
    //                 )
    //             })
    //         } else {
    //             this.addRows();
    //             return;
    //         }

    //         this.sampleData = searchedData;
    //         console.log(this.sampleData)
    //         this.addRows();
    //         console.log("I'm above updating canvas size")
    //         this.updateCanvasSizes(0);
    //         console.log("I'm drawing table")
    //         this.visibleArea = {
    //             startRow : 0,
    //             endRow:Math.ceil(this.container.clientHeight/this.headerHeight),
    //             startCol:0,
    //             endCol:Math.ceil(this.container.clientWidth/this.headers[0].width)
    //         }
    //         this.drawTable(this.headers,this.visibleArea);
    //         console.log("Huu Done")

    //     }catch(error){
    //         console.error(error);
    //     }finally{
    //         console.log("searched")
    //     }
    // }

   
    handleDataDown(event) {
        const rect = this.dataCanvas.getBoundingClientRect();
        // alert(this.visibleArea.startCol)
        let width = (this.visibleArea.startCol) < 0 ? 0: this.getCumulativeWidthTillColumn(this.visibleArea.startCol);
        const x = (event.clientX - rect.left ) + width;
        let height = this.visibleArea.startRow < 0 ? 0 : this.getCumulativeHeightTillRow(this.visibleArea.startRow);
        const y = (event.clientY - rect.top) + height;

        console.log(`X : ${x} Y: ${y}`)
    
        const colIndex = this.getPositionX(x);
        const rowIndex = this.getPositionY(y);
    
        const startRow = Math.floor(this.container.scrollTop / this.headerHeight);
        const endRow = Math.floor((this.container.scrollTop + this.container.clientHeight) / this.headerHeight);
    
        console.log(`Click at col: ${colIndex}, row: ${rowIndex}`);
        console.log(`Visible rows: ${startRow} to ${endRow}`);
    
        this.multiSelectState.data.clear();
    
        if (rowIndex >= startRow && rowIndex < Math.min(endRow, this.sampleData.length) && 
            colIndex > 0 && colIndex < this.headers.length) {
            
            this.multiSelectState.isSelecting = true;
            this.multiSelectState.startCell = { row: rowIndex, col: colIndex };
            this.multiSelectState.endCell = { row: rowIndex, col: colIndex };
    
            const cellKey = `${rowIndex+1}|${colIndex}`;
            this.multiSelectState.data.add(cellKey);
    
            window.requestAnimationFrame(() => {
                this.drawData(this.visibleArea); 
                this.drawHeader(this.visibleArea);
                this.drawRowCanvas(this.visibleArea);
               
            });
            this.lineDraw.drawExcel(this.headers,this.sampleData,this.visibleArea);
            
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
            let width = this.visibleArea.startCol < 0 ? 0: this.getCumulativeWidthTillColumn(this.visibleArea.startCol);
            const x = (event.clientX - rect.left ) + width;
            let height = 0;
            if(this.visibleArea.startRow < 0){
                height = 0;
            }else{
                height =  this.getCumulativeHeightTillRow(this.visibleArea.startRow);
            }
            const y = (event.clientY - rect.top ) + (height);
            
            // Calculate the column and row indices
            const colIndex = this.getPositionX(x);
            const rowIndex = this.getPositionY(y);

            const startRow = Math.floor(this.container.scrollTop / this.headerHeight);
            const endRow = Math.ceil((this.container.scrollTop + this.container.clientHeight) / this.headerHeight);

            if (rowIndex >= startRow && rowIndex < Math.min(endRow, this.sampleData.length) && 
            colIndex > 0 && colIndex < this.headers.length) {
        
                this.multiSelectState.endCell = { row: rowIndex, col: colIndex };
                const cellkey = `${rowIndex+1}|${colIndex}`;
                this.updateSelection();

                window.requestAnimationFrame(()=>{
                    this.drawData(this.visibleArea);
                    this.drawHeader(this.visibleArea);
                    this.drawRowCanvas(this.visibleArea);
                })
                this.lineDraw.drawExcel(this.headers,this.sampleData,this.visibleArea);
            }
        }
    }

    handleDataUp() {
        this.multiSelectState.isSelecting = false;
        
        this.calculateAndShowStats();
    }

    calculateAndShowStats() {
        const selectedValues = [];
        this.multiSelectState.data.forEach(cellKey => {
            const [row, col] = cellKey.split('|').map(Number);
            if (col > 0) { // Assuming the first column is row numbers
                
                const dataKey = this.dataHeaders[col - 1];
                const value = this.sampleData[row - 1][dataKey];
                if (Number.isInteger(value)) {
                    selectedValues.push(value);
                } else if (Date.parse(value)) {
                    const year = new Date(value).getFullYear();
                    selectedValues.push(year);
                } else {
                    // alert("Please ensure all selected values are integers or valid datetime values.");
                    console.log("Please ensure all selected values are integers or valid datetime values.")
                    return;
                }

            }
        });

        if (selectedValues.length > 0) {
            document.getElementById("stats").style.display = "block"
            const max = Math.max(...selectedValues);
            const min = Math.min(...selectedValues);
            const avg = selectedValues.reduce((sum, val) => sum + val, 0) / selectedValues.length;
            const median = this.calculateMedian(selectedValues);
            const mode = this.calculateMode(selectedValues);
            const total = selectedValues.reduce((sum, val) => sum + val, 0) ;

            document.getElementById('stats').innerHTML = `
                <div class="stat">Max: ${max}</div>
                <div class="stat">Min: ${min}</div>
                <div class="stat">Avg: ${avg.toFixed(2)}</div>
                <div class="stat">Median: ${median}</div>
                <div class="stat">Mode: ${mode}</div>
                <div class="stat">Sum: ${total}</div>
            `;
        }
    }

    calculateMedian(arr) {
        const sorted = arr.slice().sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    calculateMode(arr) {
        const freqMap = {};
        arr.forEach(val => {
            freqMap[val] = (freqMap[val] || 0) + 1;
        });
        const maxFreq = Math.max(...Object.values(freqMap));
        return arr.filter(val => freqMap[val] === maxFreq)[0];
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
            cumulativeHeight += this.sampleData[i].height;
            console.log(cumulativeHeight)
            if(y <= cumulativeHeight){
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
            this.drawTable(this.headers);
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
        const totalHeight = this.headerHeight + this.sampleData.reduce((sum,data)=>sum+data.height,30);

        this.childContainer.style.width = `${totalWidth}px`;
        this.childContainer.style.height = `${totalHeight}px`
    
        this.headerCanvas.width = this.container.clientWidth;
        this.headerCanvas.height = this.headerHeight;

        this.rowNumberCanvas.width = this.headers[0].width;
        this.rowNumberCanvas.height = this.container.clientHeight;

        //  data canvas fixed now
        this.dataCanvas.width = this.container.clientWidth;
        this.dataCanvas.height = this.container.clientHeight+this.headerHeight;
    }

    drawTable(headers,visibleArea) {
        console.log(`Visible Rows: ${visibleArea.startRow}`)
        window.requestAnimationFrame(() => {
            this.drawHeader(visibleArea);
            this.drawData(visibleArea);
            this.drawRowCanvas(visibleArea);
        });
        this.lineDraw.drawExcel(headers,this.sampleData,this.visibleArea);
    }
  
    handleMouseDown(event) {
        const rect = this.headerCanvas.getBoundingClientRect();
        const width = this.getCumulativeWidthTillColumn(this.visibleArea.startCol);
        const x = event.clientX - rect.left + width;
       
        const columnIndex = this.getColumnIndexAtX(x);
        if (columnIndex !== -1) {
            this.resizeState = {
                isResizing: true,
                columnIndex: columnIndex,
                startX: event.clientX,
                startScrollLeft:this.container.scrollLeft
            };
        }
    }

    handleRowMouseDown(event) {
        const rect = this.rowNumberCanvas.getBoundingClientRect();
        let height = 0;
        if(this.visibleArea.startRow < 0){
            height = 0;
        }else{
            height =  this.getCumulativeHeightTillRow(this.visibleArea.startRow);
        }
        const y = (event.clientY - rect.top ) + (height);
        // alert(y/this.headerHeight)
        // alert(y);
        const rowIndex = this.getColumnIndexAtY(y);
        
        // alert(`RowIndex: ${rowIndex}`);
        
        if (rowIndex !== -1) {
            console.log(this.sampleData[rowIndex])
            this.rowResizeState = {
                isResizing: true,
                rowIndex: rowIndex,
                startY: event.clientY,
                startScrollTop: this.container.scrollTop
            };
        }
    }

    handleMouseMove(event) {
        console.log(`Visible Area; ${this.visibleArea.startRow}`)
        if (this.resizeState.isResizing) {
            const currentScrollLeft = this.container.scrollLeft;
            const scrollDiff = currentScrollLeft - this.resizeState.startScrollLeft;
            const diff = (event.clientX - this.resizeState.startX)+ scrollDiff;
            const header = this.headers[this.resizeState.columnIndex];
            const newWidth = Math.max(
                header.minWidth,
                Math.min(header.maxWidth, header.width + diff)
            );
            // header.width = newWidth;
            this.headers[this.resizeState.columnIndex].width = newWidth
            this.resizeState.startX = event.clientX;
            this.resizeState.startScrollLeft = currentScrollLeft;

            console.log(this.headers)
            
            this.updateCanvasSizes();
            
            this.drawTable(this.headers,this.visibleArea);
        } else {
            const rect = this.headerCanvas.getBoundingClientRect();
            const width = this.getCumulativeWidthTillColumn(this.visibleArea.startCol);
            const x = event.clientX - rect.left + width;
            const columnIndex = this.getColumnIndexAtX(x);
            this.headerCanvas.style.cursor = columnIndex !== -1 ? 'col-resize' : 'default';
        }
    }

    
handleRowMouseMove(event) {
    if (this.rowResizeState.isResizing) {
        const currentScrollTop = this.container.scrollTop;
        const scrollDiff = currentScrollTop - this.rowResizeState.startScrollTop;
        const diff = (event.clientY - this.rowResizeState.startY) + scrollDiff;
        console.log(`Row diff: ${diff}`);

        const header = this.sampleData[this.rowResizeState.rowIndex];
        console.log(`Header ${header}`);
        console.log(header);

        const newHeight = Math.max(
            header.minHeight,
            Math.min(header.maxHeight, header.height + diff)
        );

        console.log(`New Height: ${newHeight}`);
        // header.height = newHeight;
        this.sampleData[this.rowResizeState.rowIndex].height = newHeight;

        // Update the start position for the next move event
        this.rowResizeState.startY = event.clientY;
        this.rowResizeState.startScrollTop = currentScrollTop;

        this.updateCanvasSizes();
        this.drawTable(this.headers, this.visibleArea);
    } else {
        // const rect = this.rowNumberCanvas.getBoundingClientRect();

        const rect = this.rowNumberCanvas.getBoundingClientRect();
        let height = 0;
        if(this.visibleArea.startRow < 0){
            height = 0;
        }else{
            height = this.getCumulativeHeightTillRow(this.visibleArea.startRow);
        }
        const y = (event.clientY - rect.top ) + (height);
        const rowIndex = this.getColumnIndexAtY(y);
        console.log(rowIndex);
    

    
        this.rowNumberCanvas.style.cursor = rowIndex !== -1 ? 'row-resize' : 'default';
    }
}

getCumulativeWidthTillColumn(startCol){
    let width = 0;
    for(let i=1;i<=startCol;i++){
        width += this.headers[i].width;
    }
    return width;
}


getCumulativeHeightTillRow(startRow){
    let height = 0;
    for(let i=1;i<=startRow;i++){
        height += this.sampleData[i].height;
    }
    return height;
}


    handleMouseUp() {
        this.resizeState.isResizing = false;
        // alert("I'm gone")
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

    getColumnIndexAtY(y,startRow=null) {
        let currentY = 30; // Assuming the header row is 30px tall
        // let currentY = 0;
        for (let i = 0; i < this.sampleData.length; i++) {
          
            
            currentY += this.sampleData[i].height;
            // if(y<=currentY){
            //     alert(i);
            // }
            
            if(Math.abs(currentY - y) <= this.resizeThreshold){
                return i;
            }
        }
        return -1;
    }

    calculateCumulativeWidths(){
            let sum = 0;
            return this.headers.map(header => sum += header.width);
    }

    drawRowCanvas(visibleArea = null) {
        // Clear the row canvas before drawing
        this.cRow.clearRect(0, 0, this.rowNumberCanvas.width, this.rowNumberCanvas.height);
        console.log(`Row Canvas ${visibleArea?.startRow} ${visibleArea?.endRow}`);
        let selectionBounds = { top: Infinity, left: Infinity, bottom: -Infinity, right: -Infinity };
    
        const updateSelectionBounds = (x, y, width, height) => {
            selectionBounds.top = Math.min(selectionBounds.top, y);
            selectionBounds.left = Math.min(selectionBounds.left, x);
            selectionBounds.bottom = Math.max(selectionBounds.bottom, y + height);
            selectionBounds.right = Math.max(selectionBounds.right, x + width);
        };
    
        let currentY = this.headerHeight;
    
        if (visibleArea) {
            for (let i = visibleArea.startRow; i <= visibleArea.endRow; i++) {
                const newHeight = this.sampleData[i].height ? this.sampleData[i].height : 30;
                new TableCell(0, currentY, this.headers[0].width, newHeight, i + 1, true).draw(this.cRow);
    
                if (this.multiSelectState.startCell && this.multiSelectState.endCell &&
                    ((i >= this.multiSelectState.startCell.row && i <= this.multiSelectState.endCell.row) ||
                     (i >= this.multiSelectState.endCell.row && i <= this.multiSelectState.startCell.row))) {
                    updateSelectionBounds(0, currentY, this.headers[0].width, newHeight);
                }
    
                currentY += newHeight;
            }
        } else {
            this.sampleData.forEach((data, rowIndex) => {
                const newHeight = data.height ? data.height : 30;
                new TableCell(0, currentY, this.headers[0].width, newHeight, rowIndex + 1, true).draw(this.cRow);
    
                if (this.multiSelectState.startCell && this.multiSelectState.endCell &&
                    rowIndex >= this.multiSelectState.startCell.row && rowIndex <= this.multiSelectState.endCell.row) {
                    updateSelectionBounds(0, currentY, this.headers[0].width, newHeight);
                }
    
                currentY += newHeight;
            });
        }
    
        if (selectionBounds.top !== Infinity) {
            this.cRow.fillStyle = "rgba(178, 222, 39, 0.3)";
            this.cRow.lineWidth = 2;
            this.cRow.fillRect(selectionBounds.left, selectionBounds.top, selectionBounds.right - selectionBounds.left, selectionBounds.bottom - selectionBounds.top);
        }
    }
    
    
    drawHeader(visibleArea = null) {
        this.cHeader.clearRect(0, 0, this.headerCanvas.width, this.headerCanvas.height);
       
        let selectionBounds = { top: Infinity, left: Infinity, bottom: -Infinity, right: -Infinity };
    
        const updateSelectionBounds = (colIndex, x, width, height) => {
            selectionBounds.left = Math.min(selectionBounds.left, x);
            selectionBounds.right = Math.max(selectionBounds.right, x + width);
            selectionBounds.top = 0;  // Headers are always at the top
            selectionBounds.bottom = height;
        };
    
        const startCol = visibleArea ? visibleArea.startCol : 0;
        const endCol = visibleArea ? visibleArea.endCol : this.headers.length - 1;

        let x = 0;
        // let x = this.headers.slice(0, startCol).reduce((sum, header) => sum + (header.width || 100), 0);

        for (let index = startCol+1; index < endCol; index++) {
            const header = this.headers[index];
            // alert(header)
            console.log(header); 
            const headerWidth = header.width || 100;
            console.log(`StartCol: ${startCol} & Width: ${this.headers[startCol].width} & Data: ${this.headers[startCol].data}`)
            // const roundedX = Math.round(x);

            new TableCell(x+100, 0, headerWidth, 30, header.data, true).draw(this.cHeader);

            if (this.multiSelectState.endCell && this.multiSelectState.startCell &&
                ((index >= this.multiSelectState.startCell.col && index <= this.multiSelectState.endCell.col) ||
                 (index >= this.multiSelectState.endCell.col && index <= this.multiSelectState.startCell.col))) {
                updateSelectionBounds(index, x+100, header.width, this.headerHeight);
            }

            x += headerWidth;
            
        }
       
    
        if (selectionBounds.left !== Infinity) {
            this.cHeader.fillStyle = "rgba(178, 222, 39,0.3)";
            this.cHeader.lineWidth = 2;
            this.cHeader.fillRect(selectionBounds.left + 0.5, selectionBounds.top + 0.5, selectionBounds.right - selectionBounds.left, selectionBounds.bottom - selectionBounds.top);
        }
    }
    
    drawData(visibleArea = null) {
        let x = 0;
        let selectionBounds = { top: Infinity, left: Infinity, bottom: -Infinity, right: -Infinity };
    
        const updateSelectionBounds = (rowIndex, colIndex, x, y, width, height) => {
            selectionBounds.top = Math.min(selectionBounds.top, y);
            selectionBounds.left = Math.min(selectionBounds.left, x);
            selectionBounds.bottom = Math.max(selectionBounds.bottom, y + height);
            selectionBounds.right = Math.max(selectionBounds.right, x + width);
        };
    
        if (visibleArea) {
            const startRow = visibleArea.startRow;
            const endRow = visibleArea.endRow;
            const startCol = visibleArea.startCol;
            const endCol = visibleArea.endCol;
    
            let currentY = this.headerHeight;
    
            for (let i = startRow; i <= endRow; i++) {
                x = 0;
                const newHeight = this.sampleData[i].height || 30;
    
                for (let colIndex = startCol+1; colIndex < endCol; colIndex++) {
                    const header = this.headers[colIndex];
                    const dataHeaderIndex = colIndex - 1; 
                    const dataKey = this.dataHeaders[dataHeaderIndex];
                    const cellValue = this.sampleData[i][dataKey] || ""; 
                    const color = this.multiSelectState.data.has(`${i + 1}|${colIndex}`) ? "rgba(178, 222, 39,0.5)" : null;
                    new TableCell(x+100, currentY, header.width, newHeight, cellValue).draw(this.cData, color);
    
                    if (color) {
                        updateSelectionBounds(i, colIndex, x+100, currentY, header.width, newHeight);
                    }
    
                    x += header.width;
                }
                currentY += newHeight;
            }
        } else {
            let currentY = this.headerHeight;
            this.sampleData.forEach((rowData, rowIndex) => {
                x = 0;
                const newHeight = rowData.height || 30;
    
                this.headers.forEach((header, colIndex) => {
                    const dataHeaderIndex = colIndex - 1; 
                    const dataKey = this.dataHeaders[dataHeaderIndex];
                    const cellValue = rowData[dataKey] || "";
                    const color = this.multiSelectState.data.has(`${rowIndex + 1}|${colIndex}`) ? "rgba(178, 222, 39,0.5)" : null;
                    new TableCell(x, currentY, header.width, newHeight, cellValue).draw(this.cData, color);
    
                    if (color) {
                        updateSelectionBounds(rowIndex, colIndex, x+100, currentY, header.width, newHeight);
                    }
    
                    x += header.width;
                });
                currentY += newHeight;
            });
        }
    
        // Draw the bounding rectangle for multi-selected cells
        if (selectionBounds.top !== Infinity) {
            this.cData.strokeStyle = "rgba(178, 222, 39,1)";
            this.cData.lineWidth = 2;
            this.cData.strokeRect(selectionBounds.left + 0.5, selectionBounds.top + 0.5, selectionBounds.right - selectionBounds.left, selectionBounds.bottom - selectionBounds.top);
        }
    }

    drawInput(xcord, ycord, cellKey, rowIndex, width) {
        // Remove any existing input elements
        const existingInput = document.getElementById('canvas-input');
        if (existingInput) {
            existingInput.remove();
        }

        let value = this.sampleData[rowIndex][cellKey] ? this.sampleData[rowIndex][cellKey] : "";
        // Create a new input element
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'canvas-input';
        input.value = value; // Set the initial value of the input
        input.style.position = 'absolute';
        input.style.zIndex = '4';
        input.style.left = `${xcord+7}px`;
        input.style.top = `${ycord}px`;
        input.style.width = `${width-5}px`;
        input.style.height = `${this.sampleData[rowIndex].height-5}px`; // Assuming you have a defined cell height
        input.style.zIndex = '3'; // Ensure it appears above the canvas
    
        // Add event listeners to handle input interactions
        input.addEventListener('blur', () => {
            // Save the new value to sampleData when the input loses focus
            this.sampleData[rowIndex][cellKey] = input.value;
            input.remove();
            // Redraw the cell with the updated value
            this.drawTable(this.headers,this.visibleArea);
            alert("Updated")
            this.editData(this.sampleData[rowIndex]);
        });
    
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                // Save the new value to sampleData when Enter key is pressed
                this.sampleData[rowIndex][cellKey] = input.value;
                input.remove();
                // Redraw the cell with the updated value
                this.drawTable(this.headers,this.visibleArea);
                alert("Updated")
                this.editData(this.sampleData[rowIndex]);
            }
        });
    
        document.body.appendChild(input);
    
        input.focus();
    }

    async editData(data){
        try{
             await axios.post("http://localhost:5103/api/check/update",data);
            //  alert("Success")
        }catch(error){
            // alert(error);
            alert(error?.response?.data?.errors[0])
            console.log(error);
        }
    }
    
    
    
    handleScroll() {
        const scrollLeft = this.container.scrollLeft;
        const scrollTop = this.container.scrollTop;

        this.rowNumberCanvas.style.top = `${scrollTop}px`
        this.rowNumberCanvas.style.left = `${scrollLeft}px`;

        this.headerCanvas.style.top = `${scrollTop}px`;
        this.headerCanvas.style.left = `${scrollLeft}px`;

        this.dataCanvas.style.top = `${scrollTop}px`
        this.dataCanvas.style.left = `${scrollLeft}px`;

        console.log(`ScrollTop: ${30 * this.visibleArea.startRow}`)


        const scrollDirection = scrollTop > this.lastScrollTop ? 'down' : 'up';
        console.log(scrollDirection);
       
        this.updateVisibleArea(scrollLeft, scrollTop,scrollDirection);
    }

getVisibleArea(scrollX, scrollY) {
    // For rows
    const startRow = Math.floor(scrollY / this.headerHeight);
    const endRow = Math.min(Math.ceil((scrollY + this.container.clientHeight) / this.headerHeight), this.sampleData.length - 1);
    console.log(`ScrollX : ${scrollX}`)

    // For columns
    let accumulatedWidth = 0;
    let startCol = 0;
    let endCol = 0;

    for (let i = 1; i < this.headers.length; i++) {
        const columnWidth = this.headers[i].width || 100;
        if (scrollX >= accumulatedWidth + columnWidth) {
            startCol = i ;
        } else {
            break;
        }
        accumulatedWidth += columnWidth;
    }

    // Find endCol
    accumulatedWidth = 0;
    for (let i = 1; i < this.headers.length; i++) {
        const columnWidth = this.headers[i].width || 100;
        accumulatedWidth += columnWidth;
        if (accumulatedWidth >  scrollX + this.container.clientWidth) {
            endCol = i+1;
            break;
        }
    }
    // If we haven't found an endCol, set it to the last column
    if (endCol === 0) endCol = this.headers.length - 1;

    return { startRow, endRow, startCol, endCol };
}


   async updateVisibleArea(scrollLeft, scrollTop, scrollDirection) {
    this.visibleArea = this.getVisibleArea(scrollLeft, scrollTop);
    console.log(this.visibleArea);

    console.log(`StartRow: `);
    console.log(this.sampleData[this.visibleArea.startRow]);
    console.log(`StartCol:`);
    console.log(this.sampleData[this.visibleArea.startRow]);

    console.log(`Scroll Height: ${this.childContainer.scrollHeight}`);

    if (scrollDirection === "up") {
        console.log(this.visibleArea);
        if (scrollTop <= this.headerHeight) {
            // will optimize the sampleData
        }
    } else if (scrollDirection === "down") {
        if (!this.isLoading && scrollTop + this.container.clientHeight  >= (this.sampleData.length * this.headerHeight) - 300) {
            console.log("");
            console.log("=========");
            console.log("=========");
            console.log("Scrolled down");
            console.log("=========");
            console.log("=========");
            console.log("");
            this.isLoading = true; // Set loading flag to true
            this.batchStart += 50;

            try {
                const data = await this.getData(this.batchStart);

                if (data.length > 0) {
                    data.forEach((d) => {
                        this.sampleData.push({
                            ...d,
                            height: 30,
                            minHeight: 10,
                            maxHeight: 60
                        });
                    });
                } else {
                    this.addRows();
                }

                this.updateCanvasSizes(scrollTop);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                this.isLoading = false; // Reset loading flag
            }
        }
    }

    if (scrollLeft + this.container.clientWidth >= this.childContainer.clientWidth) {
        // alert("added columns")
        this.addColumns();
    }

    window.requestAnimationFrame(() => {
        this.drawHeader(this.visibleArea);
        this.drawData(this.visibleArea);
        this.drawRowCanvas(this.visibleArea);
    });

    this.lineDraw.drawExcel(this.headers, this.sampleData, this.visibleArea);
}


    getRowIndexAtY(y) {
        let cumulativeHeight = this.headerHeight;
        for (let i = 0; i < this.sampleData.length; i++) {
            cumulativeHeight += this.sampleData[i].height
            if (cumulativeHeight > y) {
                return i;
            }
        }
        return this.sampleData.length - 1;
    }

    getColIndexAtX(x) {
        let cumulativeWidth = 0;
        for (let i = 0; i < this.headers.length; i++) {
            cumulativeWidth += this.headers[i].width;
            if (cumulativeWidth > x) {
                return i;
            }
        }
        return this.headers.length - 1;
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
        for (let i = 0; i < 50; i++) {
            // let row = {};
            
            this.sampleData.push({
                id:"",
                emailId:"",
                name:"",
                country:"",
                state:"",
                city:"",
                telephoneNumber:"",
                addressLine1:"",
                addressLine2:"",
                dateOfBirth:"",
                fY2019_20:"",
                fY2020_21:"",
                fY2021_22:"",
                fY2022_23:"",
                fY2023_24:"",
                height:30,minHeight:10,maxHeight:60
            });
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
    
    
    
        // Redraw the table with the new column
        this.updateCanvasSizes();
    }
    
    handleDbClick(event) {
        const rect = this.dataCanvas.getBoundingClientRect();
        let widthTillCol = this.getCumulativeWidthTillColumn(this.visibleArea.startCol);
        let heightTillRow = this.getCumulativeHeightTillRow(this.visibleArea.startRow);
        let width = (this.visibleArea.startCol) < 0 ? 0: widthTillCol;
        const x = (event.clientX - rect.left ) + width;
        let height = this.visibleArea.startRow < 0 ? 0 :heightTillRow ;
        const y = (event.clientY - rect.top) + height;

        console.log(`X : ${x} Y: ${y}`)

        const colIndex = this.getPositionX(x);
        const rowIndex = this.getPositionY(y);

        console.log(`RowIndex: ${rowIndex} ColIndex: ${colIndex}`)
        // return;

        const startRow = Math.floor(this.container.scrollTop / this.headerHeight);
        const endRow = Math.floor((this.container.scrollTop + this.container.clientHeight) / this.headerHeight);
    
    
        if (rowIndex >= startRow && rowIndex < Math.min(endRow, this.sampleData.length) && 
        colIndex > 0 && colIndex < this.headers.length) {

            const xcord = this.getCumulativeWidthTillColumn(colIndex-1)-widthTillCol+100;
            let ycord = 0;
            if(rowIndex > 0){
                ycord =  this.getCumulativeHeightTillRow(rowIndex-1)+this.headerHeight + this.headerHeight - heightTillRow + 90;
            }else{
                alert("Can't change headers")
                return;
            }
            

            // alert(`XCord; ${xcord} YCord: ${ycord}`)
            // return;
            const cellValue = this.sampleData[rowIndex][this.dataHeaders[colIndex-1]];
            // alert(cellValue)
            console.log(`Selected Cell: ${cellValue}`)
            this.drawInput(xcord, ycord, this.dataHeaders[colIndex-1], rowIndex , this.headers[colIndex].width);
        }
    }

    async getData(batchStart){
            try{
                // this.status.textContent = "Loading data..."
                const res = await fetch(`http://localhost:5103/api/check/data/${batchStart}/${this.sortingState.columnName}/${this.sortingState.sortOrder}`);
                const response = await res.json();
                // console.log(response.data);
                return response.data;
            }catch(error){
                console.log(error);
                return [];
            }finally{
                // this.status.textContent = "";
            }
    }

   
   
}


window.onload = async function () {
    const headerss = [
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
    
    let batchStart = 0;
    let sortingState = {
        columnName: "id",
        sortOrder: "asc"
    }

    async function getData(){
        try{
            const res = await fetch(`http://localhost:5103/api/check/data/${batchStart}/${sortingState.columnName}/${sortingState.sortOrder}`);
            const response = await res.json();
            // console.log(response.data);
            return response.data;
        }catch(error){
            console.log(error);
            return [];
        }
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

    const headers = headerss.map((header) => ({
        ...header,
        width: header.width || 100,
        minWidth: header.minWidth || 50,
        maxWidth: header.maxWidth || 500
    }));
    
    
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
            height:30,
            minHeight:10,
            maxHeight:60
        },...data];
    }else{
        for (let i = 0; i < 30; i++) {
            
            
            sampleData.push(
                {
                    id:"",
                    emailId:"",
                    name:"",
                    country:"",
                    state:"",
                    city:"",
                    telephoneNumber:"",
                    addressLine1:"",
                    addressLine2:"",
                    dateOfBirth:"",
                    fY2019_20:"",
                    fY2020_21:"",
                    fY2021_22:"",
                    fY2022_23:"",
                    fY2023_24:"",
                    height:30,
                    minHeight:10,
                    maxHeight:60
                }
            );
        }
    }

    
    console.log(sampleData);
    new CanvasTable('canvasContainer', headers,dataHeaders,sampleData)
    const lineDraw = new LineDrawer(100,30);
    // lineDraw.drawExcel(headers);
   

}
